-- ============================================
-- URDIGIX Admin Role Setup Script
-- ============================================
-- 
-- HOW TO USE:
-- 1. First, sign up at http://localhost:8080/auth
-- 2. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ssnmaiedhooydtpcpeqo
-- 3. Navigate to "SQL Editor" in the left sidebar
-- 4. Copy and paste the appropriate command below
-- 5. Replace 'YOUR_EMAIL@example.com' with your actual email
-- 6. Click "Run"
--
-- ============================================

-- Option 1: Add admin role by email (RECOMMENDED)
-- Replace the email below with your signup email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'YOUR_EMAIL@example.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================
-- VERIFICATION: Check if the role was added
-- ============================================
-- Run this to verify your admin role:
-- 
-- SELECT u.email, ur.role, ur.created_at
-- FROM auth.users u
-- JOIN public.user_roles ur ON u.id = ur.user_id
-- WHERE ur.role = 'admin';

-- ============================================
-- OPTIONAL: View all users and their roles
-- ============================================
-- 
-- SELECT u.id, u.email, u.created_at, ur.role
-- FROM auth.users u
-- LEFT JOIN public.user_roles ur ON u.id = ur.user_id
-- ORDER BY u.created_at DESC;

-- ============================================
-- OPTIONAL: Remove admin role from a user
-- ============================================
-- 
-- DELETE FROM public.user_roles 
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'email@example.com')
-- AND role = 'admin';
