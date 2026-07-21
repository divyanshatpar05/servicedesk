-- Spare Parts with Amount
ALTER TABLE master_setup ADD COLUMN IF NOT EXISTS spare_amount numeric(10,2) DEFAULT 0;

-- Spare Inward table
CREATE TABLE IF NOT EXISTS public.spare_inward (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_no integer NOT NULL,
  adjustment_note text,
  inward_date date NOT NULL DEFAULT CURRENT_DATE,
  inward_time time NOT NULL DEFAULT CURRENT_TIME,
  spare_total numeric(10,2) DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.spare_inward_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inward_id uuid REFERENCES public.spare_inward(id) ON DELETE CASCADE,
  sl_no integer NOT NULL,
  spare_name text NOT NULL,
  qty numeric(10,2) DEFAULT 0,
  rate numeric(10,2) DEFAULT 0,
  total numeric(10,2) DEFAULT 0
);

-- Activity Log table
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  user_name text,
  action_type text NOT NULL,
  action_description text NOT NULL,
  entity_type text,
  entity_id text,
  created_at timestamptz DEFAULT now()
);

-- Geo tracking table
CREATE TABLE IF NOT EXISTS public.geo_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_name text NOT NULL,
  docket_no text,
  customer_name text,
  latitude numeric(10,6),
  longitude numeric(10,6),
  status text DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.spare_inward ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spare_inward_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geo_tracking ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'spare_inward' AND policyname = 'spare_inward_all') THEN
    CREATE POLICY spare_inward_all ON public.spare_inward FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'spare_inward_items' AND policyname = 'spare_inward_items_all') THEN
    CREATE POLICY spare_inward_items_all ON public.spare_inward_items FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activity_log' AND policyname = 'activity_log_all') THEN
    CREATE POLICY activity_log_all ON public.activity_log FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'geo_tracking' AND policyname = 'geo_tracking_all') THEN
    CREATE POLICY geo_tracking_all ON public.geo_tracking FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
