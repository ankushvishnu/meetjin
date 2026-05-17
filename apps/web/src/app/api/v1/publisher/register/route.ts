import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, website } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'name and email are required' },
        { status: 400 }
      )
    }

    // Check if publisher already exists
    const { data: existing } = await supabaseAdmin
      .from('publishers')
      .select('api_key')
      .eq('email', email)
      .single()

    if (existing) {
      // Return existing API key
      return NextResponse.json({
        message: 'Publisher already registered',
        api_key: existing.api_key,
      })
    }

    // Create new publisher
    const { data, error } = await supabaseAdmin
      .from('publishers')
      .insert({
        name,
        email,
        website: website || null,
      })
      .select('api_key')
      .single()

    if (error) {
      console.error('Failed to create publisher:', error)
      return NextResponse.json(
        { error: 'Failed to create publisher' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Publisher registered successfully',
      api_key: data.api_key,
    }, { status: 201 })
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
