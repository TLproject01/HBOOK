# QA And UAT Checklist

Last updated: 2026-07-03

## Automated Checks

- `corepack.cmd pnpm typecheck`
- `corepack.cmd pnpm lint`
- `corepack.cmd pnpm test`
- `corepack.cmd pnpm build`

## Authentication

- Admin can sign in.
- User can sign in.
- Inactive or soft-deleted profiles cannot access the app.
- Users with `mustChangePassword` are redirected to change password.
- Sign out works.

## Admin Master Data

- Admin can create, edit, activate/deactivate, and soft delete departments.
- Admin can create, edit, activate/deactivate, and soft delete users.
- Admin can reset user password and update user role.
- Admin can transfer a user to another department.
- Admin can create, edit, activate/deactivate, and soft delete vehicles.
- Admin can replace vehicle photo with JPEG, PNG, or WebP.
- Admin can create, edit, activate/deactivate, and soft delete drivers.
- Admin can replace driver photo with JPEG, PNG, or WebP.
- Admin can map active drivers to active vehicles and remove mappings.
- Admin can create, edit, activate/deactivate, and soft delete meeting rooms.

## Vehicle Booking

- User can create vehicle request for active vehicle.
- Past ranges, invalid ranges, over-capacity passenger counts, driver request for self-drive-only vehicle, and overlapping bookings are rejected server-side.
- Pending and approved vehicle bookings block availability.
- User can view, edit, and cancel own pending request.
- Admin can approve pending request.
- Admin can reject pending request with reason.
- Admin can assign an active mapped available driver during approval.
- Admin can move approved future booking.
- Admin can cancel approved future booking with reason.
- Relevant notifications and audit logs are created.

## Meeting Room Booking

- Calendar uses React Big Calendar.
- Default calendar shows approved bookings for all rooms.
- Room dropdown default is `All rooms`.
- Selecting one room filters events immediately without page reload.
- User can create room booking.
- Weekly and monthly recurring bookings create all occurrences.
- Any recurring occurrence conflict rejects the series.
- User can move or cancel own future booking.
- Admin can move or cancel future booking.
- Relevant audit logs are created.

## Notifications

- User can view own notifications.
- User can mark own notification as read.
- Users cannot mark another user's notification as read.

## Reports

- Admin can open Reports.
- Date filters apply to export.
- Excel export downloads successfully.
- Workbook includes Vehicle, Meeting Room, and Audit Log sheets.

## Responsive Smoke Checks

Check at desktop and mobile widths:

- Dashboard
- Vehicle calendar
- Vehicle request create/edit
- Admin vehicle review
- Room calendar
- Room booking create
- My room bookings
- Admin room bookings
- Admin reports

## Release Decision

Release is ready when:

- Automated checks pass.
- High-severity UAT defects are resolved.
- Production environment variables are configured.
- Database migrations and Supabase SQL have been applied.
- Owner approves deployment target.
