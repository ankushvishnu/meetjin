-- Enable pgcrypto for gen_random_bytes (API key generation)
create extension if not exists "pgcrypto";

-- Enable full text search
create extension if not exists "pg_trgm";

-- ─────────────────────────────────────────
-- PUBLISHERS
-- Organisation or individual that owns apps
-- ─────────────────────────────────────────
create table publishers (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Identity
  name            text not null,
  email           text not null unique,
  website         text,
  github_handle   text,
  avatar_url      text,

  -- Plan
  plan            text not null default 'free'
                  check (plan in ('free', 'pro', 'team', 'enterprise', 'startup')),
  plan_expires_at timestamptz,

  -- Auth (Supabase auth user id)
  auth_user_id    uuid references auth.users(id) on delete cascade,

  -- Status
  is_verified     boolean not null default false,
  is_suspended    boolean not null default false,

  -- API
  api_key         text unique default encode(extensions.gen_random_bytes(32), 'hex'),

  -- Stats
  total_apps      integer not null default 0,
  total_intents   integer not null default 0
);

-- ─────────────────────────────────────────
-- APPS
-- Each application that publishes a jin.json
-- ─────────────────────────────────────────
create table apps (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Ownership
  publisher_id    uuid not null references publishers(id) on delete cascade,

  -- Identity
  name            text not null,
  slug            text not null unique,  -- used in registry URL
  description     text,
  url             text not null,         -- base URL of the app
  logo_url        text,
  contact_email   text,

  -- AIP
  aip_version     text not null default '0.1',
  intent_map_url  text not null,         -- /.well-known/jin.json URL
  intent_map_hash text,                  -- SHA256 of last fetched jin.json
  raw_intent_map  jsonb,                 -- stored copy of jin.json

  -- Categories (array of category strings from taxonomy)
  categories      text[] not null default '{}',

  -- Type
  is_community    boolean not null default false,  -- community vs official
  is_verified     boolean not null default false,
  verified_at     timestamptz,
  verified_by     uuid references publishers(id),

  -- Status
  is_active       boolean not null default true,
  last_checked_at timestamptz,           -- last time we fetched intent map
  last_check_ok   boolean,               -- was last fetch successful

  -- Stats
  total_intents   integer not null default 0,
  agent_hits      bigint not null default 0,   -- total agent queries
  unique_agents   integer not null default 0,

  -- Search
  search_vector   tsvector
);

-- ─────────────────────────────────────────
-- INTENTS
-- Individual intents extracted from jin.json
-- ─────────────────────────────────────────
create table intents (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Ownership
  app_id          uuid not null references apps(id) on delete cascade,

  -- AIP fields
  intent_id       text not null,          -- id field from jin.json
  name            text not null,
  description     text not null,
  triggers        text[] not null default '{}',
  category        text not null,
  method          text not null check (method in ('GET','POST','PUT','PATCH','DELETE')),
  endpoint        text not null,
  parameters      jsonb not null default '{}',
  returns         jsonb,
  errors          jsonb,
  requires_auth   boolean not null default false,
  destructive     boolean not null default false,
  confirmation_required boolean not null default false,
  rate_limit      jsonb,

  -- Stats
  match_count     bigint not null default 0,  -- how many times matched
  execute_count   bigint not null default 0,  -- how many times executed

  -- Search
  search_vector   tsvector,

  unique (app_id, intent_id)
);

-- ─────────────────────────────────────────
-- AGENT SESSIONS
-- Tracks agent consumers of the registry
-- ─────────────────────────────────────────
create table agent_sessions (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),

  -- Identity
  agent_id        text,                   -- self-reported agent identifier
  agent_version   text,
  jin_version     text,                   -- Jin runtime version if using Jin

  -- Request
  query           text,                   -- natural language query
  category        text,                   -- filtered category if any
  results_count   integer,                -- how many results returned

  -- Attribution (anonymised)
  ip_hash         text,                   -- hashed IP, not raw
  country_code    text
);

-- ─────────────────────────────────────────
-- INTENT MATCHES
-- When an agent matches and executes an intent
-- ─────────────────────────────────────────
create table intent_matches (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),

  -- References
  session_id      uuid references agent_sessions(id),
  intent_id       uuid references intents(id),
  app_id          uuid references apps(id),

  -- Match quality
  match_score     float,                  -- 0-1 confidence
  was_executed    boolean default false,  -- did agent actually call it
  execution_ok    boolean                 -- did execution succeed
);

-- ─────────────────────────────────────────
-- REGISTRY EVENTS
-- Audit log for all registry changes
-- ─────────────────────────────────────────
create table registry_events (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),

  publisher_id    uuid references publishers(id),
  app_id          uuid references apps(id),
  event_type      text not null,
  -- publish, update, verify, suspend, delete,
  -- check_ok, check_fail, hash_changed

  metadata        jsonb not null default '{}'
);

-- ─────────────────────────────────────────
-- WAITLIST
-- For meetjin.com coming soon page
-- ─────────────────────────────────────────
create table waitlist (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  email           text not null unique,
  role            text,
  -- developer, enterprise, agent-builder, curious
  referrer        text,
  notes           text
);
