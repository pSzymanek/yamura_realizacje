-- Dodanie obslugi projektow wewnetrznych pracowni oraz podetapow z datami
alter table public.projects
  add column if not exists is_internal boolean not null default false,
  alter column customer_name drop not null,
  alter column customer_email drop not null;

alter table public.project_updates
  add column if not exists stage text,
  add column if not exists event_date date;

create index if not exists project_updates_stage_idx
  on public.project_updates(stage);

create index if not exists project_updates_event_date_idx
  on public.project_updates(event_date desc);

create or replace function public.publish_project_update(
  p_project_id uuid,
  p_update_id uuid,
  p_title text,
  p_description text,
  p_status public.project_status,
  p_next_step text,
  p_next_step_date date,
  p_attachments jsonb default '[]'::jsonb,
  p_stage text default null,
  p_event_date date default null
)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $func$
begin
  if not public.is_active_staff() then
    raise exception 'not_authorized';
  end if;

  insert into public.project_updates (
    id, project_id, title, description, status, stage, event_date, created_by
  ) values (
    p_update_id, p_project_id, trim(p_title), trim(p_description), p_status, nullif(trim(p_stage), ''), p_event_date, auth.uid()
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
$func$;

revoke all on function public.publish_project_update(
  uuid, uuid, text, text, public.project_status, text, date, jsonb, text, date
) from public;
grant execute on function public.publish_project_update(
  uuid, uuid, text, text, public.project_status, text, date, jsonb, text, date
) to authenticated;