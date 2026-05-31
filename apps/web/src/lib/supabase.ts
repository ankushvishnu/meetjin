import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

// Only enforce the service role key when executing on the server side
if (typeof window === 'undefined' && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

/**
 * Supabase client with service role key — for server-side API routes only.
 * This bypasses RLS and should NEVER be exposed to the browser.
 */
export const supabaseAdmin = typeof window === 'undefined'
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
  : (null as any)

/**
 * Supabase client with anon key — safe for public read operations.
 */
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)
