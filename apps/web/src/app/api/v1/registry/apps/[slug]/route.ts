import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/v1/registry/apps/:slug
 * 
 * Get full details for a specific app including all intents.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    // Fetch app
    const { data: app, error: appError } = await supabaseAdmin
      .from('apps')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (appError || !app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    // Fetch intents for this app
    const { data: intents, error: intentsError } = await supabaseAdmin
      .from('intents')
      .select('intent_id, name, description, triggers, category, method, endpoint, parameters, returns, errors, requires_auth, destructive, confirmation_required, rate_limit, match_count, execute_count')
      .eq('app_id', app.id)

    if (intentsError) {
      console.error('Intents fetch error:', intentsError)
    }

    // Increment hit counter
    await supabaseAdmin.rpc('increment_app_hits', { app_uuid: app.id })

    return NextResponse.json({
      id: app.id,
      name: app.name,
      slug: app.slug,
      description: app.description,
      url: app.url,
      logo_url: app.logo_url,
      categories: app.categories,
      is_verified: app.is_verified,
      is_community: app.is_community,
      aip_version: app.aip_version,
      intent_map_url: app.intent_map_url,
      agent_hits: app.agent_hits,
      published: app.created_at,
      last_checked_at: app.last_checked_at,
      intents: (intents || []).map((i: any) => ({
        id: i.intent_id,
        name: i.name,
        description: i.description,
        triggers: i.triggers,
        category: i.category,
        method: i.method,
        endpoint: i.endpoint,
        parameters: i.parameters,
        returns: i.returns,
        errors: i.errors,
        requires_auth: i.requires_auth,
        destructive: i.destructive,
        confirmation_required: i.confirmation_required,
        rate_limit: i.rate_limit,
        match_count: i.match_count,
        execute_count: i.execute_count,
      })),
    })
  } catch (err) {
    console.error('App detail error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
