-- Grant staff and service_role full permissions on project_updates, attachments and invitations
grant select, insert, update, delete on table public.project_updates to postgres, service_role, authenticated;
grant select, insert, update, delete on table public.attachments to postgres, service_role, authenticated;
grant select, insert, update, delete on table public.invitations to postgres, service_role, authenticated;

drop policy if exists "Active staff can delete updates" on public.project_updates;
create policy "Active staff can delete updates"
on public.project_updates for delete
to authenticated
using (public.is_active_staff());

drop policy if exists "Active staff can update updates" on public.project_updates;
create policy "Active staff can update updates"
on public.project_updates for update
to authenticated
using (public.is_active_staff())
with check (public.is_active_staff());

drop policy if exists "Active staff can delete attachments" on public.attachments;
create policy "Active staff can delete attachments"
on public.attachments for delete
to authenticated
using (public.is_active_staff());

-- RPC procedure to delete a project update with security definer
create or replace function public.delete_project_update(p_update_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_active_staff() then
    raise exception 'not_authorized';
  end if;

  delete from public.attachments where project_update_id = p_update_id;
  delete from public.project_updates where id = p_update_id;
  return true;
end;
$$;

revoke all on function public.delete_project_update(uuid) from public;
grant execute on function public.delete_project_update(uuid) to authenticated;
