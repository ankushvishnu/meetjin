import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { authenticatePublisher } from '@/lib/auth'

/**
 * PUT /api/v1/publisher/apps/:slug
 * 
 * Update an existing app. Triggers re-fetch of intent map.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const publisher = await authenticatePublisher(request)
  if (!publisher) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params

  try {
    // Verify ownership
    const { data: app, error: appError } = await supabaseAdmin
      .from('apps')
      .select('id, publisher_id, intent_map_url')
      .eq('slug', slug)
      .single()

    if (appError || !app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    if (app.publisher_id !== publisher.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const updates: Record<string, any> = { updated_at: new Date().toISOString() }

    if (body.name) updates.name = body.name
    if (body.description) updates.description = body.description
    if (body.logo_url) updates.logo_url = body.logo_url
    if (body.contact_email) updates.contact_email = body.contact_email
    if (body.intent_map_url) updates.intent_map_url = body.intent_map_url

    const { error: updateError } = await supabaseAdmin
      .from('apps')
      .update(updates)
      .eq('id', app.id)

    if (updateError) {
      console.error('App update error:', updateError)
      return NextResponse.json({ error: 'Failed to update app' }, { status: 500 })
    }

    // Log event
    await supabaseAdmin.from('registry_events').insert({
      publisher_id: publisher.id,
      app_id: app.id,
      event_type: 'update',
      metadata: { fields_updated: Object.keys(updates) },
    })

    return NextResponse.json({ message: 'App updated', slug })
  } catch (err) {
    console.error('App update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/v1/publisher/apps/:slug
 * 
 * Remove app from registry. Soft delete.
 */
export async function DELETE(
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
      .select('id, publisher_id')
      .eq('slug', slug)
      .single()

    if (appError || !app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    if (app.publisher_id !== publisher.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete — mark as inactive
    await supabaseAdmin
      .from('apps')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', app.id)

    // Log event
    await supabaseAdmin.from('registry_events').insert({
      publisher_id: publisher.id,
      app_id: app.id,
      event_type: 'delete',
      metadata: {},
    })

    // Update publisher stats
    await supabaseAdmin.rpc('update_publisher_stats', { pub_id: publisher.id })

    return NextResponse.json({ message: 'App removed from registry', slug })
  } catch (err) {
    console.error('App delete error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
