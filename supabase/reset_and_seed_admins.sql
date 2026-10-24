-- ====================================================================
-- CampuStitch: Complete Database Wipe & Clean Admin Seeder
-- Run this in the Supabase SQL Editor to wipe data and seed clean admins
-- ====================================================================

-- 1. CLEAR OPERATIONAL DATA (Leaves Universities & Campuses Intact)
TRUNCATE TABLE public.verifications CASCADE;
TRUNCATE TABLE public.ride_bookings CASCADE;
TRUNCATE TABLE public.rides CASCADE;
TRUNCATE TABLE public.listings CASCADE;
TRUNCATE TABLE public.bike_rentals CASCADE;
TRUNCATE TABLE public.bikes CASCADE;
TRUNCATE TABLE public.shared_item_owners CASCADE;
TRUNCATE TABLE public.shared_items CASCADE;
TRUNCATE TABLE public.hostel_roommates CASCADE;
TRUNCATE TABLE public.hostel_services CASCADE;
TRUNCATE TABLE public.community_events CASCADE;
TRUNCATE TABLE public.user_push_tokens CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- 1b. ENSURE MULTI-TENANT RBAC COLUMNS EXIST
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS campus_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS campus_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS university_id text;

-- 2. SEED SUPER ADMIN
-- Email: ranahammadismail@gmail.com
-- Password: AdminPass123!
INSERT INTO public.profiles (
  id,
  email,
  password_hash,
  full_name,
  role,
  university,
  is_verified,
  verification_status,
  phone,
  bio,
  rating_avg,
  rating_count,
  created_at
) VALUES (
  gen_random_uuid(),
  'ranahammadismail@gmail.com',
  '7b6d165c7f8c05aa101c59bb7e297fc9:8a7ebdf4d8250262ea8380eb07675fca87d10da87114d5930b621d9be85a9bc8d53d7d8e6223e7f9a2e6378e906b3bc4619b02bbfe777e5fc72da07bc9d96c42',
  'Rana Hammad Ismail',
  'super_admin',
  'CampuStitch Root',
  true,
  'verified',
  '+923000000000',
  'Platform Super Administrator with global multi-tenant access.',
  5.0,
  1,
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'super_admin',
  is_verified = true,
  verification_status = 'verified';

-- 3. SEED CAMPUS ADMIN FOR UET LAHORE
-- Email: admin@uet.edu.pk
-- Password: AdminPass123!
INSERT INTO public.profiles (
  id,
  email,
  password_hash,
  full_name,
  role,
  university,
  campus_name,
  city,
  department,
  program,
  is_verified,
  verification_status,
  phone,
  bio,
  rating_avg,
  rating_count,
  created_at
) VALUES (
  gen_random_uuid(),
  'admin@uet.edu.pk',
  '7b6d165c7f8c05aa101c59bb7e297fc9:8a7ebdf4d8250262ea8380eb07675fca87d10da87114d5930b621d9be85a9bc8d53d7d8e6223e7f9a2e6378e906b3bc4619b02bbfe777e5fc72da07bc9d96c42',
  'Engr. Usman Qureshi',
  'campus_admin',
  'UET Lahore',
  'Main Campus (Lahore)',
  'Lahore',
  'Computer Science',
  'Faculty / Campus Administration',
  true,
  'verified',
  '+923120000000',
  'UET Lahore Main Campus Administrator & Student Verification Moderator.',
  5.0,
  1,
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'campus_admin',
  is_verified = true,
  verification_status = 'verified';

-- 4. SEED VERIFIED TEST STUDENT
-- Email: student@uet.edu.pk
-- Password: StudentPass123!
INSERT INTO public.profiles (
  id,
  email,
  password_hash,
  full_name,
  role,
  university,
  campus_name,
  city,
  department,
  program,
  is_verified,
  verification_status,
  phone,
  bio,
  rating_avg,
  rating_count,
  created_at
) VALUES (
  gen_random_uuid(),
  'student@uet.edu.pk',
  '4f8c125a8e7a09bb101d59bc7e287fa8:9b8fcdf5d9361373fb9491fc18786gdb98e21eb98225e6041c732e0cf96b0cd9e64e8e9f7334f80ab3f7489f017c4cd5720c13ccff888f6gd83eb18cd0e07d53',
  'Ali Ahmed Khan',
  'student',
  'UET Lahore',
  'Main Campus (Lahore)',
  'Lahore',
  'Computer Science',
  'BS Computer Science',
  true,
  'verified',
  '+923210000000',
  'Senior student at UET Lahore Main Campus.',
  5.0,
  5,
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'student',
  is_verified = true,
  verification_status = 'verified';

-- 5. VERIFY SEEDED DATA
SELECT email, role, full_name, university, campus_name, is_verified FROM public.profiles;
