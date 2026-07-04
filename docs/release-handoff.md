# Release Handoff

Last updated: 2026-07-04

## Product Scope

The app is an internal booking system for vehicle requests and meeting room reservations.

Completed product areas:

- Supabase Auth SSR integration and protected app shell.
- Admin master data for departments, users, vehicles, drivers, driver-vehicle mappings, and meeting rooms.
- Vehicle booking calendar, request creation, edit own pending request, cancel own pending request, admin approve/reject, driver assignment, admin move/cancel, notifications, and audit logs.
- Meeting room calendar, room filtering, booking creation, weekly/monthly recurrence, conflict validation, user/admin move and cancel, notifications for admin actions, and audit logs.
- Notification inbox with mark-read behavior.
- Admin reports with date filters and Excel export containing Vehicle, Meeting Room, and Audit Log sheets.

## Required Environment Variables

Use `.env.example` as the baseline.

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_STORAGE_BUCKET_VEHICLES`
- `SUPABASE_STORAGE_BUCKET_DRIVERS`
- `SUPABASE_STORAGE_BUCKET_ROOMS`

Keep `SUPABASE_SECRET_KEY` server-only. Do not expose it with a `NEXT_PUBLIC_` prefix.

## Database And Supabase Setup

Supabase project `HBOOK` (`mottluzusodnjmfjchuq`) has been initialized through the Supabase connector.

Applied migrations:

- `init_prisma_schema`
- `initial_rls_and_storage`
- `supabase_security_advisor_fixes`

Verified on 2026-07-04:

- All 12 public app tables exist.
- RLS is enabled on all public app tables.
- Security advisor reports no findings.
- Storage buckets exist: `vehicle-photos`, `driver-photos`, `room-assets`.

Remaining database setup:

1. Create the initial admin user through Supabase Auth.
2. Create the matching `profiles` row with the same `id` as `auth.users.id`.
3. Add master data for departments, vehicles, drivers, driver mappings, and rooms during UAT or production setup.

## Verification Commands

Run before deployment:

```bash
corepack.cmd pnpm typecheck
corepack.cmd pnpm lint
corepack.cmd pnpm test
corepack.cmd pnpm build
```

## Deployment Notes

Deploy only after the Owner confirms the deployment target and configures production credentials.

## Known Accepted Scope Decisions

- Room image upload UI is not implemented because current requirements do not require room images.
- Additional audit events can be added later for newly introduced workflows, but current core booking/admin workflows write audit logs.
- Browser/UAT checks should be performed against the real target environment because this workspace does not include production Supabase credentials.
