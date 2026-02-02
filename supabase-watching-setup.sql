-- Create currently_watching table
CREATE TABLE IF NOT EXISTS public.currently_watching (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  medium TEXT CHECK (medium IN ('Movie', 'TV')),
  poster_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  medium TEXT CHECK (medium IN ('Movie', 'TV')),
  reason TEXT,
  submitter_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.currently_watching ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for currently_watching (public read, no write)
CREATE POLICY "Allow public read access to currently_watching"
  ON public.currently_watching
  FOR SELECT
  TO public
  USING (true);

-- Create policies for recommendations (public can insert)
CREATE POLICY "Allow public read access to recommendations"
  ON public.recommendations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to recommendations"
  ON public.recommendations
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_currently_watching_created_at ON public.currently_watching(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_created_at ON public.recommendations(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for currently_watching
DROP TRIGGER IF EXISTS update_currently_watching_updated_at ON public.currently_watching;
CREATE TRIGGER update_currently_watching_updated_at
  BEFORE UPDATE ON public.currently_watching
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
