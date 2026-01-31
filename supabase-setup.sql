-- Content Review Database - Supabase Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create entries table
CREATE TABLE IF NOT EXISTS public.entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    year_reviewed INTEGER NOT NULL CHECK (year_reviewed >= 2022 AND year_reviewed <= 2025),
    score NUMERIC(2,1) NOT NULL CHECK (score >= 0 AND score <= 5 AND (score * 2) = FLOOR(score * 2)),
    medium TEXT NOT NULL CHECK (medium IN ('Movie', 'TV')),
    type TEXT NOT NULL CHECK (type IN (
        'Movies',
        'Documentary/True Crime',
        'Sports',
        'Drama TV',
        'Comedy TV',
        'Comedy Specials',
        'Reality Competition',
        'Reality Dating',
        'Comic Book Stuff',
        'Home Improvement'
    )),
    tags TEXT[] NOT NULL DEFAULT '{}',
    hall_of_fame BOOLEAN NOT NULL DEFAULT FALSE,
    poster_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES public.entries(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('agree', 'disagree-higher', 'disagree-lower')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_entries_score ON public.entries(score DESC);
CREATE INDEX IF NOT EXISTS idx_entries_year_reviewed ON public.entries(year_reviewed DESC);
CREATE INDEX IF NOT EXISTS idx_entries_medium ON public.entries(medium);
CREATE INDEX IF NOT EXISTS idx_entries_type ON public.entries(type);
CREATE INDEX IF NOT EXISTS idx_entries_hall_of_fame ON public.entries(hall_of_fame) WHERE hall_of_fame = TRUE;
CREATE INDEX IF NOT EXISTS idx_entries_tags ON public.entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_votes_entry_id ON public.votes(entry_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on entries
DROP TRIGGER IF EXISTS update_entries_updated_at ON public.entries;
CREATE TRIGGER update_entries_updated_at
    BEFORE UPDATE ON public.entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for entries table
-- Allow anyone to read entries
CREATE POLICY "Allow public read access to entries"
    ON public.entries FOR SELECT
    USING (true);

-- Allow anyone to insert entries (for admin interface - we'll handle auth in the app)
CREATE POLICY "Allow public insert access to entries"
    ON public.entries FOR INSERT
    WITH CHECK (true);

-- Allow anyone to update entries (for admin interface)
CREATE POLICY "Allow public update access to entries"
    ON public.entries FOR UPDATE
    USING (true);

-- Allow anyone to delete entries (for admin interface)
CREATE POLICY "Allow public delete access to entries"
    ON public.entries FOR DELETE
    USING (true);

-- RLS Policies for votes table
-- Allow anyone to read votes
CREATE POLICY "Allow public read access to votes"
    ON public.votes FOR SELECT
    USING (true);

-- Allow anyone to insert votes
CREATE POLICY "Allow public insert access to votes"
    ON public.votes FOR INSERT
    WITH CHECK (true);

-- Create a view for vote summaries (optional, for easier querying)
CREATE OR REPLACE VIEW public.vote_summaries AS
SELECT
    entry_id,
    COUNT(*) FILTER (WHERE vote_type = 'agree') AS agree_count,
    COUNT(*) FILTER (WHERE vote_type = 'disagree-higher') AS disagree_higher_count,
    COUNT(*) FILTER (WHERE vote_type = 'disagree-lower') AS disagree_lower_count,
    COUNT(*) AS total_votes
FROM public.votes
GROUP BY entry_id;

-- Grant access to the view
GRANT SELECT ON public.vote_summaries TO anon, authenticated;

-- Sample data (optional - remove if you don't want sample data)
-- INSERT INTO public.entries (title, year_reviewed, score, medium, type, tags, hall_of_fame, poster_url)
-- VALUES
--     ('The Shawshank Redemption', 2024, 5.0, 'Movie', 'Movies', ARRAY['drama', 'prison', 'hope', 'friendship'], true, null),
--     ('Breaking Bad', 2023, 5.0, 'TV', 'Drama TV', ARRAY['crime', 'thriller', 'drama', 'intense'], true, null);
