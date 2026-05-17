import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { authenticatePublisher, slugify } from '@/lib/auth'

/**
 * POST /api/v1/publisher/apps
 * 
 * Publish a new app to the registry.
 */
export async function POST(request: NextRequest) {
  const publisher = await authenticatePublisher(request)
  if (!publisher) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, url, description, logo_url, contact_email, intent_map_url, is_community } = body

    if (!name || !url || !intent_map_url) {
      return NextResponse.json(
        { error: 'Missing required fields: name, url, intent_map_url' },
        { status: 400 }
      )
    }

    // Fetch and validate the intent map
    let intentMapData: any
    let intentMapHash: string
    try {
      const res = await fetch(intent_map_url, { signal: AbortSignal.timeout(10000) })
      if (!res.ok) {
        return NextResponse.json(
          { error: `Cannot fetch intent map at ${intent_map_url}: ${res.status}` },
          { status: 400 }
        )
      }
      const raw = await res.text()
      intentMapData = JSON.parse(raw)

      // Compute SHA-256 hash
      const encoder = new TextEncoder()
      const data = encoder.encode(raw)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      intentMapHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } catch (fetchErr) {
      return NextResponse.json(
        { error: `Failed to fetch or parse intent map: ${fetchErr}` },
        { status: 400 }
      )
    }

    // Validate basic AIP structure
    if (!intentMapData.aip_version || !intentMapData.intents || !Array.isArray(intentMapData.intents)) {
      return NextResponse.json(
        { error: 'Invalid intent map: missing aip_version or intents array' },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = slugify(name)

    // Extract categories from intents
    const categories = [...new Set(intentMapData.intents.map((i: any) => i.category).filter(Boolean))]

    // Create app
    const { data: app, error: appError } = await supabaseAdmin
      .from('apps')
      .insert({
        publisher_id: publisher.id,
        name,
        slug,
        description: description || intentMapData.app?.description || null,
        url,
        logo_url: logo_url || null,
        contact_email: contact_email || null,
        aip_version: intentMapData.aip_version,
        intent_map_url,
        intent_map_hash: intentMapHash,
        raw_intent_map: intentMapData,
        categories,
        is_community: is_community || false,
        total_intents: intentMapData.intents.length,
        last_checked_at: new Date().toISOString(),
        last_check_ok: true,
      })
      .select('id, slug')
      .single()

    if (appError) {
      if (appError.code === '23505') {
        return NextResponse.json(
          { error: `App with slug "${slug}" already exists` },
          { status: 409 }
        )
      }
      console.error('App create error:', appError)
      return NextResponse.json({ error: 'Failed to create app' }, { status: 500 })
    }

    // Insert intents
    if (intentMapData.intents.length > 0) {
      const intentRows = intentMapData.intents.map((intent: any) => ({
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

      const { error: intentsError } = await supabaseAdmin
        .from('intents')
        .insert(intentRows)

      if (intentsError) {
        console.error('Intents insert error:', intentsError)
      }
    }

    // Log event
    await supabaseAdmin.from('registry_events').insert({
      publisher_id: publisher.id,
      app_id: app.id,
      event_type: 'publish',
      metadata: { intents_count: intentMapData.intents.length },
    })

    // Update publisher stats
    await supabaseAdmin.rpc('update_publisher_stats', { pub_id: publisher.id })

    return NextResponse.json({
      id: app.id,
      slug: app.slug,
      registry_url: `https://meetjin.com/registry/${app.slug}`,
      status: 'published',
      intents_imported: intentMapData.intents.length,
    }, { status: 201 })
  } catch (err) {
    console.error('Publish error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
