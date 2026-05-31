-- ─────────────────────────────────────────
-- AUTHENTICATION & MANAGEMENT TABLES MIGRATION (MAY 31, 2026)
-- ─────────────────────────────────────────

-- Create enums for roles and statuses
create type public.user_role as enum ('agent_builder', 'webmaster');
create type public.key_status as enum ('active', 'revoked');
create type public.shield_status as enum ('online', 'offline');

-- 1. USERS PROFILE TABLE
-- Maps to Supabase Auth users
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  user_type   public.user_role not null,
  created_at  timestamptz not null default now()
);

-- 2. JIN API KEYS TABLE
-- Active or revoked cryptographic api keys for agent builders
create table public.jin_keys (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete cascade not null,
  key_string  text unique not null check (key_string like 'jin_live_%'),
  status      public.key_status not null default 'active',
  created_at  timestamptz not null default now()
);

-- 3. SHIELDS TABLE
-- Active shield deployments for webmasters
create table public.shields (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete cascade not null,
  domain      text not null,
  status      public.shield_status not null default 'offline',
  last_ping   timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────

alter table public.users enable row level security;
alter table public.jin_keys enable row level security;
alter table public.shields enable row level security;

-- USERS Policies: Users can read and update their own profile row
create policy "users_read_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);

-- JIN_KEYS Policies: Users can read and write (insert/update/delete) their own keys
create policy "jin_keys_read_own"
  on public.jin_keys for select
  using (auth.uid() = user_id);

create policy "jin_keys_write_own"
  on public.jin_keys for all
  using (auth.uid() = user_id);

-- SHIELDS Policies: Users can read and write (insert/update/delete) their own shields
create policy "shields_read_own"
  on public.shields for select
  using (auth.uid() = user_id);

create policy "shields_write_own"
  on public.shields for all
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- TRIGGERS & PL/PGSQL FUNCTIONS
-- ─────────────────────────────────────────

-- Automatically create a user profile in public.users on signup
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
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
