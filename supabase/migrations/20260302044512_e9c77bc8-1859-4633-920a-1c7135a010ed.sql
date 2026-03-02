
-- Drop foreign key constraint on room_designs
ALTER TABLE public.room_designs DROP CONSTRAINT IF EXISTS room_designs_user_id_fkey;

-- Change user_id from uuid to text on room_designs
ALTER TABLE public.room_designs ALTER COLUMN user_id TYPE text USING user_id::text;

-- Change user_id from uuid to text on reviews
ALTER TABLE public.reviews ALTER COLUMN user_id TYPE text USING user_id::text;
