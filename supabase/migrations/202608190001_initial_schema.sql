-- YAMURA Dziennik Realizacji — initial schema, RLS and private Storage.
create extension if not exists pgcrypto with schema extensions;

create type public.staff_role as enum ('admin', 'employee');
create type public.project_status as enum (
  'accepted',
  'measurement',
  'documentation',
  'materials_ordered',
  'materials_ready',
  'production',
  'quality_control',
  'ready_for_installation',
  'installation',
  'acceptance',
  'completed',
  'waiting_for_customer'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text check (full_name is null or char_length(full_name) <= 120),
  role public.staff_role not null default 'employee',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique check (char_length(order_number) between 1 and 80),
  title text not null check (char_length(title) between 1 and 160),
  customer_name text not null check (char_length(customer_name) between 1 and 160),
  customer_email text not null check (char_length(customer_email) between 3 and 254),
  status public.project_status not null default 'accepted',
  next_step text check (next_step is null or char_length(next_step) <= 300),
  next_step_date date,
  access_token text not null unique default encode(extensions.gen_random_bytes(32), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint access_token_is_256_bit_hex check (access_token ~ '^[0-9a-f]{64}$')
);

create table public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  description text not null check (char_length(description) between 1 and 5000),
  status public.project_status,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  project_update_id uuid not null references public.project_updates(id) on delete cascade,
  storage_path text not null unique check (char_length(storage_path) between 1 and 1000),
  original_filename text not null check (char_length(original_filename) between 1 and 255),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  created_at timestamptz not null default now()
);

create index projects_status_idx on public.projects(status);
create index projects_updated_at_idx on public.projects(updated_at desc);
create index project_updates_project_created_idx
  on public.project_updates(project_id, created_at desc);
create index attachments_project_update_idx on public.attachments(project_update_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

revoke all on function public.handle_new_user() from public;

create or replace function public.is_active_staff()
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
      and role in ('admin', 'employee')
  );
$$;

revoke all on function public.is_active_staff() from public;
grant execute on function public.is_active_staff() to authenticated;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_updates enable row level security;
alter table public.attachments enable row level security;

create policy "Staff can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid() and is_active = true);

create policy "Active staff can read projects"
on public.projects for select
to authenticated
using (public.is_active_staff());

create policy "Active staff can create projects"
on public.projects for insert
to authenticated
with check (public.is_active_staff());

create policy "Active staff can update projects"
on public.projects for update
to authenticated
using (public.is_active_staff())
with check (public.is_active_staff());

create policy "Active staff can read updates"
on public.project_updates for select
to authenticated
using (public.is_active_staff());

create policy "Active staff can create updates"
on public.project_updates for insert
to authenticated
with check (public.is_active_staff() and created_by = auth.uid());

create policy "Active staff can read attachments"
on public.attachments for select
to authenticated
using (public.is_active_staff());

create policy "Active staff can create attachments"
on public.attachments for insert
to authenticated
with check (public.is_active_staff());

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.projects from anon, authenticated;
revoke all on table public.project_updates from anon, authenticated;
revoke all on table public.attachments from anon, authenticated;

grant select on table public.profiles to authenticated;
grant select, insert, update on table public.projects to authenticated;
grant select, insert on table public.project_updates to authenticated;
grant select, insert on table public.attachments to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-attachments',
  'project-attachments',
  false,
  6291456,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Active staff can upload project attachments"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'project-attachments'
  and public.is_active_staff()
  and (storage.foldername(name))[1] = 'projects'
);

create policy "Active staff can read project attachments"
on storage.objects for select
to authenticated
using (
  bucket_id = 'project-attachments'
  and public.is_active_staff()
);

create policy "Active staff can delete project attachments"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'project-attachments'
  and public.is_active_staff()
);

create or replace function public.publish_project_update(
  p_project_id uuid,
  p_update_id uuid,
  p_title text,
  p_description text,
  p_status public.project_status,
  p_next_step text,
  p_next_step_date date,
  p_attachments jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if not public.is_active_staff() then
    raise exception 'not_authorized';
  end if;

  insert into public.project_updates (
    id, project_id, title, description, status, created_by
  ) values (
    p_update_id, p_project_id, trim(p_title), trim(p_description), p_status, auth.uid()
  );

  insert into public.attachments (
    project_update_id,
    storage_path,
    original_filename,
    mime_type
  )
  select
    p_update_id,
    item ->> 'storage_path',
    item ->> 'original_filename',
    item ->> 'mime_type'
  from jsonb_array_elements(coalesce(p_attachments, '[]'::jsonb)) as item;

  update public.projects
  set
    status = coalesce(p_status, status),
    next_step = nullif(trim(p_next_step), ''),
    next_step_date = p_next_step_date
  where id = p_project_id;

  if not found then
    raise exception 'project_not_found';
  end if;

  return p_update_id;
end;
$$;

revoke all on function public.publish_project_update(
  uuid, uuid, text, text, public.project_status, text, date, jsonb
) from public;
grant execute on function public.publish_project_update(
  uuid, uuid, text, text, public.project_status, text, date, jsonb
) to authenticated;

-- No table or Storage policy is granted to anon. Client views are served only
-- through trusted server-side application code after matching a 256-bit token.
