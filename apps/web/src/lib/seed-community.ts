import { supabaseAdmin } from './supabase'
import apis from '../data/community-apis'

/**
 * Script to seed community APIs into the registry.
 * This should be run once or as part of a migration.
 */
export async function seedCommunityApis() {
  console.log('🚀 Starting community API seeding...')

  // 1. Ensure anonymous publisher exists
  let { data: anonPub } = await supabaseAdmin
    .from('publishers')
    .select('id')
    .eq('email', 'anonymous@meetjin.com')
    .single()

  if (!anonPub) {
    const { data: newPub, error: pubError } = await supabaseAdmin
      .from('publishers')
      .insert({
        name: 'Community Registry',
        email: 'anonymous@meetjin.com',
        plan: 'free',
        is_verified: true,
      })
      .select('id')
      .single()

    if (pubError) {
      console.error('❌ Failed to create community publisher:', pubError)
      return
    }
    anonPub = newPub
  }

  const publisherId = anonPub.id

  for (const api of apis) {
    console.log(`📦 Seeding ${api.name} (${api.slug})...`)

    // Check if already exists
    const { data: existing } = await supabaseAdmin
      .from('apps')
      .select('id')
      .eq('slug', api.slug)
      .single()

    if (existing) {
      console.log(`⏭️  ${api.name} already exists, skipping.`)
      continue
    }

    // Insert app
    const { data: app, error: appError } = await supabaseAdmin
      .from('apps')
      .insert({
        name: api.name,
        slug: api.slug,
        description: api.description,
        url: api.baseUrl,
        logo_url: null, // Community APIs don't have logos in the data
        categories: [api.category],
        is_community: true,
        is_verified: true,
        is_active: true,
        publisher_id: publisherId,
        intent_map_url: api.intentMapUrl,
        total_intents: api.intents.length,
      })
      .select()
      .single()

    if (appError) {
      console.error(`❌ Failed to seed app ${api.name}:`, appError)
      continue
    }

    // Seed intents
    const intentsToInsert = api.intents.map(intent => ({
      app_id: app.id,
      intent_id: intent.id,
      name: intent.name,
      description: intent.description,
      triggers: intent.triggers,
      category: intent.category,
      method: intent.method,
      endpoint: intent.endpoint,
      parameters: intent.parameters,
      requires_auth: intent.requires_auth,
      destructive: intent.destructive,
      confirmation_required: intent.confirmation_required,
    }))

    const { error: intentError } = await supabaseAdmin
      .from('intents')
      .insert(intentsToInsert)

    if (intentError) {
      console.error(`❌ Failed to seed intents for ${api.name}:`, intentError)
    } else {
      console.log(`✅ Successfully seeded ${api.name} with ${api.intents.length} intents.`)
    }
  }

  console.log('✨ Community API seeding complete!')
}
