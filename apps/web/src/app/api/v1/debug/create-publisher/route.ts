import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Create a mock publisher
    const { data, error } = await supabaseAdmin
      .from('publishers')
      .insert({
        name: 'Test Publisher',
        email: 'test@example.com',
        website: 'https://example.com',
      })
      .select('api_key')
      .single()

    if (error) {
      console.error('Failed to create publisher:', error)
      return NextResponse.json({ error: 'Failed to create publisher', details: error }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Publisher created successfully', 
      api_key: data.api_key 
    })
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
