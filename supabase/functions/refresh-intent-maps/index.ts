import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHash } from 'https://deno.land/std@0.224.0/crypto/mod.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async () => {
  // Get all active apps
  const { data: apps } = await supabase
    .from('apps')
    .select('id, intent_map_url, intent_map_hash, publisher_id')
    .eq('is_active', true)

  if (!apps) return new Response('No apps', { status: 200 })

  let checked = 0
  let updated = 0
  let failed = 0

  for (const app of apps) {
    try {
      // Fetch current intent map
      const res = await fetch(app.intent_map_url, {
        signal: AbortSignal.timeout(10000)
      })

      if (!res.ok) {
        await supabase.from('apps').update({
          last_checked_at: new Date().toISOString(),
          last_check_ok: false
        }).eq('id', app.id)

        await logEvent(app, 'check_fail', { status: res.status })
        failed++
        continue
      }

      const raw = await res.text()
      const encoder = new TextEncoder()
      const data = encoder.encode(raw)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      // Check if changed
      if (hash !== app.intent_map_hash) {
        const jinJson = JSON.parse(raw)

        // Update app
        await supabase.from('apps').update({
          raw_intent_map: jinJson,
          intent_map_hash: hash,
          last_checked_at: new Date().toISOString(),
          last_check_ok: true,
          total_intents: jinJson.intents?.length || 0
        }).eq('id', app.id)

        // Rebuild intents — delete old, insert new
        await supabase.from('intents').delete().eq('app_id', app.id)
        if (jinJson.intents?.length > 0) {
          await supabase.from('intents').insert(
            jinJson.intents.map((intent: any) => ({
              app_id: app.id,
              intent_id: intent.id,
              name: intent.name,
              description: intent.description,
              triggers: intent.triggers,
              category: intent.category,
              method: intent.method,
              endpoint: intent.endpoint,
              parameters: intent.parameters || {},
              returns: intent.returns,
              errors: intent.errors,
              requires_auth: intent.requires_auth,
              destructive: intent.destructive,
              confirmation_required: intent.confirmation_required,
              rate_limit: intent.rate_limit
            }))
          )
        }

        await logEvent(app, 'hash_changed', { old_hash: app.intent_map_hash, new_hash: hash })
        updated++
      } else {
        await supabase.from('apps').update({
          last_checked_at: new Date().toISOString(),
          last_check_ok: true
        }).eq('id', app.id)

        await logEvent(app, 'check_ok', {})
      }

      checked++
    } catch (err) {
      await logEvent(app, 'check_fail', { error: String(err) })
      failed++
    }
  }

  return new Response(
    JSON.stringify({ checked, updated, failed, total: apps.length }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})

async function logEvent(app: any, type: string, metadata: object) {
  await supabase.from('registry_events').insert({
    app_id: app.id,
    publisher_id: app.publisher_id,
    event_type: type,
    metadata
  })
}
