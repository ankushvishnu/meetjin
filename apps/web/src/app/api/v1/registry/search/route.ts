import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/v1/registry/search
 * 
 * Search for intents by natural language query.
 * Primary endpoint for agent consumers.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const query = searchParams.get('q')
  if (!query) {
    return NextResponse.json(
      { error: 'Missing required parameter: q' },
      { status: 400 }
    )
  }

  const category = searchParams.get('category') || null
  const verified = searchParams.get('verified')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const { data, error } = await supabaseAdmin.rpc('search_intents', {
      query,
      filter_category: category,
      filter_verified: verified !== null ? verified === 'true' : null,
      result_limit: limit,
      result_offset: offset,
    })

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    // Transform results into the API response format
    const results = (data || []).map((row: any) => ({
      app: {
        id: row.app_uuid,
        name: row.app_name,
        slug: row.app_slug,
        logo_url: row.app_logo,
        is_verified: row.is_verified,
        is_community: row.is_community,
      },
      intent: {
        id: row.intent_id,
        name: row.intent_name,
        description: row.description,
        triggers: row.triggers,
        category: row.category,
        requires_auth: row.requires_auth,
        destructive: row.destructive,
      },
      match_score: row.match_rank,
    }))

    return NextResponse.json({
      query,
      total: results.length,
      limit,
      offset,
      results,
    })
  } catch (err) {
    console.error('Search error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
