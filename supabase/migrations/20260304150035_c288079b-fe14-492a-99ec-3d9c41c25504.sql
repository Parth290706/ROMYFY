
-- ============================================================
-- Fix RLS policies for room_designs, reviews, and storage
-- ============================================================

-- 1. DROP all overly permissive policies on room_designs
DROP POLICY IF EXISTS "Anyone can view designs" ON public.room_designs;
DROP POLICY IF EXISTS "Anyone can insert designs" ON public.room_designs;
DROP POLICY IF EXISTS "Anyone can update designs" ON public.room_designs;
DROP POLICY IF EXISTS "Anyone can delete designs" ON public.room_designs;

-- 2. CREATE proper policies for room_designs
-- SELECT: Allow users to see their own designs (auth users by uid, guests by guest_ prefix)
CREATE POLICY "Users can view own designs"
  ON public.room_designs FOR SELECT
  USING (
    auth.uid()::text = user_id
    OR user_id LIKE 'guest_%'
  );

-- INSERT: Allow authenticated users (must match uid) and guests (guest_ prefix)
CREATE POLICY "Users can insert own designs"
  ON public.room_designs FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id
    OR user_id LIKE 'guest_%'
  );

-- UPDATE: No public update - only service role (edge function) updates designs
-- No policy needed since service role bypasses RLS

-- DELETE: Only authenticated users can delete their own designs
CREATE POLICY "Users can delete own designs"
  ON public.room_designs FOR DELETE
  USING (auth.uid()::text = user_id);

-- 3. DROP all overly permissive policies on reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can update reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can delete reviews" ON public.reviews;

-- 4. CREATE proper policies for reviews
-- SELECT: Public read (reviews are public-facing)
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

-- INSERT: Allow authenticated users and guests
CREATE POLICY "Users can insert reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id
    OR user_id LIKE 'guest_%'
  );

-- UPDATE: Only owner can update their review
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid()::text = user_id);

-- DELETE: Only owner can delete their review
CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid()::text = user_id);

-- 5. Fix storage policies
DROP POLICY IF EXISTS "Anyone can upload room images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read room images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update room images" ON storage.objects;

-- Storage: Allow uploads to own folder (auth users) or guest_ folders
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'room-images'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR (storage.foldername(name))[1] LIKE 'guest_%'
    )
  );

-- Storage: Allow reading own folder or guest folders
CREATE POLICY "Users can read own images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'room-images'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR (storage.foldername(name))[1] LIKE 'guest_%'
    )
  );

-- Storage: Allow updating own folder only (auth users)
CREATE POLICY "Users can update own images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'room-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
