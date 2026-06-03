-- ─────────────────────────────────────────
-- REVOKE PUBLIC EXECUTE ON SECURITY DEFINER FUNCTIONS
-- (JUN 3, 2026)
--
-- Must be a separate migration because the previous
-- migration's CREATE OR REPLACE FUNCTION resets the
-- default PUBLIC EXECUTE grant, overriding any REVOKE
-- done in the same transaction.
-- ─────────────────────────────────────────

-- handle_new_user() — auth trigger, never meant to be an API endpoint
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
grant execute on function public.handle_new_user() to service_role;

-- increment_app_hits(uuid) — backend-only RPC
revoke execute on function public.increment_app_hits(uuid) from public;
revoke execute on function public.increment_app_hits(uuid) from anon;
revoke execute on function public.increment_app_hits(uuid) from authenticated;
grant execute on function public.increment_app_hits(uuid) to service_role;

-- update_publisher_stats(uuid) — backend-only RPC
revoke execute on function public.update_publisher_stats(uuid) from public;
revoke execute on function public.update_publisher_stats(uuid) from anon;
revoke execute on function public.update_publisher_stats(uuid) from authenticated;
grant execute on function public.update_publisher_stats(uuid) to service_role;
