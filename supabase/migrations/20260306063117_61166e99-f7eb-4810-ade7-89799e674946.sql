
CREATE OR REPLACE FUNCTION public.enforce_review_username()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _name text;
BEGIN
  SELECT COALESCE(p.full_name, 'Guest')
    INTO _name
    FROM public.profiles p
    WHERE p.user_id = auth.uid();

  IF _name IS NULL THEN
    _name := 'Guest';
  END IF;

  NEW.user_name := _name;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_review_username
  BEFORE INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_review_username();
