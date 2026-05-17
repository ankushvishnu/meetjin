# Agent Intent Protocol (AIP)
### Version 0.1 — Draft Specification
**Authored by:** Papercargo / Jin  
**License:** Creative Commons CC0 1.0 (public domain)  
**Reference Implementation:** [meetjin.com](https://meetjin.com)  
**Status:** Draft — open for community review

---

## Abstract

The web was built for humans. Every interface — navigation menus, login flows, paginated results, modal dialogs — assumes a user who can see, read, and decide in real time. AI agents operating in this environment are forced to scrape, guess, and fail in ways that are expensive, brittle, and unnecessary.

The Agent Intent Protocol (AIP) defines a lightweight, open standard that gives any web application a machine-readable intent layer. By publishing a single `jin.json` file at a well-known URL, any application can declare what it does, what actions it supports, and how an agent can perform those actions — without scraping, without fragile UI automation, and without custom integration work.

AIP is to agents what `sitemap.xml` is to search engines, and what `robots.txt` is to crawlers — a standard, discoverable, human-maintained signal that makes the web legible to machines.

---

## Problem Statement

### The current state

AI agents today face three fundamental obstacles when interacting with web applications:

**1. No machine-readable intent surface**
Web applications expose their capabilities through visual interfaces designed for human perception. An agent attempting to book a hotel room must parse HTML, locate form fields by visual heuristics, simulate mouse clicks, and handle unpredictable UI states — all to perform an action that could be expressed in three lines of structured data.

**2. No standard discovery mechanism**
Even when applications expose APIs, there is no standard way for an agent to discover what those APIs do, what parameters they accept, or how to authenticate. OpenAPI specs exist but are inconsistently published, often incomplete, and not designed for natural language intent matching.

**3. No trust or verification layer**
An agent has no way to know whether a discovered API endpoint is legitimate, maintained, or safe to interact with. Every integration is built on trust assumptions that are never formally declared.

### The consequence

Every agent integration today is a custom engineering project. The result is that agents work well only with the handful of applications that have invested in agent-specific integrations. The long tail of the web — millions of applications that real users depend on — is invisible to agents.

AIP solves this by making intent declaration a first-class, standardised, zero-cost capability that any developer can add to any application in under an hour.

---

## Core Concepts

### Intent
An intent is a discrete action or query that an application supports on behalf of a user. Intents are expressed in natural language (for agent matching) and structured data (for agent execution).

Examples of intents:
- "Book a fitness trainer session"
- "Search for available hotels by location and date"
- "Get today's calendar events"
- "Submit a compliance document for review"
- "Check the status of a government application"

### Intent Map
An intent map is the complete set of intents an application declares, serialised as a `jin.json` file and served at a well-known URL.

### Intent Registry
A public, searchable index of intent maps published by applications worldwide. Hosted at `meetjin.com/registry`. Any agent can query the registry to discover which applications support a given intent.

### Intent Consumer
Any agent, LLM, or automated system that reads intent maps and uses them to perform tasks on behalf of users.

### Intent Publisher
Any developer or organisation that publishes a `jin.json` file for their application.

---

## The `jin.json` Specification

### Discovery URL

Every application implementing AIP must serve its intent map at:

```
https://yourdomain.com/.well-known/jin.json
```

This follows the RFC 8615 well-known URI convention, consistent with established standards such as `openid-configuration` and `security.txt`.

### Top-level Structure

```json
{
  "aip_version": "0.1",
  "app": {
    "name": "string — human readable application name",
    "description": "string — what this application does in plain language",
    "url": "string — base URL of the application",
    "logo": "string — URL to logo image (optional)",
    "contact": "string — email for AIP-related queries (optional)"
  },
  "auth": {
    "type": "none | bearer | oauth2 | apikey",
    "oauth2": { },
    "docs": "string — URL to auth documentation (optional)"
  },
  "intents": [ ],
  "published": "string — ISO8601 date of last update",
  "registry": {
    "verified": false,
    "listing": "string — URL to registry listing (optional)"
  }
}
```

### Intent Object

Each intent in the `intents` array follows this structure:

```json
{
  "id": "string — unique identifier, snake_case",
  "name": "string — human readable name",
  "description": "string — what this intent does in plain language",
  "triggers": [
    "string — natural language phrase that maps to this intent",
    "string — alternative phrasing"
  ],
  "category": "string — see Category Taxonomy below",
  "method": "GET | POST | PUT | PATCH | DELETE",
  "endpoint": "string — relative path from app base URL",
  "parameters": {
    "parameter_name": {
      "type": "string | number | boolean | ISO8601 | enum",
      "description": "string — what this parameter means",
      "required": true,
      "enum": ["optional", "array", "of", "valid", "values"],
      "default": "optional default value",
      "example": "optional example value"
    }
  },
  "headers": {
    "header_name": "header_value"
  },
  "returns": {
    "description": "string — what a successful response contains",
    "schema": { }
  },
  "errors": [
    {
      "code": 400,
      "meaning": "string — what this error means for this intent"
    }
  ],
  "rate_limit": {
    "requests_per_minute": 60,
    "note": "string — any rate limit context (optional)"
  },
  "requires_auth": true,
  "destructive": false,
  "confirmation_required": false
}
```

### Key Fields Explained

**`triggers`** — Natural language phrases an agent uses to match this intent. The more triggers you provide, the better agent matching becomes. Think of these as the phrases a user might say that should map to this action.

**`destructive`** — If true, this intent modifies or deletes data in a way that cannot be easily undone. Agents should seek user confirmation before executing destructive intents.

**`confirmation_required`** — If true, the application explicitly requests that agents pause and confirm with the user before executing. Use this for payments, bookings, and irreversible actions.

**`category`** — Standardised category for registry indexing and agent discovery. See taxonomy below.

---

## Category Taxonomy v0.1

Categories enable the registry to organise intents by domain. Publishers must use a category from this list. New categories can be proposed via the AIP community process.

```
commerce          — buying, selling, pricing, inventory
travel            — booking, search, itineraries, transport
productivity      — calendar, tasks, notes, reminders
communication     — email, messaging, notifications
finance           — payments, transfers, accounts, invoices
identity          — authentication, profiles, verification
healthcare        — appointments, records, prescriptions
legal             — documents, contracts, compliance
government        — applications, permits, filings, status
education         — courses, enrolment, progress, content
media             — search, playback, recommendations
developer         — APIs, webhooks, code, deployments
data              — search, query, export, analytics
social            — profiles, posts, connections, feeds
local             — businesses, locations, hours, reviews
```

---

## Complete Example: Spotter App

```json
{
  "aip_version": "0.1",
  "app": {
    "name": "Spotter",
    "description": "A fitness trainer booking platform connecting clients with personal trainers in Pune and Bengaluru.",
    "url": "https://spotter.app",
    "contact": "dev@spotter.app"
  },
  "auth": {
    "type": "oauth2",
    "oauth2": {
      "authorization_url": "https://spotter.app/oauth/authorize",
      "token_url": "https://spotter.app/oauth/token",
      "scopes": {
        "read:trainers": "Search and view trainer profiles",
        "write:bookings": "Create and manage bookings",
        "read:bookings": "View existing bookings"
      }
    }
  },
  "intents": [
    {
      "id": "search_trainers",
      "name": "Search Trainers",
      "description": "Find available personal trainers by location, specialty, or availability.",
      "triggers": [
        "find a personal trainer",
        "search for trainers near me",
        "who are the available trainers",
        "show me fitness trainers in Pune",
        "I want a yoga trainer",
        "find me a trainer for weight loss"
      ],
      "category": "health",
      "method": "GET",
      "endpoint": "/api/v1/trainers",
      "parameters": {
        "city": {
          "type": "string",
          "description": "City to search in",
          "required": false,
          "enum": ["pune", "bengaluru"],
          "example": "pune"
        },
        "specialty": {
          "type": "string",
          "description": "Training specialty or fitness goal",
          "required": false,
          "example": "weight loss"
        },
        "date": {
          "type": "ISO8601",
          "description": "Date to check availability",
          "required": false,
          "example": "2026-05-20"
        },
        "gender": {
          "type": "enum",
          "description": "Preferred trainer gender",
          "required": false,
          "enum": ["male", "female", "any"]
        }
      },
      "returns": {
        "description": "List of trainer profiles with availability and pricing"
      },
      "requires_auth": false,
      "destructive": false,
      "confirmation_required": false
    },
    {
      "id": "book_trainer",
      "name": "Book a Trainer Session",
      "description": "Book a personal training session with a specific trainer.",
      "triggers": [
        "book a trainer",
        "schedule a training session",
        "reserve a slot with a trainer",
        "book a gym session",
        "I want to train with this trainer"
      ],
      "category": "health",
      "method": "POST",
      "endpoint": "/api/v1/bookings",
      "parameters": {
        "trainer_id": {
          "type": "string",
          "description": "Unique identifier of the trainer",
          "required": true,
          "example": "trainer_abc123"
        },
        "date": {
          "type": "ISO8601",
          "description": "Date of the session",
          "required": true,
          "example": "2026-05-20"
        },
        "time": {
          "type": "string",
          "description": "Start time in HH:MM format (IST)",
          "required": true,
          "example": "10:00"
        },
        "duration": {
          "type": "number",
          "description": "Session duration in minutes",
          "required": false,
          "default": 60,
          "enum": [30, 60, 90]
        },
        "notes": {
          "type": "string",
          "description": "Any special requests or health notes for the trainer",
          "required": false
        }
      },
      "returns": {
        "description": "Booking confirmation with session details and trainer contact"
      },
      "errors": [
        { "code": 409, "meaning": "Trainer is not available at the requested time" },
        { "code": 402, "meaning": "Payment required to confirm booking" }
      ],
      "requires_auth": true,
      "destructive": false,
      "confirmation_required": true
    },
    {
      "id": "get_bookings",
      "name": "Get My Bookings",
      "description": "Retrieve upcoming and past training session bookings for the authenticated user.",
      "triggers": [
        "show my bookings",
        "what training sessions do I have",
        "when is my next trainer session",
        "show my upcoming gym sessions",
        "list my past sessions"
      ],
      "category": "health",
      "method": "GET",
      "endpoint": "/api/v1/bookings",
      "parameters": {
        "status": {
          "type": "enum",
          "description": "Filter by booking status",
          "required": false,
          "enum": ["upcoming", "completed", "cancelled"],
          "default": "upcoming"
        },
        "limit": {
          "type": "number",
          "description": "Maximum number of results to return",
          "required": false,
          "default": 10
        }
      },
      "returns": {
        "description": "List of bookings with trainer details, times, and status"
      },
      "requires_auth": true,
      "destructive": false,
      "confirmation_required": false
    },
    {
      "id": "cancel_booking",
      "name": "Cancel a Booking",
      "description": "Cancel an existing training session booking.",
      "triggers": [
        "cancel my booking",
        "cancel my training session",
        "I can't make my session",
        "remove my gym booking"
      ],
      "category": "health",
      "method": "DELETE",
      "endpoint": "/api/v1/bookings/{booking_id}",
      "parameters": {
        "booking_id": {
          "type": "string",
          "description": "Unique identifier of the booking to cancel",
          "required": true,
          "example": "booking_xyz789"
        },
        "reason": {
          "type": "string",
          "description": "Optional reason for cancellation",
          "required": false
        }
      },
      "returns": {
        "description": "Cancellation confirmation and refund status if applicable"
      },
      "errors": [
        { "code": 404, "meaning": "Booking not found or does not belong to this user" },
        { "code": 410, "meaning": "Booking cannot be cancelled — cancellation window has passed" }
      ],
      "requires_auth": true,
      "destructive": true,
      "confirmation_required": true
    }
  ],
  "published": "2026-05-16T00:00:00Z",
  "registry": {
    "verified": false
  }
}
```

---

## The `jin` npm Package

The official reference implementation for AIP is the `jin` npm package. It provides tooling for publishers to generate, validate, serve, and register intent maps.

### Installation

```bash
npm install jin --save-dev
# or
pnpm add jin --save-dev
```

### Commands

**`jin init`**
Scans your codebase and generates a `jin.json` scaffold. Detects:
- Next.js / React Router routes → navigation intents
- Express / Fastify / Next.js API routes → action intents
- TypeScript interfaces and Zod schemas → parameter types
- Existing OpenAPI / Swagger specs → imports directly

```bash
npx jin init
# Scanning routes...        found 12 routes
# Scanning API endpoints... found 8 endpoints
# Scanning TypeScript...    found 14 interfaces
# Generated jin.json — review and add natural language descriptions
```

**`jin validate`**
Validates your `jin.json` against the AIP specification.

```bash
npx jin validate
# ✓ aip_version present
# ✓ 4 intents defined
# ✓ all required fields present
# ⚠ 2 intents have fewer than 3 triggers — consider adding more
# ✓ jin.json is valid AIP 0.1
```

**`jin serve`**
Adds the `/.well-known/jin.json` endpoint to your dev server for testing.

```bash
npx jin serve
# Serving intent map at http://localhost:3000/.well-known/jin.json
```

**`jin publish`**
Submits your `jin.json` to the meetjin.com registry for public discovery.

```bash
npx jin publish
# Validating jin.json...     ✓
# Checking domain ownership... ✓
# Publishing to registry...  ✓
# Listed at meetjin.com/registry/spotter-app
```

**`jin watch`**
Watches your codebase for route and API changes and updates `jin.json` automatically during development.

```bash
npx jin watch
# Watching for changes...
# Route added: /api/v1/reviews → suggest new intent? (y/n)
```

---

## The meetjin.com Registry

The registry is the network layer of AIP. It is a public, searchable, open index of every application that has published a `jin.json` file.

### For Intent Consumers (Agents)

Any agent can query the registry to discover applications that support a given intent:

```
GET https://meetjin.com/registry/search?q=book+a+hotel&category=travel
```

```json
{
  "query": "book a hotel",
  "results": [
    {
      "app": "MakeMyTrip",
      "url": "https://makemytrip.com",
      "intent_map": "https://makemytrip.com/.well-known/jin.json",
      "matching_intents": ["book_hotel", "search_hotels"],
      "verified": true,
      "last_updated": "2026-04-10T00:00:00Z"
    }
  ]
}
```

### For Intent Publishers (Developers)

Developers publish their `jin.json` to the registry via:
- `npx jin publish` CLI command
- Manual submission at `meetjin.com/publish`
- GitHub Action: `papercargo/jin-publish-action`

### Registry Tiers

```
Community (free)
  → Public listing in registry
  → Searchable by agents
  → Basic validation

Verified (applied, free during beta)
  → Jin team reviews intent map for quality
  → Verified badge on registry listing
  → Priority in search results
  → Agents can trust verified maps without additional checks

Partner (future)
  → Deep integration testing
  → SLA on intent map uptime
  → Analytics on agent usage
```

---

## The Playground — meetjin.com/build

The intent playground is where the community comes alive.

Any developer can visit `meetjin.com/build` and:

1. **Browse existing intent maps** — see how other developers have structured their intents. Learn by example.

2. **Build intent maps visually** — a no-code editor that generates valid `jin.json` without writing JSON manually. Useful for non-technical founders who want to publish intents for their app.

3. **Test intent maps live** — paste any `/.well-known/jin.json` URL and the playground simulates an agent consuming it. See exactly what an agent sees when it reads your intent map.

4. **Contribute community intents** — for websites that haven't published their own `jin.json`, any developer can write and publish a community intent map. These are clearly labelled as community-maintained, not officially verified.

5. **Fork and remix** — every intent map in the registry is forkable. Found a similar app? Fork their intent map, adapt it, publish yours. The community builds the standard together.

### Community Intent Maps

This is the marketplace vision. Most websites will never publish their own `jin.json`. But developers who need agents to work with those websites can write the intent map themselves and publish it to the community registry.

```
meetjin.com/registry/community/irctc
→ Community-maintained intent map for IRCTC
→ Written by: @railwaydev
→ Intents: search_trains, check_pnr_status, 
           get_seat_availability
→ Last tested: 2026-05-01
→ Works with: Jin runtime v0.3+
→ 847 agents using this map
```

This creates a Wikipedia-like model for web intent maps. The community maintains them. Jin provides the infrastructure, the spec, and the trust layer. Nobody owns the content — everyone benefits from it.

---

## Agent Integration Guide

For agents and LLMs consuming AIP intent maps:

### Step 1 — Discover

```javascript
// Check if a domain supports AIP
const response = await fetch(
  'https://spotter.app/.well-known/jin.json'
)
const intentMap = await response.json()
```

### Step 2 — Match

```javascript
// Match user intent to available intents
const userIntent = "book a trainer for tomorrow morning"

// Send to LLM with intent map context
const match = await llm.complete({
  system: `You are an intent matcher. 
           Given a user request and an intent map, 
           return the best matching intent ID 
           and extract the required parameters.
           Return JSON only.`,
  user: `User request: "${userIntent}"
         Intent map: ${JSON.stringify(intentMap.intents)}`
})

// Result: { intent_id: "book_trainer", parameters: { date: "2026-05-17", time: "09:00" } }
```

### Step 3 — Execute

```javascript
const { intent_id, parameters } = match

const intent = intentMap.intents.find(i => i.id === intent_id)

// Confirm if required
if (intent.confirmation_required) {
  await confirmWithUser(intent, parameters)
}

// Execute
const result = await fetch(
  `${intentMap.app.url}${intent.endpoint}`,
  {
    method: intent.method,
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(parameters)
  }
)
```

### Step 4 — Handle response

```javascript
if (result.ok) {
  const data = await result.json()
  // Agent task complete — return structured result to user
} else {
  const error = intentMap.intents
    .find(i => i.id === intent_id)
    .errors
    .find(e => e.code === result.status)
  // Handle known error with intent-specific context
}
```

---

## Versioning and Evolution

AIP follows semantic versioning. The current version is `0.1`.

- **Patch versions** (0.1.x) — clarifications, examples, non-breaking additions
- **Minor versions** (0.x.0) — new optional fields, new categories, backward compatible
- **Major versions** (x.0.0) — breaking changes, requires migration

Applications declare which version they implement via `"aip_version"` in `jin.json`. Agents must handle version mismatches gracefully.

The spec is maintained openly at `github.com/meetjin/aip-spec`. Changes are proposed via GitHub issues, discussed publicly, and merged by the AIP working group.

---

## Security Considerations

**Intent map integrity**
Publishers should serve `jin.json` over HTTPS only. The registry records a hash of the intent map at publish time and alerts when it changes unexpectedly.

**Destructive intent protection**
Agents must respect `"destructive": true` and `"confirmation_required": true` flags. Jin-certified agents are tested for compliance with these flags before receiving certification.

**Rate limiting**
Publishers should declare rate limits honestly. Agents must respect declared rate limits. Registry verified status is revoked for publishers whose APIs block agent access despite published intent maps.

**Scope minimisation**
Intent maps should declare the minimum auth scope required for each intent. An intent that only reads data should not require write permissions.

---

## Roadmap

```
v0.1 (now)
  → Core spec published
  → jin npm package: init, validate, serve
  → Registry: basic listing and search
  → Playground: visual builder and tester

v0.2 (Q3 2026)
  → Streaming intent support
  → Multi-step intent flows (wizards)
  → WebSocket and realtime intents
  → GitHub Action for automated publishing

v0.3 (Q4 2026)
  → Agent certification program
  → Intent analytics for publishers
  → Community intent map contributions
  → Mobile SDK (Android + iOS)

v1.0 (2027)
  → Stable spec, commitment to no breaking changes
  → Enterprise verification tier
  → AIP working group formally established
  → Submission to standards body
```

---

## Contributing

AIP is an open standard. Contributions are welcome and essential.

**To propose a spec change:**
Open an issue at `github.com/meetjin/aip-spec` describing the problem and proposed solution.

**To contribute intent maps:**
Visit `meetjin.com/build` and publish community intent maps for websites that haven't implemented AIP natively.

**To contribute to the tooling:**
The `jin` npm package is open source at `github.com/meetjin/jin`. Issues, PRs, and discussion are open.

**To join the working group:**
The AIP working group meets monthly. Apply at `meetjin.com/working-group`.

---

## Summary

The web has billions of pages and millions of applications. Every one of them was built for a human user. As AI agents become the primary interface through which people interact with software, the gap between human-readable interfaces and machine-executable intent becomes the single biggest bottleneck in the agentic web.

AIP closes that gap with a standard that is:
- **Simple** — one JSON file, one well-known URL
- **Open** — CC0 license, community governed
- **Incremental** — add it to any existing app without rewriting anything
- **Discoverable** — the registry makes every intent map findable by any agent
- **Trustworthy** — verification, confirmation flags, and scope minimisation built in

The agentic web is being built right now. AIP gives it a foundation.

---

*Agent Intent Protocol v0.1*  
*Published by Papercargo / Jin*  
*meetjin.com | github.com/meetjin/aip-spec*  
*License: CC0 1.0 Universal (Public Domain)*
