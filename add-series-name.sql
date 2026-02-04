-- Add series_name column to entries table
-- This allows grouping related content (e.g., multiple seasons of a show)
ALTER TABLE public.entries ADD COLUMN IF NOT EXISTS series_name TEXT;
