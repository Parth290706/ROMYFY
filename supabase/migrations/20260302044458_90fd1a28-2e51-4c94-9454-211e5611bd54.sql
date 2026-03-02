
-- Drop existing restrictive RLS policies on room_designs
DROP POLICY IF EXISTS "Users can create their own designs" ON public.room_designs;
DROP POLICY IF EXISTS "Users can delete their own designs" ON public.room_designs;
DROP POLICY IF EXISTS "Users can update their own designs" ON public.room_designs;
DROP POLICY IF EXISTS "Users can view their own designs" ON public.room_designs;

-- Create public access policies for room_designs
CREATE POLICY "Anyone can insert designs" ON public.room_designs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view designs" ON public.room_designs FOR SELECT USING (true);
CREATE POLICY "Anyone can update designs" ON public.room_designs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete designs" ON public.room_designs FOR DELETE USING (true);

-- Drop existing restrictive RLS policies on reviews
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;

-- Create public access policies for reviews
CREATE POLICY "Anyone can insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update reviews" ON public.reviews FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete reviews" ON public.reviews FOR DELETE USING (true);

-- Update storage policies for room-images bucket to allow public upload/read
CREATE POLICY "Anyone can upload room images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'room-images');
CREATE POLICY "Anyone can read room images" ON storage.objects FOR SELECT USING (bucket_id = 'room-images');
CREATE POLICY "Anyone can update room images" ON storage.objects FOR UPDATE USING (bucket_id = 'room-images');
