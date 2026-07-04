# Roadmap Status

Last updated: 2026-07-04

## Phase 0: Rebuild Foundation

Status: Complete

- Clean Next.js App Router foundation
- TypeScript, Tailwind CSS, ESLint, Vitest, Playwright
- React Big Calendar selected for calendar UI
- Supabase environment template

## Phase 1: Core Architecture

Status: Complete

- Prisma schema for Supabase Postgres
- Supabase Auth SSR client setup
- Supabase Storage helpers
- RBAC helper
- Availability overlap helper
- Audit log and notification helpers
- Baseline RLS and storage SQL

## Phase 2: Admin Master Data

Status: Complete

Completed:

- Admin-only route guard
- Department management page
- Create, activate/deactivate, soft delete departments
- User management page
- Create Supabase Auth user and matching profile
- Reset password and force password change
- Activate/deactivate and soft delete profiles
- Update role in profile and Supabase app metadata
- Vehicle management page
- Create, activate/deactivate, soft delete vehicles
- Driver management page
- Create, activate/deactivate, soft delete drivers
- Driver-vehicle mapping management
- Meeting room management page
- Create, activate/deactivate, soft delete meeting rooms
- Optional vehicle/driver photo upload through Supabase Storage helper
- Edit department details
- Edit meeting room details
- Edit vehicle details and replace vehicle photo
- Edit driver details and replace driver photo
- Edit user profile details and department transfer

Remaining:

- None. Room image upload UI is not required by the current requirements.

## Phase 3: Vehicle Booking

Status: Complete

Completed:

- Vehicle calendar data integration for pending and approved bookings
- Create vehicle request page
- Server-side vehicle request validation
- Vehicle availability check before insert
- Route destinations stored with booking
- Pending request notifications to admins
- My vehicle requests page
- User can cancel own pending request
- Vehicle availability service integration in server actions
- Admin vehicle request review page
- Admin can approve pending vehicle requests
- Admin can reject pending vehicle requests with reason
- Admin can assign an active mapped driver during approval
- Admin can cancel approved future vehicle bookings with reason
- Admin can move approved future vehicle bookings
- Approved/rejected vehicle requests notify the requester
- Admin-cancelled vehicle bookings notify the requester
- Admin-moved vehicle bookings notify the requester
- Approved/rejected vehicle requests write audit events
- Admin-cancelled vehicle bookings write audit events
- Admin-moved vehicle bookings write audit events
- Notification read UI
- Users can edit their own pending vehicle requests

Remaining:

- None. Core vehicle booking workflows write audit events.

## Phase 4: Meeting Room Booking

Status: Complete

Completed:

- Room calendar data integration for approved bookings
- Room dropdown filter with default "All rooms"
- Selecting one meeting room updates React Big Calendar to show only that room
- Room booking form
- Room booking availability conflict validation
- User can create approved room bookings
- Recurring weekly/monthly booking
- Recurring conflict validation
- User can cancel own future room bookings
- Admin can cancel future room bookings
- User can move own future room bookings
- Admin can move future room bookings

Remaining:

- None. Core room booking workflows write audit events.

## Phase 5: Reports

Status: Complete

- Admin filters
- Excel export with Vehicle and Meeting Room sheets
- Export audit log

## Phase 6: QA and UAT

Status: Ready for UAT

- Unit coverage covers availability, booking services, admin updates, notifications, reports, and recurrence helpers.
- `docs/qa-uat-checklist.md` defines the manual UAT checklist.
- `docs/release-handoff.md` defines release handoff notes.
- Supabase project `HBOOK` has schema, RLS policies, storage buckets, and security advisor fixes applied.
- Final verification passed on 2026-07-04:
  - `corepack.cmd pnpm typecheck`
  - `corepack.cmd pnpm lint`
  - `corepack.cmd pnpm test`
  - `corepack.cmd pnpm build`
