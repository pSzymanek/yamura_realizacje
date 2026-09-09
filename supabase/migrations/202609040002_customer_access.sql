-- Customer accounts, profile data and customer-scoped access policies.
alter table public.profiles
  alter column role set default 'customer';

alter table public.profiles
  add column if not exists phone text check (phone is null or char_length(phone) <= 40),
  add column if not exists address_line1 text check (address_line1 is null or char_length(address_line1) <= 180),
  add column if not exists address_line2 text check (address_line2 is null or char_length(address_line2) <= 180),
  add column if not exists postal_code text check (postal_code is null or char_length(postal_code) <= 20),
  add column if not exists city text check (city is null or char_length(city) <= 100);

alter table public.projects
  add column if not exists customer_user_id uuid references auth.users(id) on delete set null;

create index if not exists projects_customer_user_idx
  on public.projects(customer_user_id, updated_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''))
  on conflict (id) do nothing;

  update public.projects
  set customer_user_id = new.id
  where customer_user_id is null
    and new.email is not null
    and lower(trim(customer_email)) = lower(trim(new.email));

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

create or replace function public.link_project_customer_by_email()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  select id
  into new.customer_user_id
  from auth.users
  where lower(email) = lower(trim(new.customer_email))
  limit 1;

  return new;
end;
$$;

revoke all on function public.link_project_customer_by_email() from public;

drop trigger if exists projects_link_customer_by_email on public.projects;
create trigger projects_link_customer_by_email
before insert or update of customer_email on public.projects
for each row execute function public.link_project_customer_by_email();

update public.projects as project
set customer_user_id = account.id
from auth.users as account
where project.customer_user_id is null
  and account.email is not null
  and lower(trim(project.customer_email)) = lower(trim(account.email));

create or replace function public.is_active_customer()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_active = true
      and role = 'customer'
  );
$$;

revoke all on function public.is_active_customer() from public;
grant execute on function public.is_active_customer() to authenticated;

create policy "Customers can update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid() and is_active = true and role = 'customer')
with check (id = auth.uid() and is_active = true and role = 'customer');

create policy "Customers can read linked projects"
on public.projects for select
to authenticated
using (public.is_active_customer() and customer_user_id = auth.uid());

create policy "Customers can read linked project updates"
on public.project_updates for select
to authenticated
using (
  public.is_active_customer()
  and exists (
    select 1 from public.projects
    where projects.id = project_updates.project_id
      and projects.customer_user_id = auth.uid()
  )
);

create policy "Customers can read linked attachments"
on public.attachments for select
to authenticated
using (
  public.is_active_customer()
  and exists (
    select 1
    from public.project_updates
    join public.projects on projects.id = project_updates.project_id
    where project_updates.id = attachments.project_update_id
      and projects.customer_user_id = auth.uid()
  )
);

create policy "Customers can read linked storage objects"
on storage.objects for select
to authenticated
using (
  bucket_id = 'project-attachments'
  and public.is_active_customer()
  and exists (
    select 1
    from public.attachments
    join public.project_updates on project_updates.id = attachments.project_update_id
    join public.projects on projects.id = project_updates.project_id
    where attachments.storage_path = storage.objects.name
      and projects.customer_user_id = auth.uid()
  )
);

grant update (
  full_name, phone, address_line1, address_line2, postal_code, city, updated_at
) on table public.profiles to authenticated;
