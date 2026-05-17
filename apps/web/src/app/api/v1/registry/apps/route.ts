import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/v1/registry/apps
 * 
 * List all apps in the registry.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const category = searchParams.get('category')
  const verified = searchParams.get('verified')
  const community = searchParams.get('community')
  const sort = searchParams.get('sort') || 'agent_hits'
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    let query = supabaseAdmin
      .from('apps')
      .select('id, name, slug, description, url, logo_url, categories, total_intents, agent_hits, is_verified, is_community, aip_version, created_at')
      .eq('is_active', true)

    if (category) {
      query = query.contains('categories', [category])
    }
    if (verified !== null && verified !== undefined) {
      query = query.eq('is_verified', verified === 'true')
    }
    if (community === 'false') {
      query = query.eq('is_community', false)
    }

    // Sorting
    const sortColumn = ['agent_hits', 'created_at', 'name'].includes(sort) ? sort : 'agent_hits'
    const ascending = sort === 'name'
    query = query.order(sortColumn, { ascending })

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Apps list error:', error)
      return NextResponse.json({ error: 'Failed to list apps' }, { status: 500 })
    }

    return NextResponse.json({
      total: count || (data?.length ?? 0),
      results: data || [],
    })
  } catch (err) {
    console.error('Apps list error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
