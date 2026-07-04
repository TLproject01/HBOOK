# HBOOK

ระบบจองรถและห้องประชุมภายในองค์กร สำหรับขอใช้รถ จัดการคนขับ จองห้องประชุม อนุมัติรายการ ติดตามการแจ้งเตือน และส่งออกรายงาน

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

## Product Status

The core product workflows are implemented and ready for production deployment after environment variables, Supabase schema/RLS/storage, and Vercel deployment settings are configured.

See `docs/roadmap-status.md` for implementation status and verification history.
See `docs/requirements.md` for implementation-specific requirement notes.

## Supabase Notes

- Create Supabase Auth users through the app's server-side admin service or the Supabase dashboard.
- App-specific user data lives in `public.profiles`; the profile `id` must match `auth.users.id`.
- Run `supabase/sql/initial-rls-and-storage.sql` after creating the Prisma tables to enable baseline RLS policies and storage buckets.
- Keep `SUPABASE_SECRET_KEY` server-only. Do not expose it with a `NEXT_PUBLIC_` prefix.
