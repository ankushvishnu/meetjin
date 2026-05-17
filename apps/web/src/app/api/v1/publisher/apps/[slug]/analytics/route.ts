import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { authenticatePublisher } from '@/lib/auth'

/**
 * GET /api/v1/publisher/apps/:slug/analytics
 * 
 * Get agent usage analytics for your app.
 */
export async function GET(
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
      .select('id, publisher_id, agent_hits, unique_agents')
      .eq('slug', slug)
      .single()

    if (appError || !app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    if (app.publisher_id !== publisher.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get top intents by match count
    const { data: topIntents } = await supabaseAdmin
      .from('intents')
      .select('intent_id, match_count, execute_count')
      .eq('app_id', app.id)
      .order('match_count', { ascending: false })
      .limit(10)

    // Get recent matches for this app
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentMatches } = await supabaseAdmin
      .from('intent_matches')
      .select('created_at')
      .eq('app_id', app.id)
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Aggregate hits by day
    const hitsByDay: Record<string, number> = {}
    for (const match of recentMatches || []) {
      const day = match.created_at.split('T')[0]
      hitsByDay[day] = (hitsByDay[day] || 0) + 1
    }

    return NextResponse.json({
      period: '30d',
      total_hits: app.agent_hits,
      unique_agents: app.unique_agents,
      top_intents: (topIntents || []).map((i: any) => ({
        intent_id: i.intent_id,
        hits: i.match_count,
      })),
      hits_by_day: Object.entries(hitsByDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, hits]) => ({ date, hits })),
    })
  } catch (err) {
    console.error('Analytics error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
