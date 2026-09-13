-- Migration: Add docket_date column to service_dockets for storing the actual docket date
-- Timestamp: 20260807185000

ALTER TABLE public.service_dockets
ADD COLUMN IF NOT EXISTS docket_date DATE;
