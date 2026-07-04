-- Run this after Prisma creates the public tables.
-- Supabase Auth owns auth.users; public.profiles stores app-specific user data.

alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.vehicles enable row level security;
alter table public.drivers enable row level security;
alter table public.driver_vehicle_mappings enable row level security;
alter table public.meeting_rooms enable row level security;
alter table public.vehicle_bookings enable row level security;
alter table public.vehicle_booking_routes enable row level security;
alter table public.recurring_series enable row level security;
alter table public.room_bookings enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

alter table public.profiles
  add constraint profiles_id_auth_users_fk
  foreign key (id) references auth.users(id) on delete cascade;

create or replace function public.current_app_role()
returns text
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), 'USER')
$$;

create or replace function public.current_profile_is_active()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and is_active = true
      and deleted_at is null
  )
$$;

create policy "profiles_select_own_or_admin"
on public.profiles for select
to authenticated
using (
  public.current_profile_is_active()
  and ((select auth.uid()) = id or public.current_app_role() = 'ADMIN')
);

create policy "profiles_admin_manage"
on public.profiles for all
to authenticated
using (public.current_profile_is_active() and public.current_app_role() = 'ADMIN')
with check (public.current_profile_is_active() and public.current_app_role() = 'ADMIN');

create policy "master_data_authenticated_read"
on public.departments for select to authenticated using (public.current_profile_is_active());

create policy "vehicles_authenticated_read"
on public.vehicles for select to authenticated using (public.current_profile_is_active());

create policy "drivers_authenticated_read"
on public.drivers for select to authenticated using (public.current_profile_is_active());

create policy "driver_mappings_authenticated_read"
on public.driver_vehicle_mappings for select to authenticated using (public.current_profile_is_active());

create policy "rooms_authenticated_read"
on public.meeting_rooms for select to authenticated using (public.current_profile_is_active());

create policy "admin_manage_departments"
on public.departments for all to authenticated
using (public.current_profile_is_active() and public.current_app_role() = 'ADMIN')
with check (public.current_profile_is_active() and public.current_app_role() = 'ADMIN');

create policy "admin_manage_vehicles"
on public.vehicles for all to authenticated
using (public.current_profile_is_active() and public.current_app_role() = 'ADMIN')
with check (public.current_profile_is_active() and public.current_app_role() = 'ADMIN');

create policy "admin_manage_drivers"
on public.drivers for all to authenticated
using (public.current_profile_is_active() and public.current_app_role() = 'ADMIN')
with check (public.current_profile_is_active() and public.current_app_role() = 'ADMIN');

create policy "admin_manage_driver_mappings"
on public.driver_vehicle_mappings for all to authenticated
using (public.current_profile_is_active() and public.current_app_role() = 'ADMIN')
with check (public.current_profile_is_active() and public.current_app_role() = 'ADMIN');

create policy "admin_manage_rooms"
on public.meeting_rooms for all to authenticated
using (public.current_profile_is_active() and public.current_app_role() = 'ADMIN')
with check (public.current_profile_is_active() and public.current_app_role() = 'ADMIN');

create policy "vehicle_bookings_select_relevant"
on public.vehicle_bookings for select to authenticated
using (
  public.current_profile_is_active()
  and ((select auth.uid()) = requester_user_id or public.current_app_role() = 'ADMIN')
);

create policy "vehicle_bookings_insert_own"
on public.vehicle_bookings for insert to authenticated
with check (
  public.current_profile_is_active()
  and (select auth.uid()) = requester_user_id
  and (select auth.uid()) = created_by_user_id
);

create policy "vehicle_bookings_update_own_pending_cancel"
on public.vehicle_bookings for update to authenticated
using (
  public.current_profile_is_active()
  and (select auth.uid()) = requester_user_id
  and status = 'PENDING'
)
with check (
  public.current_profile_is_active()
  and (select auth.uid()) = requester_user_id
);

create policy "vehicle_routes_select_relevant"
on public.vehicle_booking_routes for select to authenticated
using (
  public.current_profile_is_active()
  and exists (
    select 1
    from public.vehicle_bookings
    where vehicle_bookings.id = vehicle_booking_routes.vehicle_booking_id
      and (
        vehicle_bookings.requester_user_id = (select auth.uid())
        or public.current_app_role() = 'ADMIN'
      )
  )
);

create policy "vehicle_routes_insert_own"
on public.vehicle_booking_routes for insert to authenticated
with check (
  public.current_profile_is_active()
  and exists (
    select 1
    from public.vehicle_bookings
    where vehicle_bookings.id = vehicle_booking_routes.vehicle_booking_id
      and vehicle_bookings.requester_user_id = (select auth.uid())
  )
);

create policy "room_bookings_select_relevant"
on public.room_bookings for select to authenticated
using (
  public.current_profile_is_active()
  and ((select auth.uid()) = requester_user_id or public.current_app_role() = 'ADMIN')
);

create policy "notifications_select_own"
on public.notifications for select to authenticated
using (public.current_profile_is_active() and (select auth.uid()) = recipient_user_id);

create policy "notifications_update_own"
on public.notifications for update to authenticated
using (public.current_profile_is_active() and (select auth.uid()) = recipient_user_id)
with check (public.current_profile_is_active() and (select auth.uid()) = recipient_user_id);

create policy "notifications_admin_insert"
on public.notifications for insert to authenticated
with check (public.current_profile_is_active() and public.current_app_role() = 'ADMIN');

create policy "audit_logs_admin_read"
on public.audit_logs for select to authenticated
using (public.current_profile_is_active() and public.current_app_role() = 'ADMIN');

insert into storage.buckets (id, name, public)
values
  ('vehicle-photos', 'vehicle-photos', false),
  ('driver-photos', 'driver-photos', false),
  ('room-assets', 'room-assets', false)
on conflict (id) do nothing;

create policy "authenticated_read_booking_assets"
on storage.objects for select to authenticated
using (
  public.current_profile_is_active()
  and bucket_id in ('vehicle-photos', 'driver-photos', 'room-assets')
);

create policy "admin_manage_booking_assets"
on storage.objects for all to authenticated
using (
  bucket_id in ('vehicle-photos', 'driver-photos', 'room-assets')
  and public.current_profile_is_active()
  and public.current_app_role() = 'ADMIN'
)
with check (
  bucket_id in ('vehicle-photos', 'driver-photos', 'room-assets')
  and public.current_profile_is_active()
  and public.current_app_role() = 'ADMIN'
);
