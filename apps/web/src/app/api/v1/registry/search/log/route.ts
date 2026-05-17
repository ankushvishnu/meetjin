import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * POST /api/v1/registry/search/log
 * 
 * Agent consumers call this to log a search session.
 * Used for registry analytics. No auth required but rate limited.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { agent_id, agent_version, jin_version, query, category, results_count } = body

    if (!query) {
      return NextResponse.json({ error: 'Missing required field: query' }, { status: 400 })
    }

    // Hash the IP for anonymised attribution
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
    const encoder = new TextEncoder()
    const data = encoder.encode(ip + (process.env.IP_HASH_SALT || 'jin-salt'))
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const ipHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    const { data: session, error } = await supabaseAdmin
      .from('agent_sessions')
      .insert({
        agent_id: agent_id || null,
        agent_version: agent_version || null,
        jin_version: jin_version || null,
        query,
        category: category || null,
        results_count: results_count || null,
        ip_hash: ipHash,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Search log error:', error)
      return NextResponse.json({ error: 'Failed to log session' }, { status: 500 })
    }

    return NextResponse.json({ session_id: session.id })
  } catch (err) {
    console.error('Search log error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
