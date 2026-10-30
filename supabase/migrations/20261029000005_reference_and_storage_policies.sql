-- Enforce RLS on all public tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
  END LOOP;
END $$;

-- Reference & Catalog tables read policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'branches' AND policyname = 'Branches: readable by all') THEN
    CREATE POLICY "Branches: readable by all" ON public.branches FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clinic_settings' AND policyname = 'Settings: readable by all') THEN
    CREATE POLICY "Settings: readable by all" ON public.clinic_settings FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Services: readable by all') THEN
    CREATE POLICY "Services: readable by all" ON public.services FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dentists' AND policyname = 'Dentists: readable by all') THEN
    CREATE POLICY "Dentists: readable by all" ON public.dentists FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'roles' AND policyname = 'Roles: readable by authenticated') THEN
    CREATE POLICY "Roles: readable by authenticated" ON public.roles FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teeth' AND policyname = 'Teeth: readable by authenticated') THEN
    CREATE POLICY "Teeth: readable by authenticated" ON public.teeth FOR SELECT TO authenticated USING (true);
  END IF;
END $$;
