-- Fix: Create a public view for team_members that excludes sensitive email column
-- The base table will be protected, and public access goes through this view

CREATE VIEW public.team_members_public
WITH (security_invoker=on) AS
  SELECT id, name, role, bio, photo_url, linkedin_url, twitter_url, display_order, is_active, created_at, updated_at
  FROM public.team_members
  WHERE is_active = true;

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.team_members_public TO anon, authenticated;

-- Update the public SELECT policy to be more restrictive
-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Public can view active team members" ON public.team_members;

-- Create a new policy that only allows admins to SELECT (public uses the view instead)
CREATE POLICY "Only admins can view team members directly"
ON public.team_members
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));