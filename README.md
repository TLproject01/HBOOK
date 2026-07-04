# Vehicle and Meeting Room Booking System

Internal booking application for vehicle requests and meeting room reservations.

## Stack

- Next.js App Router
- TypeScript
- Supabase Auth
- Supabase Postgres + Prisma
- Supabase Storage
- Tailwind CSS
- React Big Calendar
- Zod + React Hook Form
- Vitest + Playwright

## Getting Started

```bash
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm dev
```

Run checks:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Phase 0/1 Scope

This repository currently contains the application foundation, Supabase Auth integration, Prisma data model for Supabase Postgres, Supabase Storage helpers, React Big Calendar calendar shell, and core domain helpers for permissions, availability checks, audit logs, and notifications.

See `docs/roadmap-status.md` for the current implementation status.
See `docs/requirements.md` for implementation-specific requirement notes added during development.

## Supabase Notes

- Create Supabase Auth users through the app's server-side admin service or the Supabase dashboard.
- App-specific user data lives in `public.profiles`; the profile `id` must match `auth.users.id`.
- Run `supabase/sql/initial-rls-and-storage.sql` after creating the Prisma tables to enable baseline RLS policies and storage buckets.
- Keep `SUPABASE_SECRET_KEY` server-only. Do not expose it with a `NEXT_PUBLIC_` prefix.
