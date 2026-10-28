-- Reviews are visible only to signed-in users (per user decision)
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Signed-in users can view reviews"
  ON public.reviews
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Reviews are no longer readable without a session
REVOKE SELECT ON public.reviews FROM anon;