import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { authenticatePublisher } from '@/lib/auth'

/**
 * POST /api/v1/publisher/apps/:slug/refresh
 * 
 * Manually trigger re-fetch of intent map from the published URL.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const publisher = await authenticatePublisher(request)
  if (!publisher) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params

  try {
    const { data: app, error: appError } = await supabaseAdmin
      .from('apps')
      .select('id, publisher_id, intent_map_url, intent_map_hash')
      .eq('slug', slug)
      .single()

    if (appError || !app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    if (app.publisher_id !== publisher.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch intent map
    let raw: string
    let intentMapData: any
    let hash: string

    try {
      const res = await fetch(app.intent_map_url, { signal: AbortSignal.timeout(10000) })
      if (!res.ok) {
        await supabaseAdmin.from('apps').update({
          last_checked_at: new Date().toISOString(),
          last_check_ok: false,
        }).eq('id', app.id)

        await supabaseAdmin.from('registry_events').insert({
          publisher_id: publisher.id,
          app_id: app.id,
          event_type: 'check_fail',
          metadata: { status: res.status },
        })

        return NextResponse.json(
          { error: `Intent map fetch failed: ${res.status}` },
          { status: 502 }
        )
      }

      raw = await res.text()
      intentMapData = JSON.parse(raw)

      const encoder = new TextEncoder()
      const data = encoder.encode(raw)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } catch (fetchErr) {
      return NextResponse.json(
        { error: `Failed to fetch intent map: ${fetchErr}` },
        { status: 502 }
      )
    }

    const changed = hash !== app.intent_map_hash

    if (changed) {
      // Update app
      await supabaseAdmin.from('apps').update({
        raw_intent_map: intentMapData,
        intent_map_hash: hash,
        last_checked_at: new Date().toISOString(),
        last_check_ok: true,
        total_intents: intentMapData.intents?.length || 0,
        updated_at: new Date().toISOString(),
      }).eq('id', app.id)

      // Rebuild intents
      await supabaseAdmin.from('intents').delete().eq('app_id', app.id)
      if (intentMapData.intents?.length > 0) {
        await supabaseAdmin.from('intents').insert(
          intentMapData.intents.map((intent: any) => ({
            app_id: app.id,
            intent_id: intent.id,
            name: intent.name,
            description: intent.description,
            triggers: intent.triggers || [],
            category: intent.category,
            method: intent.method,
            endpoint: intent.endpoint,
            parameters: intent.parameters || {},
            returns: intent.returns || null,
            errors: intent.errors || null,
            requires_auth: intent.requires_auth || false,
            destructive: intent.destructive || false,
            confirmation_required: intent.confirmation_required || false,
            rate_limit: intent.rate_limit || null,
          }))
        )
      }

      await supabaseAdmin.from('registry_events').insert({
        publisher_id: publisher.id,
        app_id: app.id,
        event_type: 'hash_changed',
        metadata: { old_hash: app.intent_map_hash, new_hash: hash },
      })
    } else {
      await supabaseAdmin.from('apps').update({
        last_checked_at: new Date().toISOString(),
        last_check_ok: true,
      }).eq('id', app.id)

      await supabaseAdmin.from('registry_events').insert({
        publisher_id: publisher.id,
        app_id: app.id,
        event_type: 'check_ok',
        metadata: {},
      })
    }

    // Update publisher stats
    await supabaseAdmin.rpc('update_publisher_stats', { pub_id: publisher.id })

    return NextResponse.json({
      message: changed ? 'Intent map updated' : 'No changes detected',
      changed,
      intents_count: intentMapData.intents?.length || 0,
    })
  } catch (err) {
    console.error('Refresh error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
