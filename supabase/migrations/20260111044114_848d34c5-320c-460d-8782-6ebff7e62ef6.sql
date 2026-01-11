-- Ensure bucket is private and remove public policy
UPDATE storage.buckets SET public = false WHERE id = 'room-images';

-- Drop the public read policy if it still exists
DROP POLICY IF EXISTS "Public can view room images" ON storage.objects;