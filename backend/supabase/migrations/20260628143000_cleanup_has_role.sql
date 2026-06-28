-- Clean up overloaded has_role functions
-- Since the application has transitioned to checking auth.users metadata role claims,
-- we drop the obsolete enum-based has_role function to avoid ambiguity and dual-state splits.

DROP FUNCTION IF EXISTS public.has_role(UUID, public.app_role);
