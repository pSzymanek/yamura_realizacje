-- 202609090003_seed_quote_attachments.sql
-- Dołączenie kart wycen ze statycznymi plikami w /uploads/quotes/ do poszczególnych realizacji

DO $$
DECLARE
  v_proj_id uuid;
  v_update_id uuid;
BEGIN
  -- 1. YAM/2026/92 (Małgorzata Kozieł)
  SELECT id INTO v_proj_id FROM public.projects WHERE order_number = 'YAM/2026/92' LIMIT 1;
  IF v_proj_id IS NOT NULL THEN
    DELETE FROM public.project_updates WHERE project_id = v_proj_id AND title = 'Wycena zamówienia';
    
    INSERT INTO public.project_updates (project_id, title, description, status, stage, event_date, created_at)
    VALUES (v_proj_id, 'Wycena zamówienia', 'Karta wyceny i specyfikacja prac stolarskich przygotowana dla klienta.', 'accepted', 'Wycena i oferta', '2026-09-01', now())
    RETURNING id INTO v_update_id;

    INSERT INTO public.attachments (project_update_id, storage_path, original_filename, mime_type, created_at)
    VALUES (v_update_id, '/uploads/quotes/yam-2026-92-wycena.jpg', 'wycena.jpg', 'image/jpeg', now());
  END IF;

  -- 2. YAM/2026/93A (Latre Design)
  SELECT id INTO v_proj_id FROM public.projects WHERE order_number = 'YAM/2026/93A' LIMIT 1;
  IF v_proj_id IS NOT NULL THEN
    DELETE FROM public.project_updates WHERE project_id = v_proj_id AND title = 'Wycena zamówienia';
    
    INSERT INTO public.project_updates (project_id, title, description, status, stage, event_date, created_at)
    VALUES (v_proj_id, 'Wycena zamówienia', 'Karta wyceny i specyfikacja prac stolarskich przygotowana dla klienta.', 'accepted', 'Wycena i oferta', '2026-09-01', now())
    RETURNING id INTO v_update_id;

    INSERT INTO public.attachments (project_update_id, storage_path, original_filename, mime_type, created_at)
    VALUES (v_update_id, '/uploads/quotes/yam-2026-93a-wycena.jpg', 'wycena.jpg', 'image/jpeg', now());
  END IF;

  -- 3. YAM/2026/94 (Anna Rakowska - Mazur)
  SELECT id INTO v_proj_id FROM public.projects WHERE order_number = 'YAM/2026/94' LIMIT 1;
  IF v_proj_id IS NOT NULL THEN
    DELETE FROM public.project_updates WHERE project_id = v_proj_id AND title = 'Wycena zamówienia';
    
    INSERT INTO public.project_updates (project_id, title, description, status, stage, event_date, created_at)
    VALUES (v_proj_id, 'Wycena zamówienia', 'Zestawienie wyceny etapów (kuchnia, sypialnia, biuro) w trzech kartach kalkulacyjnych.', 'accepted', 'Wycena i oferta', '2026-09-01', now())
    RETURNING id INTO v_update_id;

    INSERT INTO public.attachments (project_update_id, storage_path, original_filename, mime_type, created_at)
    VALUES 
      (v_update_id, '/uploads/quotes/yam-2026-94-wycena_1.jpg', 'wycena_1.jpg', 'image/jpeg', now()),
      (v_update_id, '/uploads/quotes/yam-2026-94-wycena_2.png', 'wycena_2.png', 'image/png', now()),
      (v_update_id, '/uploads/quotes/yam-2026-94-wycena_3.jpg', 'wycena_3.jpg', 'image/jpeg', now());
  END IF;

  -- 4. YAM/2026/95 (Goodhome Studio)
  SELECT id INTO v_proj_id FROM public.projects WHERE order_number = 'YAM/2026/95' LIMIT 1;
  IF v_proj_id IS NOT NULL THEN
    DELETE FROM public.project_updates WHERE project_id = v_proj_id AND title = 'Wycena zamówienia';
    
    INSERT INTO public.project_updates (project_id, title, description, status, stage, event_date, created_at)
    VALUES (v_proj_id, 'Wycena zamówienia', 'Karta wyceny i specyfikacja zabudowy łazienki.', 'accepted', 'Wycena i oferta', '2026-09-01', now())
    RETURNING id INTO v_update_id;

    INSERT INTO public.attachments (project_update_id, storage_path, original_filename, mime_type, created_at)
    VALUES (v_update_id, '/uploads/quotes/yam-2026-95-wycena.png', 'wycena.png', 'image/png', now());
  END IF;

  -- 5. YAM/2026/96 (Provisual biuro projektowe)
  SELECT id INTO v_proj_id FROM public.projects WHERE order_number = 'YAM/2026/96' LIMIT 1;
  IF v_proj_id IS NOT NULL THEN
    DELETE FROM public.project_updates WHERE project_id = v_proj_id AND title = 'Wycena zamówienia';
    
    INSERT INTO public.project_updates (project_id, title, description, status, stage, event_date, created_at)
    VALUES (v_proj_id, 'Wycena zamówienia', 'Karta wyceny i specyfikacja prac stolarskich (kuchnia, szafy, zabudowa geberitu).', 'accepted', 'Wycena i oferta', '2026-09-01', now())
    RETURNING id INTO v_update_id;

    INSERT INTO public.attachments (project_update_id, storage_path, original_filename, mime_type, created_at)
    VALUES (v_update_id, '/uploads/quotes/yam-2026-96-wycena.png', 'wycena.png', 'image/png', now());
  END IF;

END $$;
