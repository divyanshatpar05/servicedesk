-- Migration: Add mobile_number_3 to customers for 3-contact-number support
-- Timestamp: 20260722190000

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS mobile_number_3 TEXT;
