-- ============================================
-- FIX PERMISSIVE RLS POLICIES
-- ============================================
-- The linter detected overly permissive INSERT policies using (true)
-- We'll fix the contact_submissions and page_views INSERT policies

-- 1. Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;

-- 2. Create more restrictive INSERT policies
-- For contact form: Allow anonymous inserts but add basic validation
CREATE POLICY "Public can submit contact form"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
    -- Ensure required fields are provided
    name IS NOT NULL AND length(name) > 0 AND length(name) <= 100 AND
    email IS NOT NULL AND length(email) > 0 AND length(email) <= 255 AND
    message IS NOT NULL AND length(message) > 0 AND length(message) <= 5000
);

-- For page views: Allow anonymous inserts for analytics
CREATE POLICY "Public can insert page views"
ON public.page_views
FOR INSERT
TO anon, authenticated
WITH CHECK (
    -- Ensure page_path is provided and valid
    page_path IS NOT NULL AND length(page_path) > 0 AND length(page_path) <= 500
);