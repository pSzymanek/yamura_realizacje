-- ==========================================================================
-- Fix Permissions & RLS for service_role and authenticated staff in Supabase
-- ==========================================================================

-- 1. Zapewnij pełne uprawnienia dla klienta serwisowego (service_role)
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all routines in schema public to service_role;

alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on routines to service_role;

grant all on table public.profiles to service_role;
grant all on table public.projects to service_role;
grant all on table public.project_updates to service_role;
grant all on table public.attachments to service_role;
grant all on table public.invitations to service_role;

-- 2. Uprawnienia dla zalogowanych pracowników (authenticated)
grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.projects to authenticated;
grant select, insert, update, delete on table public.project_updates to authenticated;
grant select, insert, update, delete on table public.attachments to authenticated;
grant select, insert, update, delete on table public.invitations to authenticated;

-- 3. Polityki RLS dla tabeli profiles
-- Pracownicy (is_active_staff()) mogą odczytywać, modyfikować i dodawać profile
drop policy if exists "Staff can update any profile" on public.profiles;
create policy "Staff can update any profile"
on public.profiles for update
to authenticated
using (public.is_active_staff())
with check (public.is_active_staff());

drop policy if exists "Staff can read all profiles" on public.profiles;
create policy "Staff can read all profiles"
on public.profiles for select
to authenticated
using (public.is_active_staff());

drop policy if exists "Staff can insert profiles" on public.profiles;
create policy "Staff can insert profiles"
on public.profiles for insert
to authenticated
with check (public.is_active_staff());

drop policy if exists "Staff can delete profiles" on public.profiles;
create policy "Staff can delete profiles"
on public.profiles for delete
to authenticated
using (public.is_active_staff());
