-- Address Supabase security advisor findings after initial RLS setup.

alter function public.current_app_role() set search_path = '';
alter function public.current_profile_is_active() set search_path = '';

create policy "recurring_series_select_relevant"
on public.recurring_series for select
to authenticated
using (
  public.current_profile_is_active()
  and (
    (select auth.uid()) = requester_user_id
    or (select auth.uid()) = created_by_user_id
    or public.current_app_role() = 'ADMIN'
  )
);
