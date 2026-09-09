-- Allow the trusted backend client to render private project links.
-- Anonymous users still have no direct table access.
grant select on public.projects to service_role;
grant select on public.project_updates to service_role;
grant select on public.attachments to service_role;
