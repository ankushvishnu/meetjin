# Meetjin

Meetjin is a monorepo for a web and PWA client experience built with Next.js, Vite, and shared workspace packages.

## Repository structure

- `apps/web` – Next.js application with Supabase integration.
- `apps/pwa` – Vite-powered PWA using the `@meetjin/sdk` workspace package.
- `packages/core` – shared core library.
- `packages/sdk` – shared SDK package consumed by the PWA.
- `supabase` – database migrations and Supabase functions.

## Prerequisites

- Node.js 20+
- `pnpm` 10+
- Git

## Setup

```bash
pnpm install
```

## Common commands

From the repository root:

```bash
pnpm dev
pnpm build
pnpm lint
```

Run a specific app:

```bash
pnpm --filter web dev
pnpm --filter pwa dev
pnpm --filter web build
pnpm --filter pwa build
```

## App notes

### `apps/web`

- Uses `next`, `react`, and `@supabase/supabase-js`
- Expects Supabase environment variables for local development and production
- Builds with `next build`

### `apps/pwa`

- Uses Vite, React, and the workspace package `@meetjin/sdk`
- Builds with `pnpm --filter pwa build`
- Supports local preview via `pnpm --filter pwa preview`

## Environment variables

The `apps/web` project may require environment variables such as:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `IP_HASH_SALT`

If you add local environment files, keep them out of source control.

## License

This repository is licensed under CC0 1.0 Universal.
