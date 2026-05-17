import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/v1/registry/categories
 * 
 * List all categories with intent and app counts.
 */
export async function GET() {
  try {
    // Get app counts per category
    const { data: apps, error: appsError } = await supabaseAdmin
      .from('apps')
      .select('categories')
      .eq('is_active', true)

    // Get intent counts per category
    const { data: intents, error: intentsError } = await supabaseAdmin
      .from('intents')
      .select('category')

    if (appsError || intentsError) {
      console.error('Categories error:', appsError || intentsError)
      return NextResponse.json({ error: 'Failed to list categories' }, { status: 500 })
    }

    // Aggregate counts
    const categoryLabels: Record<string, string> = {
      commerce: 'Commerce',
      travel: 'Travel',
      productivity: 'Productivity',
      communication: 'Communication',
      finance: 'Finance',
      identity: 'Identity',
      healthcare: 'Healthcare',
      legal: 'Legal',
      government: 'Government',
      education: 'Education',
      media: 'Media',
      developer: 'Developer',
      data: 'Data',
      social: 'Social',
      local: 'Local',
    }

    const appCounts: Record<string, number> = {}
    const intentCounts: Record<string, number> = {}

    for (const app of apps || []) {
      for (const cat of app.categories || []) {
        appCounts[cat] = (appCounts[cat] || 0) + 1
      }
    }

    for (const intent of intents || []) {
      intentCounts[intent.category] = (intentCounts[intent.category] || 0) + 1
    }

    const categories = Object.entries(categoryLabels)
      .map(([id, label]) => ({
        id,
        label,
        app_count: appCounts[id] || 0,
        intent_count: intentCounts[id] || 0,
      }))
      .filter(c => c.app_count > 0 || c.intent_count > 0)

    return NextResponse.json({ categories })
  } catch (err) {
    console.error('Categories error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
