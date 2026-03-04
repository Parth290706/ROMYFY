
-- ============================================================
-- 1. Remove guest_ prefix branches from RLS policies
-- 2. Add generation_count column for per-design rate limiting
-- 3. Add review text length constraint via trigger
-- ============================================================

-- Add generation_count to room_designs
ALTER TABLE public.room_designs ADD COLUMN IF NOT EXISTS generation_count integer NOT NULL DEFAULT 0;

-- Drop old policies with guest_ branches on room_designs
DROP POLICY IF EXISTS "Users can view own designs" ON public.room_designs;
DROP POLICY IF EXISTS "Users can insert own designs" ON public.room_designs;
DROP POLICY IF EXISTS "Users can delete own designs" ON public.room_designs;

-- New room_designs policies: pure auth.uid() (works for both regular and anonymous auth users)
CREATE POLICY "Users can view own designs"
  ON public.room_designs FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own designs"
  ON public.room_designs FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own designs"
  ON public.room_designs FOR DELETE
  USING (auth.uid()::text = user_id);

-- Drop old review policies with guest_ branches
DROP POLICY IF EXISTS "Users can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;

-- New review policies: require auth for all write operations
CREATE POLICY "Authenticated users can insert reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid()::text = user_id);

-- Drop old storage policies with guest_ branches
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;

-- New storage policies: pure auth.uid()
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'room-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read own images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'room-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'room-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add review text length validation trigger
CREATE OR REPLACE FUNCTION public.validate_review_text()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
BEGIN
  IF length(NEW.review_text) > 2000 THEN
    RAISE EXCEPTION 'Review text exceeds maximum length of 2000 characters';
  END IF;
  IF length(NEW.review_text) < 1 THEN
    RAISE EXCEPTION 'Review text cannot be empty';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_review_text_trigger
  BEFORE INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_review_text();
