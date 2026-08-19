-- Run consciously in a development Supabase project only.
-- The seed does not create Auth users and is safe to rerun.
do $$
declare
  demo_project_id uuid;
begin
  insert into public.projects (
    order_number,
    title,
    customer_name,
    customer_email,
    status,
    next_step,
    next_step_date
  ) values (
    'YAM-TEST-001',
    'Kuchnia + zabudowa',
    'Jan Testowy',
    'jan.testowy@example.com',
    'production',
    'Kontrola dopasowania frontów',
    current_date + 7
  )
  on conflict (order_number) do update set
    title = excluded.title,
    customer_name = excluded.customer_name,
    customer_email = excluded.customer_email,
    status = excluded.status,
    next_step = excluded.next_step,
    next_step_date = excluded.next_step_date
  returning id into demo_project_id;

  insert into public.project_updates (
    id, project_id, title, description, status, created_at, created_by
  ) values
  (
    '00000000-0000-4000-8000-000000000101',
    demo_project_id,
    'Zamówienie przyjęte',
    'Potwierdziliśmy zakres realizacji i rozpoczęliśmy przygotowania.',
    'accepted',
    now() - interval '21 days',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    demo_project_id,
    'Pomiar zakończony',
    'Wymiary zostały zweryfikowane na miejscu. Dokumentacja trafiła do pracowni.',
    'measurement',
    now() - interval '14 days',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000103',
    demo_project_id,
    'Rozpoczęliśmy produkcję',
    'Materiały są skompletowane. Elementy zabudowy są obecnie wykonywane w naszej pracowni.',
    'production',
    now() - interval '2 days',
    null
  )
  on conflict (id) do update set
    project_id = excluded.project_id,
    title = excluded.title,
    description = excluded.description,
    status = excluded.status,
    created_at = excluded.created_at;
end $$;
