-- Drop the existing broad policy to replace with more explicit ones
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

-- Create explicit separate policies for each operation (admin only)
-- This makes the security model crystal clear and prevents any ambiguity

CREATE POLICY "Only admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));