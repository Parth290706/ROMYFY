-- Make storage bucket private and add server-side file validation
UPDATE storage.buckets 
SET public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
WHERE id = 'room-images';

-- Drop the public viewing policy
DROP POLICY IF EXISTS "Public can view room images" ON storage.objects;