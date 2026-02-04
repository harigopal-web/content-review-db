-- Add policies for admin operations on currently_watching
-- These allow all operations (needed for admin management)

-- Allow all INSERT operations on currently_watching
CREATE POLICY "Allow all insert to currently_watching"
  ON public.currently_watching
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow all UPDATE operations on currently_watching
CREATE POLICY "Allow all update to currently_watching"
  ON public.currently_watching
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow all DELETE operations on currently_watching
CREATE POLICY "Allow all delete from currently_watching"
  ON public.currently_watching
  FOR DELETE
  TO public
  USING (true);

-- Allow all DELETE operations on recommendations (for admin cleanup)
CREATE POLICY "Allow all delete from recommendations"
  ON public.recommendations
  FOR DELETE
  TO public
  USING (true);
