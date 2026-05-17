# Jin Registry — Database Schema, API & npm Package Scaffold
## Complete build specification for Antigravity

---

## Overview

This document covers three things:
1. Supabase database schema for the Jin Registry
2. REST API specification for the registry
3. npm package scaffold for `jin` CLI tool

Stack: React + TypeScript + Supabase + pnpm Turborepo  
Hosting: meetjin.com (registry UI + API)  
Package: `jin` on npm

---

## Part 1 — Supabase Database Schema

Run these migrations in order in Supabase SQL editor.

### Migration 001 — Core tables

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enable full text search
create extension if not exists "pg_trgm";

-- ─────────────────────────────────────────
-- PUBLISHERS
-- Organisation or individual that owns apps
-- ─────────────────────────────────────────
create table publishers (
  id              uuid primary key default uuid_generate_v4(),
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
  api_key         text unique default encode(gen_random_bytes(32), 'hex'),

  -- Stats
  total_apps      integer not null default 0,
  total_intents   integer not null default 0
);

-- ─────────────────────────────────────────
-- APPS
-- Each application that publishes a jin.json
-- ─────────────────────────────────────────
create table apps (
  id              uuid primary key default uuid_generate_v4(),
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
  id              uuid primary key default uuid_generate_v4(),
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
  id              uuid primary key default uuid_generate_v4(),
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
  id              uuid primary key default uuid_generate_v4(),
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
  id              uuid primary key default uuid_generate_v4(),
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
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  email           text not null unique,
  role            text,
  -- developer, enterprise, agent-builder, curious
  referrer        text,
  notes           text
);
```

---

### Migration 002 — Indexes

```sql
-- Apps
create index apps_publisher_id_idx on apps(publisher_id);
create index apps_slug_idx on apps(slug);
create index apps_is_verified_idx on apps(is_verified);
create index apps_is_community_idx on apps(is_community);
create index apps_categories_idx on apps using gin(categories);
create index apps_search_idx on apps using gin(search_vector);

-- Intents
create index intents_app_id_idx on intents(app_id);
create index intents_category_idx on intents(category);
create index intents_triggers_idx on intents using gin(triggers);
create index intents_search_idx on intents using gin(search_vector);

-- Agent sessions
create index agent_sessions_created_at_idx on agent_sessions(created_at);
create index agent_sessions_agent_id_idx on agent_sessions(agent_id);

-- Intent matches
create index intent_matches_intent_id_idx on intent_matches(intent_id);
create index intent_matches_app_id_idx on intent_matches(app_id);
create index intent_matches_created_at_idx on intent_matches(created_at);
```

---

### Migration 003 — Search vectors

```sql
-- Apps search vector
create or replace function apps_search_vector_update()
returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.categories, ' '), '')), 'C');
  return new;
end;
$$ language plpgsql;

create trigger apps_search_vector_trigger
before insert or update on apps
for each row execute function apps_search_vector_update();

-- Intents search vector
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
$$ language plpgsql;

create trigger intents_search_vector_trigger
before insert or update on intents
for each row execute function intents_search_vector_update();
```

---

### Migration 004 — Row Level Security

```sql
-- Enable RLS
alter table publishers enable row level security;
alter table apps enable row level security;
alter table intents enable row level security;
alter table registry_events enable row level security;
alter table waitlist enable row level security;

-- Publishers: read own row, public can read basic info
create policy "publishers_read_own"
  on publishers for select
  using (auth.uid() = auth_user_id);

create policy "publishers_update_own"
  on publishers for update
  using (auth.uid() = auth_user_id);

-- Apps: public can read active apps
create policy "apps_public_read"
  on apps for select
  using (is_active = true);

create policy "apps_publisher_write"
  on apps for all
  using (
    publisher_id in (
      select id from publishers
      where auth_user_id = auth.uid()
    )
  );

-- Intents: public can read
create policy "intents_public_read"
  on intents for select
  using (true);

create policy "intents_publisher_write"
  on intents for all
  using (
    app_id in (
      select id from apps
      where publisher_id in (
        select id from publishers
        where auth_user_id = auth.uid()
      )
    )
  );

-- Waitlist: insert only for anon
create policy "waitlist_insert"
  on waitlist for insert
  with check (true);
```

---

### Migration 005 — Helper functions

```sql
-- Search intents by natural language query
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
    i.id,
    a.id,
    a.name,
    a.slug,
    a.logo_url,
    i.intent_id,
    i.name,
    i.description,
    i.category,
    i.triggers,
    i.requires_auth,
    i.destructive,
    a.is_verified,
    a.is_community,
    ts_rank(i.search_vector, plainto_tsquery('english', query)) as rank
  from intents i
  join apps a on i.app_id = a.id
  where
    a.is_active = true
    and (filter_category is null or i.category = filter_category)
    and (filter_verified is null or a.is_verified = filter_verified)
    and i.search_vector @@ plainto_tsquery('english', query)
  order by rank desc
  limit result_limit
  offset result_offset;
end;
$$ language plpgsql;

-- Increment agent hit counter
create or replace function increment_app_hits(app_uuid uuid)
returns void as $$
begin
  update apps
  set agent_hits = agent_hits + 1
  where id = app_uuid;
end;
$$ language plpgsql security definer;

-- Update publisher stats
create or replace function update_publisher_stats(pub_id uuid)
returns void as $$
begin
  update publishers
  set
    total_apps = (select count(*) from apps where publisher_id = pub_id),
    total_intents = (
      select count(*) from intents i
      join apps a on i.app_id = a.id
      where a.publisher_id = pub_id
    )
  where id = pub_id;
end;
$$ language plpgsql security definer;
```

---

## Part 2 — Registry API Specification

Base URL: `https://meetjin.com/api/v1`

All responses are JSON. All timestamps are ISO8601 UTC.

---

### Public Endpoints (no auth required)

---

#### `GET /registry/search`

Search for intents by natural language query. This is the primary endpoint for agent consumers.

**Query parameters:**
```
q               string    Natural language search query (required)
category        string    Filter by category from taxonomy (optional)
verified        boolean   Only return verified apps (optional)
community       boolean   Include community intent maps (default: true)
limit           integer   Results per page, max 50 (default: 20)
offset          integer   Pagination offset (default: 0)
```

**Request example:**
```
GET /registry/search?q=book+a+hotel&category=travel&verified=true
```

**Response:**
```json
{
  "query": "book a hotel",
  "total": 12,
  "limit": 20,
  "offset": 0,
  "results": [
    {
      "app": {
        "id": "uuid",
        "name": "MakeMyTrip",
        "slug": "makemytrip",
        "description": "India's leading travel booking platform",
        "url": "https://makemytrip.com",
        "logo_url": "https://...",
        "is_verified": true,
        "is_community": false,
        "intent_map_url": "https://makemytrip.com/.well-known/jin.json"
      },
      "intent": {
        "id": "book_hotel",
        "name": "Book a Hotel",
        "description": "Book a hotel room by location, dates, and guests",
        "triggers": ["book a hotel", "reserve a room", "find hotel rooms"],
        "category": "travel",
        "method": "POST",
        "endpoint": "/api/v1/hotels/bookings",
        "requires_auth": true,
        "destructive": false,
        "confirmation_required": true
      },
      "match_score": 0.94
    }
  ]
}
```

---

#### `GET /registry/apps`

List all apps in the registry.

**Query parameters:**
```
category        string    Filter by category
verified        boolean   Filter by verification status
community       boolean   Include community maps (default: true)
sort            string    agent_hits | created_at | name (default: agent_hits)
limit           integer   Max 50 (default: 20)
offset          integer   Pagination offset
```

**Response:**
```json
{
  "total": 247,
  "results": [
    {
      "id": "uuid",
      "name": "Spotter",
      "slug": "spotter",
      "description": "Fitness trainer booking platform",
      "url": "https://spotter.app",
      "logo_url": "https://...",
      "categories": ["health"],
      "total_intents": 4,
      "agent_hits": 1847,
      "is_verified": true,
      "is_community": false,
      "aip_version": "0.1",
      "published": "2026-05-16T00:00:00Z"
    }
  ]
}
```

---

#### `GET /registry/apps/:slug`

Get full details for a specific app including all intents.

**Response:**
```json
{
  "id": "uuid",
  "name": "Spotter",
  "slug": "spotter",
  "description": "Fitness trainer booking platform",
  "url": "https://spotter.app",
  "logo_url": "https://...",
  "categories": ["health"],
  "is_verified": true,
  "is_community": false,
  "aip_version": "0.1",
  "intent_map_url": "https://spotter.app/.well-known/jin.json",
  "agent_hits": 1847,
  "published": "2026-05-16T00:00:00Z",
  "last_checked_at": "2026-05-16T06:00:00Z",
  "intents": [
    {
      "id": "search_trainers",
      "name": "Search Trainers",
      "description": "Find available personal trainers",
      "triggers": ["find a trainer", "search for trainers"],
      "category": "health",
      "method": "GET",
      "endpoint": "/api/v1/trainers",
      "parameters": { },
      "requires_auth": false,
      "destructive": false,
      "confirmation_required": false,
      "match_count": 924,
      "execute_count": 731
    }
  ]
}
```

---

#### `GET /registry/categories`

List all categories with intent and app counts.

**Response:**
```json
{
  "categories": [
    { "id": "travel", "label": "Travel", "app_count": 34, "intent_count": 187 },
    { "id": "commerce", "label": "Commerce", "app_count": 28, "intent_count": 142 },
    { "id": "government", "label": "Government", "app_count": 12, "intent_count": 67 }
  ]
}
```

---

#### `POST /registry/search/log`

Agent consumers call this to log a search session. Used for registry analytics. No auth required but rate limited.

**Request body:**
```json
{
  "agent_id": "jin-runtime",
  "agent_version": "0.1.0",
  "jin_version": "0.1.0",
  "query": "book a hotel",
  "category": "travel",
  "results_count": 5
}
```

**Response:**
```json
{ "session_id": "uuid" }
```

---

#### `POST /waitlist`

Join the meetjin.com waitlist.

**Request body:**
```json
{
  "email": "dev@example.com",
  "role": "developer",
  "notes": "Building an agent for IRCTC"
}
```

---

### Authenticated Endpoints (publisher auth required)

Auth: `Authorization: Bearer <api_key>` or Supabase JWT

---

#### `POST /publisher/apps`

Publish a new app to the registry.

**Request body:**
```json
{
  "name": "My App",
  "url": "https://myapp.com",
  "description": "What my app does",
  "logo_url": "https://myapp.com/logo.png",
  "contact_email": "dev@myapp.com",
  "intent_map_url": "https://myapp.com/.well-known/jin.json",
  "is_community": false
}
```

**What happens server-side:**
1. Validate request body
2. Fetch `intent_map_url` and validate against AIP spec
3. Extract and store all intents
4. Generate slug from app name
5. Log registry event
6. Return created app

**Response:**
```json
{
  "id": "uuid",
  "slug": "my-app",
  "registry_url": "https://meetjin.com/registry/my-app",
  "status": "published",
  "intents_imported": 6
}
```

---

#### `PUT /publisher/apps/:slug`

Update an existing app. Triggers re-fetch of intent map.

---

#### `DELETE /publisher/apps/:slug`

Remove app from registry. Soft delete — intent map preserved for 30 days.

---

#### `POST /publisher/apps/:slug/refresh`

Manually trigger re-fetch of intent map from the published URL. Automatically run daily by cron.

---

#### `GET /publisher/apps/:slug/analytics`

Get agent usage analytics for your app. Pro plan required.

**Response:**
```json
{
  "period": "30d",
  "total_hits": 4821,
  "unique_agents": 143,
  "top_intents": [
    { "intent_id": "search_trainers", "hits": 2100 },
    { "intent_id": "book_trainer", "hits": 891 }
  ],
  "hits_by_day": [
    { "date": "2026-05-01", "hits": 142 },
    { "date": "2026-05-02", "hits": 198 }
  ],
  "top_queries": [
    { "query": "find a trainer in pune", "count": 87 },
    { "query": "book fitness session tomorrow", "count": 64 }
  ]
}
```

---

## Part 3 — npm Package Scaffold

Directory structure for the `jin` npm package.

### Package structure

```
packages/jin-cli/
├── src/
│   ├── index.ts              ← CLI entry point
│   ├── commands/
│   │   ├── init.ts           ← jin init
│   │   ├── validate.ts       ← jin validate
│   │   ├── serve.ts          ← jin serve
│   │   ├── publish.ts        ← jin publish
│   │   └── watch.ts          ← jin watch
│   ├── scanners/
│   │   ├── nextjs.ts         ← scans Next.js routes + API
│   │   ├── react-router.ts   ← scans React Router routes
│   │   ├── express.ts        ← scans Express routes
│   │   └── openapi.ts        ← imports existing OpenAPI spec
│   ├── validators/
│   │   └── schema.ts         ← validates jin.json against AIP spec
│   ├── types/
│   │   └── aip.ts            ← TypeScript types for jin.json
│   └── utils/
│       ├── fetch.ts          ← fetches and hashes intent maps
│       └── registry.ts       ← talks to meetjin.com API
├── package.json
├── tsconfig.json
└── README.md
```

---

### `src/types/aip.ts`

```typescript
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type AuthType = 'none' | 'bearer' | 'oauth2' | 'apikey'

export type AIPCategory =
  | 'commerce' | 'travel' | 'productivity' | 'communication'
  | 'finance' | 'identity' | 'healthcare' | 'legal'
  | 'government' | 'education' | 'media' | 'developer'
  | 'data' | 'social' | 'local'

export interface AIPParameter {
  type: 'string' | 'number' | 'boolean' | 'ISO8601' | 'enum'
  description: string
  required: boolean
  enum?: string[]
  default?: unknown
  example?: unknown
}

export interface AIPIntent {
  id: string
  name: string
  description: string
  triggers: string[]
  category: AIPCategory
  method: HttpMethod
  endpoint: string
  parameters?: Record<string, AIPParameter>
  headers?: Record<string, string>
  returns?: {
    description: string
    schema?: object
  }
  errors?: Array<{
    code: number
    meaning: string
  }>
  rate_limit?: {
    requests_per_minute: number
    note?: string
  }
  requires_auth: boolean
  destructive: boolean
  confirmation_required: boolean
}

export interface AIPOAuth2 {
  authorization_url: string
  token_url: string
  scopes?: Record<string, string>
}

export interface AIPAuth {
  type: AuthType
  oauth2?: AIPOAuth2
  docs?: string
}

export interface AIPApp {
  name: string
  description: string
  url: string
  logo?: string
  contact?: string
}

export interface AIPRegistry {
  verified: boolean
  listing?: string
}

export interface JinJSON {
  aip_version: string
  app: AIPApp
  auth: AIPAuth
  intents: AIPIntent[]
  published: string
  registry?: AIPRegistry
}
```

---

### `src/commands/init.ts`

```typescript
import fs from 'fs'
import path from 'path'
import { JinJSON, AIPIntent } from '../types/aip'
import { scanNextJS } from '../scanners/nextjs'
import { scanReactRouter } from '../scanners/react-router'
import { scanExpress } from '../scanners/express'
import { scanOpenAPI } from '../scanners/openapi'

export async function init(cwd: string = process.cwd()) {
  console.log('🔍 Jin — scanning your codebase...\n')

  const detectedIntents: Partial<AIPIntent>[] = []
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8')
  )

  // Detect framework
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  }

  if (deps['next']) {
    console.log('   Detected: Next.js')
    const intents = await scanNextJS(cwd)
    detectedIntents.push(...intents)
    console.log(`   Found ${intents.length} routes/endpoints`)
  }

  if (deps['react-router-dom'] || deps['react-router']) {
    console.log('   Detected: React Router')
    const intents = await scanReactRouter(cwd)
    detectedIntents.push(...intents)
    console.log(`   Found ${intents.length} routes`)
  }

  if (deps['express']) {
    console.log('   Detected: Express')
    const intents = await scanExpress(cwd)
    detectedIntents.push(...intents)
    console.log(`   Found ${intents.length} endpoints`)
  }

  // Check for existing OpenAPI spec
  const openApiPaths = ['openapi.json', 'openapi.yaml', 'swagger.json', 'swagger.yaml']
  for (const p of openApiPaths) {
    if (fs.existsSync(path.join(cwd, p))) {
      console.log(`   Detected: OpenAPI spec (${p})`)
      const intents = await scanOpenAPI(path.join(cwd, p))
      detectedIntents.push(...intents)
      console.log(`   Imported ${intents.length} operations`)
    }
  }

  console.log('')

  // Build scaffold
  const scaffold: JinJSON = {
    aip_version: '0.1',
    app: {
      name: packageJson.name || 'My App',
      description: packageJson.description || 'TODO: describe what your app does',
      url: 'https://TODO.your-domain.com',
      contact: 'TODO: dev@your-domain.com'
    },
    auth: {
      type: 'none'
    },
    intents: detectedIntents.map(intent => ({
      id: intent.id || 'TODO_intent_id',
      name: intent.name || 'TODO: Intent name',
      description: intent.description || 'TODO: What does this intent do in plain language?',
      triggers: intent.triggers || [
        'TODO: natural language phrase that maps to this intent',
        'TODO: alternative phrasing'
      ],
      category: intent.category || 'developer',
      method: intent.method || 'GET',
      endpoint: intent.endpoint || '/TODO',
      parameters: intent.parameters || {},
      requires_auth: intent.requires_auth ?? false,
      destructive: intent.destructive ?? false,
      confirmation_required: intent.confirmation_required ?? false
    })),
    published: new Date().toISOString(),
    registry: {
      verified: false
    }
  }

  // Write jin.json
  const outputPath = path.join(cwd, 'jin.json')
  fs.writeFileSync(outputPath, JSON.stringify(scaffold, null, 2))

  console.log(`✓ Generated jin.json with ${scaffold.intents.length} intent(s)`)
  console.log('')
  console.log('Next steps:')
  console.log('  1. Open jin.json and fill in the TODO fields')
  console.log('  2. Add natural language triggers to each intent')
  console.log('  3. Run: npx jin validate')
  console.log('  4. Run: npx jin serve  (to test locally)')
  console.log('  5. Run: npx jin publish (to list on meetjin.com)')
  console.log('')
}
```

---

### `src/commands/validate.ts`

```typescript
import fs from 'fs'
import path from 'path'
import { JinJSON, AIPCategory } from '../types/aip'

const VALID_CATEGORIES: AIPCategory[] = [
  'commerce', 'travel', 'productivity', 'communication',
  'finance', 'identity', 'healthcare', 'legal',
  'government', 'education', 'media', 'developer',
  'data', 'social', 'local'
]

const VALID_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export function validate(jinJsonPath: string): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] }

  // Load file
  let jinJson: JinJSON
  try {
    jinJson = JSON.parse(fs.readFileSync(jinJsonPath, 'utf-8'))
  } catch (e) {
    return { valid: false, errors: ['Cannot parse jin.json — invalid JSON'], warnings: [] }
  }

  // Top level checks
  if (!jinJson.aip_version) result.errors.push('Missing: aip_version')
  if (!jinJson.app) result.errors.push('Missing: app object')
  if (!jinJson.app?.name) result.errors.push('Missing: app.name')
  if (!jinJson.app?.description) result.errors.push('Missing: app.description')
  if (!jinJson.app?.url) result.errors.push('Missing: app.url')
  if (!jinJson.auth) result.errors.push('Missing: auth object')
  if (!jinJson.intents || !Array.isArray(jinJson.intents)) {
    result.errors.push('Missing: intents array')
  }

  // Check for TODO placeholders
  const raw = JSON.stringify(jinJson)
  if (raw.includes('TODO')) {
    result.warnings.push('jin.json contains TODO placeholders — fill these in before publishing')
  }

  // Intent checks
  if (jinJson.intents) {
    const intentIds = new Set<string>()

    jinJson.intents.forEach((intent, idx) => {
      const prefix = `intents[${idx}] (${intent.id || 'unknown'})`

      if (!intent.id) result.errors.push(`${prefix}: missing id`)
      if (!intent.name) result.errors.push(`${prefix}: missing name`)
      if (!intent.description) result.errors.push(`${prefix}: missing description`)
      if (!intent.method || !VALID_METHODS.includes(intent.method)) {
        result.errors.push(`${prefix}: invalid method — must be one of ${VALID_METHODS.join(', ')}`)
      }
      if (!intent.endpoint) result.errors.push(`${prefix}: missing endpoint`)
      if (!intent.category || !VALID_CATEGORIES.includes(intent.category as AIPCategory)) {
        result.errors.push(`${prefix}: invalid category`)
      }

      // Triggers quality
      if (!intent.triggers || intent.triggers.length === 0) {
        result.errors.push(`${prefix}: must have at least 1 trigger`)
      } else if (intent.triggers.length < 3) {
        result.warnings.push(`${prefix}: has ${intent.triggers.length} trigger(s) — 3+ recommended for better agent matching`)
      }

      // Duplicate IDs
      if (intent.id) {
        if (intentIds.has(intent.id)) {
          result.errors.push(`Duplicate intent id: ${intent.id}`)
        }
        intentIds.add(intent.id)
      }

      // Destructive intents should require confirmation
      if (intent.destructive && !intent.confirmation_required) {
        result.warnings.push(`${prefix}: is destructive but confirmation_required is false — consider setting to true`)
      }
    })
  }

  result.valid = result.errors.length === 0
  return result
}

export function validateAndPrint(cwd: string = process.cwd()) {
  const jinJsonPath = path.join(cwd, 'jin.json')

  if (!fs.existsSync(jinJsonPath)) {
    console.log('✗ jin.json not found — run: npx jin init')
    process.exit(1)
  }

  const result = validate(jinJsonPath)

  if (result.errors.length === 0) {
    console.log('✓ jin.json is valid AIP 0.1\n')
  }

  result.errors.forEach(e => console.log(`✗ ${e}`))
  result.warnings.forEach(w => console.log(`⚠ ${w}`))

  if (result.valid) {
    console.log(`\n  ${result.warnings.length === 0 ? 'All good. Run: npx jin publish' : 'Fix warnings for better agent matching.'}`)
  } else {
    console.log(`\n  Fix ${result.errors.length} error(s) before publishing.`)
    process.exit(1)
  }
}
```

---

### `src/commands/publish.ts`

```typescript
import fs from 'fs'
import path from 'path'
import { validate } from './validate'

const REGISTRY_URL = 'https://meetjin.com/api/v1'

export async function publish(cwd: string = process.cwd()) {
  const jinJsonPath = path.join(cwd, 'jin.json')

  // Validate first
  console.log('Validating jin.json...')
  const validation = validate(jinJsonPath)
  if (!validation.valid) {
    console.log('✗ Validation failed. Fix errors before publishing.')
    process.exit(1)
  }
  console.log('✓ Valid\n')

  // Load jin.json
  const jinJson = JSON.parse(fs.readFileSync(jinJsonPath, 'utf-8'))

  // Check for API key
  const apiKey = process.env.JIN_API_KEY
  if (!apiKey) {
    console.log('✗ JIN_API_KEY not set')
    console.log('  Get your API key at: https://meetjin.com/dashboard')
    console.log('  Then set it: export JIN_API_KEY=your_key_here')
    process.exit(1)
  }

  // Verify domain ownership
  console.log(`Verifying domain: ${jinJson.app.url}`)
  const intentMapUrl = `${jinJson.app.url}/.well-known/jin.json`

  try {
    const res = await fetch(intentMapUrl)
    if (!res.ok) {
      console.log(`✗ Cannot reach ${intentMapUrl}`)
      console.log('  Run: npx jin serve — then deploy jin.json to your server')
      process.exit(1)
    }
    console.log('✓ Intent map reachable\n')
  } catch {
    console.log(`✗ Cannot reach ${intentMapUrl}`)
    console.log('  Make sure jin.json is deployed and accessible')
    process.exit(1)
  }

  // Publish to registry
  console.log('Publishing to meetjin.com registry...')
  const response = await fetch(`${REGISTRY_URL}/publisher/apps`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      name: jinJson.app.name,
      url: jinJson.app.url,
      description: jinJson.app.description,
      logo_url: jinJson.app.logo,
      contact_email: jinJson.app.contact,
      intent_map_url: intentMapUrl,
      is_community: false
    })
  })

  if (!response.ok) {
    const error = await response.json()
    console.log(`✗ Publish failed: ${error.message}`)
    process.exit(1)
  }

  const data = await response.json()
  console.log(`✓ Published successfully\n`)
  console.log(`  Registry URL: ${data.registry_url}`)
  console.log(`  Intents imported: ${data.intents_imported}`)
  console.log(`  Status: ${data.status}`)
  console.log('')
  console.log('  Agents can now discover your intents at:')
  console.log(`  https://meetjin.com/api/v1/registry/apps/${data.slug}`)
}
```

---

### `src/index.ts` — CLI entry point

```typescript
#!/usr/bin/env node

import { Command } from 'commander'
import { init } from './commands/init'
import { validateAndPrint } from './commands/validate'
import { publish } from './commands/publish'

const program = new Command()

program
  .name('jin')
  .description('Agent Intent Protocol — make your app agent-ready')
  .version('0.1.0')

program
  .command('init')
  .description('Scan your codebase and generate a jin.json scaffold')
  .action(() => init(process.cwd()))

program
  .command('validate')
  .description('Validate your jin.json against the AIP specification')
  .action(() => validateAndPrint(process.cwd()))

program
  .command('serve')
  .description('Serve your jin.json at /.well-known/jin.json for testing')
  .option('-p, --port <port>', 'Port to serve on', '3001')
  .action((options) => {
    const http = require('http')
    const fs = require('fs')
    const jinJson = fs.readFileSync('jin.json', 'utf-8')

    const server = http.createServer((req: any, res: any) => {
      if (req.url === '/.well-known/jin.json') {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        })
        res.end(jinJson)
      } else {
        res.writeHead(404)
        res.end()
      }
    })

    server.listen(options.port, () => {
      console.log(`\n✓ Serving intent map at:`)
      console.log(`  http://localhost:${options.port}/.well-known/jin.json\n`)
    })
  })

program
  .command('publish')
  .description('Publish your jin.json to the meetjin.com registry')
  .action(() => publish(process.cwd()))

program.parse()
```

---

### `package.json` for jin-cli

```json
{
  "name": "jin",
  "version": "0.1.0",
  "description": "Agent Intent Protocol — make your app agent-ready in minutes",
  "main": "dist/index.js",
  "bin": {
    "jin": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "ts-node src/index.ts",
    "prepublishOnly": "pnpm build"
  },
  "keywords": [
    "ai", "agents", "llm", "intent", "aip",
    "agent-intent-protocol", "jin", "meetjin"
  ],
  "author": "Papercargo",
  "license": "Apache-2.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/meetjin/jin"
  },
  "homepage": "https://meetjin.com",
  "dependencies": {
    "commander": "^12.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "ts-node": "^10.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## Part 4 — Supabase Edge Functions

Two edge functions to run server-side logic.

### `supabase/functions/refresh-intent-maps/index.ts`

Runs on a cron — daily at 6am UTC. Re-fetches all intent maps and detects changes.

```typescript
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

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
        continue
      }

      const raw = await res.text()
      const hash = createHash('sha256').update(raw).digest('hex')

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

        // Rebuild intents
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
      } else {
        await supabase.from('apps').update({
          last_checked_at: new Date().toISOString(),
          last_check_ok: true
        }).eq('id', app.id)

        await logEvent(app, 'check_ok', {})
      }
    } catch (err) {
      await logEvent(app, 'check_fail', { error: String(err) })
    }
  }

  return new Response('Done', { status: 200 })
})

async function logEvent(app: any, type: string, metadata: object) {
  await supabase.from('registry_events').insert({
    app_id: app.id,
    publisher_id: app.publisher_id,
    event_type: type,
    metadata
  })
}
```

---

## Part 5 — Monorepo Integration

Add to meetjin monorepo as follows:

```
meetjin/
├── apps/
│   ├── pwa/                  ← Jin companion app
│   ├── web/                  ← meetjin.com (registry UI)  ← ADD THIS
│   └── desktop/              ← Tauri shell
├── packages/
│   ├── core/                 ← Jin engine
│   ├── tools/                ← Agent tools
│   ├── jin-cli/              ← npm package (this document) ← ADD THIS
│   └── sdk/                  ← Public SDK
└── supabase/
    ├── migrations/           ← SQL from Part 1            ← ADD THIS
    └── functions/            ← Edge functions              ← ADD THIS
```

---

## Build order for Antigravity

Hand this document to Antigravity with the following instruction:

```
Build in this exact order:

1. Run Supabase migrations (Part 1) — sets up the database
2. Create packages/jin-cli with all files from Part 3
3. Build and test: npx jin init, npx jin validate, npx jin serve
4. Create supabase/functions from Part 4
5. Scaffold apps/web as a React + Supabase app
   with the API endpoints from Part 2
6. Connect jin publish command to the live registry API

First milestone: jin init runs on the Spotter codebase
and generates a valid jin.json. That is the demo.
```

---

*Jin Registry — Build Specification v0.1*  
*Papercargo / meetjin.com*  
*Internal document — not for public distribution*
