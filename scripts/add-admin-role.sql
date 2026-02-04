/*
 * URDIGIX ADMIN ROLE SETUP
 * ------------------------
 * Since we are using Supabase Auth Metadata for roles, 
 * run this script in the Supabase SQL Editor.
 */

-- NOTE: Ensure you have already run the migration: supabase/migrations/20260204_security_hardening.sql

-- 1. Replace 'your-email@example.com' with your actual signup email
UPDATE auth.users
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';

-- 2. Verify the Role
SELECT id, email, raw_app_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'your-email@example.com';
