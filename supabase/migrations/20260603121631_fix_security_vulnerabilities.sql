-- ─────────────────────────────────────────
-- SECURITY VULNERABILITY FIXES (JUN 3, 2026)
-- Fixes 17 of 19 security advisor lints
-- ─────────────────────────────────────────

-- ─── 1. Enable RLS on tables that were missing it ───

alter table agent_sessions enable row level security;
alter table intent_matches enable row level security;

-- ─── 2. Add service_role-only policies ───

-- agent_sessions: only backend can read/write sessions
create policy "agent_sessions_service_role_all"
  on agent_sessions for all
  to service_role
  using (true)
  with check (true);

-- intent_matches: only backend can read/write matches
create policy "intent_matches_service_role_all"
  on intent_matches for all
  to service_role
  using (true)
  with check (true);

-- registry_events: only backend can read/write events
create policy "registry_events_service_role_all"
  on registry_events for all
  to service_role
  using (true)
  with check (true);

-- ─── 3. Replace overly-permissive waitlist policy ───

-- Old policy allowed any role to insert; restrict to anon only
drop policy if exists "waitlist_insert" on waitlist;

create policy "waitlist_anon_insert"
  on waitlist for insert
  to anon
  with check (true);

-- ─── 4. Move pg_trgm extension to extensions schema ───

drop extension if exists pg_trgm;
create extension if not exists pg_trgm schema extensions;

-- ─── 5. Harden all functions with search_path = '' ───
-- Also use fully qualified table references (public.table)

-- 5a. search_intents
create or replace function search_intents(
  query text,
  filter_category text default null,
  filter_verified boolean default null,
  result_limit integer default 20,
  result_offset integer default 0
)
returns table (
  intent_uuid     uuid,
  app_uuid        uuid,
  app_name        text,
  app_slug        text,
  app_logo        text,
  intent_id       text,
  intent_name     text,
  description     text,
  category        text,
  triggers        text[],
  requires_auth   boolean,
  destructive     boolean,
  is_verified     boolean,
  is_community    boolean,
  match_rank      float
) as $$
begin
  return query
  select
    i.id, a.id, a.name, a.slug, a.logo_url,
    i.intent_id, i.name, i.description, i.category, i.triggers,
    i.requires_auth, i.destructive, a.is_verified, a.is_community,
    ts_rank(i.search_vector, plainto_tsquery('english', query))::float as rank
  from public.intents i
  join public.apps a on i.app_id = a.id
  where
    a.is_active = true
    and (filter_category is null or i.category = filter_category)
    and (filter_verified is null or a.is_verified = filter_verified)
    and i.search_vector @@ plainto_tsquery('english', query)
  order by rank desc
  limit result_limit
  offset result_offset;
end;
$$ language plpgsql set search_path = '';

-- 5b. increment_app_hits
create or replace function increment_app_hits(app_uuid uuid)
returns void as $$
begin
  update public.apps
  set agent_hits = agent_hits + 1
  where id = app_uuid;
end;
$$ language plpgsql security definer set search_path = '';

-- 5c. update_publisher_stats
create or replace function update_publisher_stats(pub_id uuid)
returns void as $$
begin
  update public.publishers
  set
    total_apps = (select count(*) from public.apps where publisher_id = pub_id),
    total_intents = (
      select count(*) from public.intents i
      join public.apps a on i.app_id = a.id
      where a.publisher_id = pub_id
    )
  where id = pub_id;
end;
$$ language plpgsql security definer set search_path = '';

-- 5d. handle_new_user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, user_type)
  values (
    new.id,
    new.email,
    coalesce(
      (new.raw_user_meta_data->>'user_type')::public.user_role,
      'agent_builder'::public.user_role
    )
  );
  return new;
end;
$$ language plpgsql security definer set search_path = '';

-- 5e. apps_search_vector_update
create or replace function apps_search_vector_update()
returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.categories, ' '), '')), 'C');
  return new;
end;
$$ language plpgsql set search_path = '';

-- 5f. intents_search_vector_update
create or replace function intents_search_vector_update()
returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.triggers, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.category, '')), 'C');
  return new;
end;
$$ language plpgsql set search_path = '';
