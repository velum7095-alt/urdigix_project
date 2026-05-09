
-- 1. Lock down notes table
DROP POLICY IF EXISTS "Anyone can view notes" ON public.notes;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can view notes"
ON public.notes FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Harden has_role to prevent role enumeration
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow self-checks always; cross-user checks only by admins
  IF _user_id <> auth.uid() THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    ) THEN
      RETURN false;
    END IF;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$function$;
