import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * POST /api/v1/waitlist
 * 
 * Join the meetjin.com waitlist.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { email, role, notes } = body

    if (!email) {
      return NextResponse.json({ error: 'Missing required field: email' }, { status: 400 })
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const referrer = request.headers.get('referer') || null

    const { error } = await supabaseAdmin
      .from('waitlist')
      .insert({
        email,
        role: role || null,
        notes: notes || null,
        referrer,
      })

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation — already on waitlist
        return NextResponse.json({ message: 'Already on waitlist' }, { status: 200 })
      }
      console.error('Waitlist error:', error)
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Added to waitlist' }, { status: 201 })
  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
