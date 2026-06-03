# Walkthrough: Supabase Security Fixes

## What Was Done

Applied 2 Supabase migrations to fix **17 of 19** security lints. The remaining 2 are expected.

### Migration 1: `fix_security_vulnerabilities`

| Fix | Details |
|-----|---------|
| **RLS on `agent_sessions`** | Enabled RLS + `service_role`-only policy |
| **RLS on `intent_matches`** | Enabled RLS + `service_role`-only policy |
| **6 functions `search_path`** | Added `SET search_path = ''` + fully qualified table refs |
| **`pg_trgm` extension** | Moved from `public` → `extensions` schema |
| **`waitlist_insert` policy** | Replaced with `anon`-only policy |
| **`registry_events` policy** | Added `service_role`-only policy |

### Migration 2: `revoke_public_execute_security_definer`

Revoked `PUBLIC` EXECUTE on 3 SECURITY DEFINER functions and explicitly granted to `service_role` only:
- `handle_new_user()` — auth trigger, never meant to be an API endpoint
- `increment_app_hits(uuid)` — backend-only RPC
- `update_publisher_stats(uuid)` — backend-only RPC

> [!NOTE]
> Two migrations were needed because `CREATE OR REPLACE FUNCTION` resets default `PUBLIC` EXECUTE grants, overriding the initial REVOKE in migration 1.

## Verification Results

### Security Advisor (Post-Fix)

| Metric | Before | After |
|--------|--------|-------|
| 🔴 ERROR | 3 | **0** |
| 🟡 WARN | 15 | **2** (both expected) |
| 🔵 INFO | 1 | **0** |
| **Total** | **19** | **2** |

The 2 remaining warnings:
1. **`waitlist_anon_insert`** — `WITH CHECK (true)` for `anon` INSERT. This is **intentional** — it's a public signup form.
2. **`auth_leaked_password_protection`** — Requires manual toggle in the Supabase Dashboard.

### Function Grants

`anon`, `authenticated`, and `PUBLIC` EXECUTE grants on `handle_new_user`, `increment_app_hits`, `update_publisher_stats` → **all revoked** (empty result set).

### Smoke Test

`search_intents('weather')` → returns Open-Meteo result with `match_rank: 0.807`. Function works correctly with the new `search_path = ''` setting.

## Remaining Manual Step

> [!IMPORTANT]
> Enable **Leaked Password Protection** in **Supabase Dashboard → Authentication → Settings → Password Security**. This cannot be done via SQL.
