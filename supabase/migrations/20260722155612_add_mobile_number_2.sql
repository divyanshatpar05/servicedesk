-- Migration: Add mobile_number_2 to service_dockets for multiple mobile number support
-- Timestamp: 20260722155612

ALTER TABLE public.service_dockets
ADD COLUMN IF NOT EXISTS mobile_number_2 TEXT;
