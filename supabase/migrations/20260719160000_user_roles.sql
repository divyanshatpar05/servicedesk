-- Migration: Add technician and user accounts
-- Timestamp: 20260719160000

-- Create technician logins (tech01 through tech10)
-- These are created as Supabase auth users via the admin API
-- The role is stored in user_metadata

-- Create a user_roles table to track roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  "role" text NOT NULL CHECK (role IN ('admin', 'user', 'technician')),
  display_name text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own role
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Allow admin to read all roles
DROP POLICY IF EXISTS "Admin can read all roles" ON public.user_roles;
CREATE POLICY "Admin can read all roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
      AND ur.role = 'admin'
    )
  );

-- Insert known roles for technicians and users
INSERT INTO public.user_roles (email, role, display_name) VALUES
  ('admin@indosales.in', 'admin', 'Admin'),
  ('tech01@indosales.in', 'technician', 'Technician 01'),
  ('tech02@indosales.in', 'technician', 'Technician 02'),
  ('tech03@indosales.in', 'technician', 'Technician 03'),
  ('tech04@indosales.in', 'technician', 'Technician 04'),
  ('tech05@indosales.in', 'technician', 'Technician 05'),
  ('tech06@indosales.in', 'technician', 'Technician 06'),
  ('tech07@indosales.in', 'technician', 'Technician 07'),
  ('tech08@indosales.in', 'technician', 'Technician 08'),
  ('tech09@indosales.in', 'technician', 'Technician 09'),
  ('tech10@indosales.in', 'technician', 'Technician 10'),
  ('user01@indosales.in', 'user', 'User 01'),
  ('user02@indosales.in', 'user', 'User 02'),
  ('user03@indosales.in', 'user', 'User 03'),
  ('user04@indosales.in', 'user', 'User 04'),
  ('user05@indosales.in', 'user', 'User 05'),
  ('user06@indosales.in', 'user', 'User 06'),
  ('user07@indosales.in', 'user', 'User 07'),
  ('user08@indosales.in', 'user', 'User 08'),
  ('user09@indosales.in', 'user', 'User 09'),
  ('user10@indosales.in', 'user', 'User 10')
ON CONFLICT (email) DO NOTHING;
