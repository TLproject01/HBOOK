# Requirements

## Meeting Room Calendar

- Calendar must use React Big Calendar.
- The default view shows approved bookings for all meeting rooms.
- Users can filter the calendar by meeting room from a dropdown.
- The dropdown default option is `All rooms`.
- When a specific room is selected, the calendar must show only bookings for that room.
- The filter should update the calendar immediately without requiring a page reload.

## Admin Master Data

- Admin can create, activate/deactivate, and soft delete vehicles.
- Admin can create, activate/deactivate, and soft delete drivers.
- Admin can map active drivers to active vehicles.
- Admin can remove driver-vehicle mappings.
- Admin can create, activate/deactivate, and soft delete meeting rooms.
- Vehicle and driver creation support optional JPEG, PNG, or WebP photo upload to Supabase Storage.

## Vehicle Booking

- Vehicle calendar must show bookings with `PENDING` and `APPROVED` statuses because both block availability.
- Users can create a vehicle request for an active vehicle.
- The server must reject past datetime ranges, invalid ranges, over-capacity passenger counts, self-drive-only driver requests, and overlapping vehicle bookings.
- New user-created vehicle requests start as `PENDING`.
- Pending vehicle requests notify admins.
- Users can view their own vehicle requests.
- Users can cancel their own `PENDING` vehicle requests.
