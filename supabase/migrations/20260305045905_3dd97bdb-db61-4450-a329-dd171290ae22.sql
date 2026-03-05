-- Add UPDATE policy for room_designs (edge function uses service role but good to have)
CREATE POLICY "Users can update own designs"
  ON public.room_designs FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);