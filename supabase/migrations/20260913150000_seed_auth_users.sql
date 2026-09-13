-- Migration: Seed auth users for all demo accounts
-- Timestamp: 20260913150000
-- Fixes: user01-user10 and tech01-tech10 were missing from auth.users,
--        causing login to always fail for those accounts.

DO $$
DECLARE
  _instance_id UUID := '00000000-0000-0000-0000-000000000000';

  -- Admin
  admin_id UUID;

  -- Users
  u01 UUID := gen_random_uuid();
  u02 UUID := gen_random_uuid();
  u03 UUID := gen_random_uuid();
  u04 UUID := gen_random_uuid();
  u05 UUID := gen_random_uuid();
  u06 UUID := gen_random_uuid();
  u07 UUID := gen_random_uuid();
  u08 UUID := gen_random_uuid();
  u09 UUID := gen_random_uuid();
  u10 UUID := gen_random_uuid();

  -- Technicians
  t01 UUID := gen_random_uuid();
  t02 UUID := gen_random_uuid();
  t03 UUID := gen_random_uuid();
  t04 UUID := gen_random_uuid();
  t05 UUID := gen_random_uuid();
  t06 UUID := gen_random_uuid();
  t07 UUID := gen_random_uuid();
  t08 UUID := gen_random_uuid();
  t09 UUID := gen_random_uuid();
  t10 UUID := gen_random_uuid();

BEGIN

  -- ----------------------------------------------------------------
  -- Ensure admin@indosales.in exists in auth.users
  -- ----------------------------------------------------------------
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@indosales.in';
  IF admin_id IS NULL THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
      is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
      recovery_token, recovery_sent_at, email_change_token_new, email_change,
      email_change_sent_at, email_change_token_current, email_change_confirm_status,
      reauthentication_token, reauthentication_sent_at, phone, phone_change,
      phone_change_token, phone_change_sent_at
    ) VALUES (
      admin_id, _instance_id, 'authenticated', 'authenticated',
      'admin@indosales.in', crypt('Admin@2026', gen_salt('bf', 10)), now(), now(), now(),
      jsonb_build_object('full_name', 'Admin User', 'role', 'admin'),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
      false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
    );
  END IF;

  -- ----------------------------------------------------------------
  -- Seed user01 through user10
  -- ----------------------------------------------------------------
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES
    (u01, _instance_id, 'authenticated', 'authenticated', 'user01@indosales.in', crypt('User01@2026', gen_salt('bf', 10)), now(), now(), now(), jsonb_build_object('full_name', 'User 01', 'role', 'user'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]), false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (u02, _instance_id, 'authenticated', 'authenticated', 'user02@indosales.in', crypt('User02@2026', gen_salt('bf', 10)), now(), now(), now(), jsonb_build_object('full_name', 'User 02', 'role', 'user'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]), false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (u03, _instance_id, 'authenticated', 'authenticated', 'user03@indosales.in', crypt('User03@2026', gen_salt('bf', 10)), now(), now(), now(), jsonb_build_object('full_name', 'User 03', 'role', 'user'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]), false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (u04, _instance_id, 'authenticated', 'authenticated', 'user04@indosales.in', crypt('User04@2026', gen_salt('bf', 10)), now(), now(), now(), jsonb_build_object('full_name', 'User 04', 'role', 'user'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]), false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (u05, _instance_id, 'authenticated', 'authenticated', 'user05@indosales.in', crypt('User05@2026', gen_salt('bf', 10)), now(), now(), now(), jsonb_build_object('full_name', 'User 05', 'role', 'user'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]), false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (u06, _instance_id, 'authenticated', 'authenticated', 'user06@indosales.in', crypt('User06@2026', gen_salt('bf', 10)), now(), now(), now(), jsonb_build_object('full_name', 'User 06', 'role', 'user'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]), false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (u07, _instance_id, 'authenticated', 'authenticated', 'user07@indosales.in', crypt('User07@2026', gen_salt('bf', 10)), now(), now(), now(), jsonb_build_object('full_name', 'User 07', 'role', 'user'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]), false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (u08, _instance_id, 'authenticated', 'authenticated', 'user08@indosales.in', crypt('User08@2026', gen_salt('bf', 10)), now(), now(), now(), jsonb_build_object('full_name', 'User 08', 'role', 'user'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]), false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (u09, _instance_id, 'authenticated', 'authenticated', 'user09@indosales.in', crypt('User09@2026', gen_salt('bf', 10)), now(), now(), now(), jsonb_build_object('full_name', 'User 09', 'role', 'user'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]), false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (u10, _instance_id, 'authenticated', 'authenticated', 'user10@indosales.in', crypt('User10@2026', gen_salt('bf', 10)), now(), now(), now(), jsonb_build_object('full_name', 'User 10', 'role', 'user'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]), false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
  ON CONFLICT (email) DO NOTHING;

  -- ----------------------------------------------------------------
  -- Seed tech01 through tech10
  -- ----------------------------------------------------------------
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES
    (t01, _instance_id, 'authenticated', 'authenticated', 'tech01@indosales.in', crypt('Tech01@2026', gen_salt('bf', 10)), now(), now(), now(), jsonb_build_object('full_name', 'Technician 01', 'role', 'technician'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]), false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (t02, _instance_id, 'authenticated', 'authenticated', 'tech02@indosales.in', crypt('Tech02@2026', gen_salt('bf', 10)), now(), now(), now(), jsonb_build_object('full_name', 'Technician 02', 'role', 'technician'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]), false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (t03, _instance_id, 'authenticated', 'authenticated', 'tech03@indosales.in', crypt('Tech03@2026', gen_salt('bf', 10)), now(), now(), now(), jsonb_build_object('full_name', 'Technician 03', 'role', 'technician'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]), false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (t04, _instance_id, 'authenticated', 'authenticated', 'tech04@indosales.in', crypt('Tech04@2026', gen_salt('bf', 10)), now(), now(), now(), jsonb_build_object('full_name', 'Technician 04', 'role', 'technician'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]), false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (t05, _instance_id, 'authenticated', 'authenticated', 'tech05@indosales.in', crypt('Tech05@2026', gen_salt('bf', 10)), now(), now(), now(), jsonb_build_object('full_name', 'Technician 05', 'role', 'technician'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]), false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (t06, _instance_id, 'authenticated', 'authenticated', 'tech06@indosales.in', crypt('Tech06@2026', gen_salt('bf', 10)), now(), now(), now(), jsonb_build_object('full_name', 'Technician 06', 'role', 'technician'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]), false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (t07, _instance_id, 'authenticated', 'authenticated', 'tech07@indosales.in', crypt('Tech07@2026', gen_salt('bf', 10)), now(), now(), now(), jsonb_build_object('full_name', 'Technician 07', 'role', 'technician'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]), false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (t08, _instance_id, 'authenticated', 'authenticated', 'tech08@indosales.in', crypt('Tech08@2026', gen_salt('bf', 10)), now(), now(), now(), jsonb_build_object('full_name', 'Technician 08', 'role', 'technician'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]), false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (t09, _instance_id, 'authenticated', 'authenticated', 'tech09@indosales.in', crypt('Tech09@2026', gen_salt('bf', 10)), now(), now(), now(), jsonb_build_object('full_name', 'Technician 09', 'role', 'technician'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]), false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (t10, _instance_id, 'authenticated', 'authenticated', 'tech10@indosales.in', crypt('Tech10@2026', gen_salt('bf', 10)), now(), now(), now(), jsonb_build_object('full_name', 'Technician 10', 'role', 'technician'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]), false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
  ON CONFLICT (email) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Auth user seeding failed: %', SQLERRM;
END $$;
