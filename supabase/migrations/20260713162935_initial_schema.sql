-- Migration: Indo Sales and Service Desk - Initial Schema
-- Timestamp: 20260713162935

-- ============================================================
-- 1. TYPES
-- ============================================================
DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'technician');

DROP TYPE IF EXISTS public.docket_status CASCADE;
CREATE TYPE public.docket_status AS ENUM ('RUNNING', 'COMPLETED', 'PENDING', 'CANCELLED');

DROP TYPE IF EXISTS public.payment_mode CASCADE;
CREATE TYPE public.payment_mode AS ENUM ('CASH', 'BANK', 'ONLINE', 'UPI');

DROP TYPE IF EXISTS public.amc_status CASCADE;
CREATE TYPE public.amc_status AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED', 'PENDING');

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

-- User profiles (linked to auth.users via trigger)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  role public.user_role DEFAULT 'admin'::public.user_role,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  alternate_mobile TEXT,
  address TEXT,
  area TEXT,
  zipcode TEXT,
  card_no TEXT,
  card_detail TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Master setup categories
CREATE TABLE IF NOT EXISTS public.master_setup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Service dockets
CREATE TABLE IF NOT EXISTS public.service_dockets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  docket_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  alternate_mobile TEXT,
  customer_address TEXT,
  area TEXT,
  zipcode TEXT,
  card_no TEXT,
  card_detail TEXT,
  model_no TEXT,
  nature_of_docket TEXT,
  docket_detail TEXT,
  docket_status public.docket_status DEFAULT 'RUNNING'::public.docket_status,
  reminder1 TEXT,
  feedback TEXT,
  sale_point TEXT,
  sales_executive TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Technician allotments
CREATE TABLE IF NOT EXISTS public.technician_allotments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  docket_id UUID REFERENCES public.service_dockets(id) ON DELETE CASCADE,
  docket_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  area TEXT,
  model TEXT,
  service_engineer TEXT,
  service_mode TEXT,
  payment_type TEXT,
  payment_mode public.payment_mode DEFAULT 'CASH'::public.payment_mode,
  total_amount DECIMAL(10,2) DEFAULT 0,
  spare_part_amount DECIMAL(10,2) DEFAULT 0,
  spare_part_name TEXT,
  allotment_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  geo_link TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  geo_start_time TIMESTAMPTZ,
  geo_end_time TIMESTAMPTZ,
  geo_start_lat DECIMAL(10,8),
  geo_start_lng DECIMAL(11,8),
  geo_end_lat DECIMAL(10,8),
  geo_end_lng DECIMAL(11,8),
  work_status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- AMC renewals
CREATE TABLE IF NOT EXISTS public.amc_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  docket_id UUID REFERENCES public.service_dockets(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  model TEXT,
  amc_type TEXT,
  total_services INTEGER DEFAULT 3,
  completed_services INTEGER DEFAULT 0,
  amc_status public.amc_status DEFAULT 'ACTIVE'::public.amc_status,
  start_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  next_service_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON public.customers(mobile_number);
CREATE INDEX IF NOT EXISTS idx_master_setup_user_category ON public.master_setup(user_id, category);
CREATE INDEX IF NOT EXISTS idx_service_dockets_user_id ON public.service_dockets(user_id);
CREATE INDEX IF NOT EXISTS idx_service_dockets_number ON public.service_dockets(docket_number);
CREATE INDEX IF NOT EXISTS idx_service_dockets_customer ON public.service_dockets(customer_id);
CREATE INDEX IF NOT EXISTS idx_technician_allotments_user_id ON public.technician_allotments(user_id);
CREATE INDEX IF NOT EXISTS idx_technician_allotments_docket ON public.technician_allotments(docket_id);
CREATE INDEX IF NOT EXISTS idx_technician_allotments_geo ON public.technician_allotments(geo_link);
CREATE INDEX IF NOT EXISTS idx_amc_renewals_user_id ON public.amc_renewals(user_id);
CREATE INDEX IF NOT EXISTS idx_amc_renewals_customer ON public.amc_renewals(customer_id);

-- ============================================================
-- 4. FUNCTIONS
-- ============================================================

-- Auto-create user_profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin')::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- ============================================================
-- 5. ENABLE RLS
-- ============================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_setup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_dockets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_allotments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amc_renewals ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. RLS POLICIES
-- ============================================================

-- user_profiles
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles FOR ALL TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- customers
DROP POLICY IF EXISTS "users_manage_own_customers" ON public.customers;
CREATE POLICY "users_manage_own_customers"
ON public.customers FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- master_setup
DROP POLICY IF EXISTS "users_manage_own_master_setup" ON public.master_setup;
CREATE POLICY "users_manage_own_master_setup"
ON public.master_setup FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- service_dockets
DROP POLICY IF EXISTS "users_manage_own_service_dockets" ON public.service_dockets;
CREATE POLICY "users_manage_own_service_dockets"
ON public.service_dockets FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- technician_allotments
DROP POLICY IF EXISTS "users_manage_own_technician_allotments" ON public.technician_allotments;
CREATE POLICY "users_manage_own_technician_allotments"
ON public.technician_allotments FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- technician_allotments public read for geo link (technician work portal)
DROP POLICY IF EXISTS "public_read_technician_allotments_by_geo" ON public.technician_allotments;
CREATE POLICY "public_read_technician_allotments_by_geo"
ON public.technician_allotments FOR SELECT TO public
USING (geo_link IS NOT NULL);

-- amc_renewals
DROP POLICY IF EXISTS "users_manage_own_amc_renewals" ON public.amc_renewals;
CREATE POLICY "users_manage_own_amc_renewals"
ON public.amc_renewals FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 7. TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_customers_updated ON public.customers;
CREATE TRIGGER on_customers_updated
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_service_dockets_updated ON public.service_dockets;
CREATE TRIGGER on_service_dockets_updated
  BEFORE UPDATE ON public.service_dockets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_technician_allotments_updated ON public.technician_allotments;
CREATE TRIGGER on_technician_allotments_updated
  BEFORE UPDATE ON public.technician_allotments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_amc_renewals_updated ON public.amc_renewals;
CREATE TRIGGER on_amc_renewals_updated
  BEFORE UPDATE ON public.amc_renewals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 8. MOCK DATA
-- ============================================================
DO $$
DECLARE
  admin_uuid UUID := gen_random_uuid();
BEGIN
  -- Create admin auth user
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES (
    admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'admin@indosales.in', crypt('Admin@2026', gen_salt('bf', 10)), now(), now(), now(),
    jsonb_build_object('full_name', 'Admin User', 'role', 'admin'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
    false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
  )
  ON CONFLICT (id) DO NOTHING;

  -- Seed default master setup values for the admin
  INSERT INTO public.master_setup (user_id, category, value, sort_order) VALUES
    (admin_uuid, 'service_engineers', 'Rajesh Kumar', 1),
    (admin_uuid, 'service_engineers', 'Suresh Sharma', 2),
    (admin_uuid, 'service_engineers', 'Amit Singh', 3),
    (admin_uuid, 'service_modes', 'On-Site', 1),
    (admin_uuid, 'service_modes', 'In-House', 2),
    (admin_uuid, 'service_modes', 'Remote', 3),
    (admin_uuid, 'payment_modes', 'CASH', 1),
    (admin_uuid, 'payment_modes', 'BANK', 2),
    (admin_uuid, 'payment_modes', 'ONLINE', 3),
    (admin_uuid, 'payment_modes', 'UPI', 4),
    (admin_uuid, 'payment_types', 'Free Service', 1),
    (admin_uuid, 'payment_types', 'Paid Service', 2),
    (admin_uuid, 'payment_types', 'AMC', 3),
    (admin_uuid, 'spare_parts', 'Burner', 1),
    (admin_uuid, 'spare_parts', 'Igniter', 2),
    (admin_uuid, 'spare_parts', 'Valve', 3),
    (admin_uuid, 'spare_parts', 'Thermocouple', 4),
    (admin_uuid, 'amc_types', 'Annual (3 Services)', 1),
    (admin_uuid, 'amc_types', 'Annual (2 Services)', 2),
    (admin_uuid, 'amc_types', 'Bi-Annual (1 Service)', 3),
    (admin_uuid, 'nature_of_docket', 'Gas Leakage', 1),
    (admin_uuid, 'nature_of_docket', 'No Ignition', 2),
    (admin_uuid, 'nature_of_docket', 'Low Flame', 3),
    (admin_uuid, 'nature_of_docket', 'Installation', 4),
    (admin_uuid, 'nature_of_docket', 'Annual Service', 5),
    (admin_uuid, 'docket_status', 'RUNNING', 1),
    (admin_uuid, 'docket_status', 'COMPLETED', 2),
    (admin_uuid, 'docket_status', 'PENDING', 3),
    (admin_uuid, 'docket_status', 'CANCELLED', 4),
    (admin_uuid, 'sale_points', 'Direct', 1),
    (admin_uuid, 'sale_points', 'Dealer', 2),
    (admin_uuid, 'sale_points', 'Online', 3),
    (admin_uuid, 'sales_executives', 'Priya Mehta', 1),
    (admin_uuid, 'sales_executives', 'Rohit Verma', 2),
    (admin_uuid, 'model_numbers', 'Kutchina Hob 2B', 1),
    (admin_uuid, 'model_numbers', 'Kutchina Hob 3B', 2),
    (admin_uuid, 'model_numbers', 'Kutchina Hob 4B', 3),
    (admin_uuid, 'model_numbers', 'Kutchina Chimney 60', 4),
    (admin_uuid, 'model_numbers', 'Kutchina Chimney 90', 5),
    (admin_uuid, 'model_numbers', 'Kutchina Built-in Hob', 6),
    (admin_uuid, 'model_numbers', 'Kutchina Gas Oven', 7),
    (admin_uuid, 'model_numbers', 'Kutchina Cooktop', 8)
  ON CONFLICT DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;
