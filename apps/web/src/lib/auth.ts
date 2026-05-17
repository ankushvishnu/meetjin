import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Authenticate a publisher by API key from Authorization header.
 * Returns the publisher record or null.
 */
export async function authenticatePublisher(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const apiKey = authHeader.slice(7)

  const { data, error } = await supabaseAdmin
    .from('publishers')
    .select('*')
    .eq('api_key', apiKey)
    .eq('is_suspended', false)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

/**
 * Generate a URL-safe slug from an app name.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
