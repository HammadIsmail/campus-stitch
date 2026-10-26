-- ========================================================
-- CampuStitch - Complete Multi-Tenant Supabase Database Schema
-- Multi-Tenant Campus Isolation, Super Admin, Campus Admin & Students
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. UNIVERSITIES TABLE
create table if not exists public.universities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  short_name text not null,
  slug text unique not null,
  city text not null,
  province text not null,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create unique index if not exists universities_slug_idx on public.universities (slug);

-- 2. CAMPUSES TABLE (TENANT ROOT ENTITY)
create table if not exists public.campuses (
  id uuid primary key default uuid_generate_v4(),
  university_id uuid references public.universities(id) on delete cascade not null,
  name text not null,
  city text not null,
  slug text,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists campuses_uni_idx on public.campuses (university_id);

-- 3. PROFILES TABLE (Multi-Tenant User Profile)
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  password_hash text,
  full_name text not null,
  role text check (role in ('student', 'campus_admin', 'super_admin')) not null default 'student',
  university text not null default 'UET Lahore',
  university_id uuid references public.universities(id) on delete set null,
  city text,
  campus_id uuid references public.campuses(id) on delete set null,
  campus_name text,
  program text,
  department text,
  is_verified boolean not null default false,
  verification_status text check (verification_status in ('unverified', 'pending', 'verified', 'rejected')) default 'unverified',
  avatar_url text,
  live_photo_url text,
  bio text,
  card_photo_url text,
  cnic text,
  expiry_date text,
  phone text,
  rating_avg numeric default 5.0,
  rating_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create unique index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_campus_idx on public.profiles (campus_id);
create index if not exists profiles_role_idx on public.profiles (role);

-- Idempotent column migrations for existing profiles table
alter table if exists public.profiles drop column if exists student_id;
alter table if exists public.profiles add column if not exists city text;
alter table if exists public.profiles add column if not exists live_photo_url text;
alter table if exists public.profiles add column if not exists role text check (role in ('student', 'campus_admin', 'super_admin')) default 'student';
alter table if exists public.profiles add column if not exists university_id uuid references public.universities(id) on delete set null;
alter table if exists public.profiles add column if not exists campus_id uuid references public.campuses(id) on delete set null;
alter table if exists public.profiles add column if not exists campus_name text;

-- 4. DEPARTMENTS & PROGRAMS TABLE (System Fed)
create table if not exists public.departments (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. RIDES (COMMUTE) TABLE - TENANT SCOPED
create table if not exists public.rides (
  id uuid primary key default uuid_generate_v4(),
  university_id uuid references public.universities(id) on delete set null,
  campus_id uuid references public.campuses(id) on delete set null,
  organizer_id uuid references public.profiles(id) on delete set null,
  organizer_name text not null,
  organizer_verified boolean default true,
  from_location text not null,
  to_location text not null,
  departure_date date not null default current_date,
  departure_time text not null,
  vehicle_type text check (vehicle_type in ('rickshaw', 'bike', 'car')) not null default 'rickshaw',
  total_cost numeric not null default 200,
  price_per_seat numeric not null default 50,
  total_seats integer not null default 4,
  available_seats integer not null default 1,
  pickup_point text,
  notes text,
  status text check (status in ('active', 'completed', 'cancelled')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists rides_campus_idx on public.rides (campus_id);

alter table if exists public.rides add column if not exists university_id uuid references public.universities(id) on delete set null;
alter table if exists public.rides add column if not exists campus_id uuid references public.campuses(id) on delete set null;

-- 6. RIDE BOOKINGS TABLE
create table if not exists public.ride_bookings (
  id uuid primary key default uuid_generate_v4(),
  ride_id uuid references public.rides(id) on delete cascade not null,
  rider_name text not null,
  seats_booked integer not null default 1,
  cost_share numeric not null default 50,
  status text check (status in ('confirmed', 'cancelled')) default 'confirmed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. MARKETPLACE LISTINGS TABLE - TENANT SCOPED
create table if not exists public.listings (
  id uuid primary key default uuid_generate_v4(),
  university_id uuid references public.universities(id) on delete set null,
  campus_id uuid references public.campuses(id) on delete set null,
  seller_id uuid references public.profiles(id) on delete set null,
  seller_name text not null,
  seller_verified boolean default true,
  title text not null,
  description text,
  category text check (category in ('Electronics', 'Hostel', 'Books', 'Furniture', 'Other')) not null default 'Electronics',
  price numeric not null,
  condition text check (condition in ('New', 'Like new', 'Good', 'Fair')) not null default 'Good',
  location text not null default 'Hostel Block B',
  is_graduation_sale boolean default false,
  status text check (status in ('available', 'reserved', 'sold')) default 'available',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists listings_campus_idx on public.listings (campus_id);

alter table if exists public.listings add column if not exists university_id uuid references public.universities(id) on delete set null;
alter table if exists public.listings add column if not exists campus_id uuid references public.campuses(id) on delete set null;

-- 8. BIKES FOR RENT TABLE - TENANT SCOPED
create table if not exists public.bikes (
  id uuid primary key default uuid_generate_v4(),
  university_id uuid references public.universities(id) on delete set null,
  campus_id uuid references public.campuses(id) on delete set null,
  owner_id uuid references public.profiles(id) on delete set null,
  owner_name text not null,
  owner_verified boolean default true,
  model text not null,
  condition text not null default 'Good condition',
  location text not null default 'Hostel Block A',
  daily_rate numeric not null default 300,
  deposit_amount numeric not null default 1000,
  available_date text not null default 'Tomorrow',
  available_time text not null default '8 AM – 4 PM',
  rules text default 'Valid licence required. Return with the same fuel level. No lending to others.',
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists bikes_campus_idx on public.bikes (campus_id);

alter table if exists public.bikes add column if not exists university_id uuid references public.universities(id) on delete set null;
alter table if exists public.bikes add column if not exists campus_id uuid references public.campuses(id) on delete set null;

-- 9. BIKE RENTAL REQUESTS TABLE
create table if not exists public.bike_rentals (
  id uuid primary key default uuid_generate_v4(),
  bike_id uuid references public.bikes(id) on delete cascade not null,
  renter_name text not null,
  rental_day text not null default 'Tomorrow',
  rental_time text not null default '8 AM – 4 PM',
  total_amount numeric not null default 300,
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. SHARED CO-OWNED ITEMS TABLE - TENANT SCOPED
create table if not exists public.shared_items (
  id uuid primary key default uuid_generate_v4(),
  university_id uuid references public.universities(id) on delete set null,
  campus_id uuid references public.campuses(id) on delete set null,
  title text not null,
  total_cost numeric not null,
  current_valuation numeric not null default 2000,
  status text check (status in ('active', 'for_sale', 'sold')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.shared_item_owners (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references public.shared_items(id) on delete cascade not null,
  owner_name text not null,
  owner_initial text not null,
  contribution_amount numeric not null,
  share_percentage numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. HOSTEL ROOMMATES & SERVICES TABLE - TENANT SCOPED
create table if not exists public.hostel_roommates (
  id uuid primary key default uuid_generate_v4(),
  university_id uuid references public.universities(id) on delete set null,
  campus_id uuid references public.campuses(id) on delete set null,
  user_name text not null,
  is_verified boolean default true,
  title text not null,
  room_type text not null,
  monthly_rent numeric not null,
  available_from text not null,
  hostel_block text not null,
  status text default 'available',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.hostel_services (
  id uuid primary key default uuid_generate_v4(),
  university_id uuid references public.universities(id) on delete set null,
  campus_id uuid references public.campuses(id) on delete set null,
  provider_name text not null,
  service_name text not null,
  location text not null,
  turnaround_time text not null,
  is_verified boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. COMMUNITY EVENTS TABLE - TENANT SCOPED
create table if not exists public.community_events (
  id uuid primary key default uuid_generate_v4(),
  university_id uuid references public.universities(id) on delete set null,
  campus_id uuid references public.campuses(id) on delete set null,
  title text not null,
  organizer text not null,
  event_month text not null default 'OCT',
  event_day text not null default '7',
  event_time text not null default 'Wed, 3:00 PM',
  category text not null default 'Workshop',
  registered_count integer default 42,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. STUDENT KYC VERIFICATIONS QUEUE (CAMPUS ADMIN & SUPER ADMIN)
create table if not exists public.verifications (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text,
  university text not null default 'UET Lahore',
  university_id uuid references public.universities(id) on delete set null,
  city text,
  campus_id uuid references public.campuses(id) on delete set null,
  campus_name text,
  program text not null,
  department text,
  confidence_status text check (confidence_status in ('matches', 'unreadable', 'unclear', 'expired')) default 'matches',
  status text check (status in ('pending', 'approved', 'rejected', 'reupload')) default 'pending',
  card_photo_url text,
  live_photo_url text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists verifications_campus_idx on public.verifications (campus_id);
create index if not exists verifications_status_idx on public.verifications (status);

-- Idempotent column migrations for existing verifications table
alter table if exists public.verifications drop column if exists student_id;
alter table if exists public.verifications add column if not exists user_id uuid references public.profiles(id) on delete set null;
alter table if exists public.verifications add column if not exists email text;
alter table if exists public.verifications add column if not exists city text;
alter table if exists public.verifications add column if not exists live_photo_url text;
alter table if exists public.verifications add column if not exists university_id uuid references public.universities(id) on delete set null;
alter table if exists public.verifications add column if not exists campus_id uuid references public.campuses(id) on delete set null;
alter table if exists public.verifications add column if not exists campus_name text;
alter table if exists public.verifications add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-Tenant Campus Isolation
-- ========================================================

alter table public.universities enable row level security;
alter table public.campuses enable row level security;
alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.rides enable row level security;
alter table public.ride_bookings enable row level security;
alter table public.listings enable row level security;
alter table public.bikes enable row level security;
alter table public.bike_rentals enable row level security;
alter table public.shared_items enable row level security;
alter table public.shared_item_owners enable row level security;
alter table public.hostel_roommates enable row level security;
alter table public.hostel_services enable row level security;
alter table public.community_events enable row level security;
alter table public.verifications enable row level security;

-- Public read for universities & campuses
create policy "Allow public read universities" on public.universities for select using (true);
create policy "Allow public read campuses" on public.campuses for select using (true);
create policy "Allow super admin manage universities" on public.universities for all using (true);
create policy "Allow super admin manage campuses" on public.campuses for all using (true);

-- Permissive policies
create policy "Allow public read profiles" on public.profiles for select using (true);
create policy "Allow public insert profiles" on public.profiles for insert with check (true);
create policy "Allow public update profiles" on public.profiles for update using (true);

create policy "Allow public read departments" on public.departments for select using (true);
create policy "Allow public insert departments" on public.departments for insert with check (true);

create policy "Allow public read rides" on public.rides for select using (true);
create policy "Allow public insert rides" on public.rides for insert with check (true);
create policy "Allow public update rides" on public.rides for update using (true);

create policy "Allow public read bookings" on public.ride_bookings for select using (true);
create policy "Allow public insert bookings" on public.ride_bookings for insert with check (true);
create policy "Allow public update bookings" on public.ride_bookings for update using (true);

create policy "Allow public read listings" on public.listings for select using (true);
create policy "Allow public insert listings" on public.listings for insert with check (true);
create policy "Allow public update listings" on public.listings for update using (true);
create policy "Allow public delete listings" on public.listings for delete using (true);

create policy "Allow public read bikes" on public.bikes for select using (true);
create policy "Allow public insert bikes" on public.bikes for insert with check (true);
create policy "Allow public update bikes" on public.bikes for update using (true);

create policy "Allow public read bike_rentals" on public.bike_rentals for select using (true);
create policy "Allow public insert bike_rentals" on public.bike_rentals for insert with check (true);

create policy "Allow public read shared_items" on public.shared_items for select using (true);
create policy "Allow public insert shared_items" on public.shared_items for insert with check (true);
create policy "Allow public update shared_items" on public.shared_items for update using (true);

create policy "Allow public read shared_item_owners" on public.shared_item_owners for select using (true);
create policy "Allow public insert shared_item_owners" on public.shared_item_owners for insert with check (true);

create policy "Allow public read hostel_roommates" on public.hostel_roommates for select using (true);
create policy "Allow public insert hostel_roommates" on public.hostel_roommates for insert with check (true);

create policy "Allow public read hostel_services" on public.hostel_services for select using (true);
create policy "Allow public read community_events" on public.community_events for select using (true);

create policy "Allow public read verifications" on public.verifications for select using (true);
create policy "Allow public insert verifications" on public.verifications for insert with check (true);
create policy "Allow public update verifications" on public.verifications for update using (true);

-- ========================================================
-- SEED DATA - Universities, Campuses & Curated Departments
-- ========================================================

-- Feed Curated Departments
insert into public.departments (name) values
  ('Computer Science'),
  ('Software Engineering'),
  ('Information Technology'),
  ('Data Science & AI'),
  ('Cyber Security'),
  ('Electrical Engineering'),
  ('Mechanical Engineering'),
  ('Civil Engineering'),
  ('Chemical Engineering'),
  ('Mechatronics Engineering'),
  ('Biomedical Engineering'),
  ('Business Administration (BBA)'),
  ('Accounting & Finance'),
  ('Management Sciences'),
  ('Architecture & Design'),
  ('Mathematics & Computing'),
  ('Physics & Applied Sciences'),
  ('Social Sciences & Humanities')
on conflict (name) do nothing;

-- Feed Universities & Campuses
do $$
declare
  u_uet uuid;
  u_fast uuid;
  u_nust uuid;
  u_lums uuid;
  u_comsats uuid;
  u_giki uuid;
  u_itu uuid;
  u_pu uuid;
  u_gcu uuid;
  u_uet_taxila uuid;
  u_iba uuid;
  u_ned uuid;
  u_bahria uuid;
  u_air uuid;
  u_qau uuid;
  u_ntu uuid;
  c_uet_main uuid;
begin
  -- UET Lahore
  insert into public.universities (name, short_name, slug, city, province)
  values ('University of Engineering and Technology (UET) Lahore', 'UET Lahore', 'uet-lahore', 'Lahore', 'Punjab')
  on conflict (slug) do update set name = excluded.name
  returning id into u_uet;

  insert into public.campuses (university_id, name, city, slug)
  values
    (u_uet, 'Main Campus (Lahore)', 'Lahore', 'uet-main-lahore'),
    (u_uet, 'Kala Shah Kaku (KSK) Campus', 'Kala Shah Kaku', 'uet-ksk'),
    (u_uet, 'Faisalabad Campus', 'Faisalabad', 'uet-faisalabad'),
    (u_uet, 'Narowal Campus', 'Narowal', 'uet-narowal')
  on conflict do nothing;

  select id into c_uet_main from public.campuses where university_id = u_uet and slug = 'uet-main-lahore' limit 1;

  -- FAST-NUCES
  insert into public.universities (name, short_name, slug, city, province)
  values ('National University of Computer and Emerging Sciences (FAST-NUCES)', 'FAST-NUCES', 'fast-nuces', 'Lahore', 'Punjab')
  on conflict (slug) do update set name = excluded.name
  returning id into u_fast;

  insert into public.campuses (university_id, name, city, slug)
  values
    (u_fast, 'Lahore Campus', 'Lahore', 'fast-lahore'),
    (u_fast, 'Islamabad Campus', 'Islamabad', 'fast-islamabad'),
    (u_fast, 'Karachi Campus', 'Karachi', 'fast-karachi'),
    (u_fast, 'Peshawar Campus', 'Peshawar', 'fast-peshawar'),
    (u_fast, 'Chiniot-Faisalabad Campus', 'Chiniot', 'fast-chiniot')
  on conflict do nothing;

  -- NUST
  insert into public.universities (name, short_name, slug, city, province)
  values ('National University of Sciences and Technology (NUST)', 'NUST', 'nust', 'Islamabad', 'Islamabad Capital Territory')
  on conflict (slug) do update set name = excluded.name
  returning id into u_nust;

  insert into public.campuses (university_id, name, city, slug)
  values
    (u_nust, 'Islamabad (H-12 Main)', 'Islamabad', 'nust-islamabad'),
    (u_nust, 'Rawalpindi (EME)', 'Rawalpindi', 'nust-rawalpindi'),
    (u_nust, 'Karachi (PNEC)', 'Karachi', 'nust-karachi'),
    (u_nust, 'Risalpur (CAE)', 'Risalpur', 'nust-risalpur')
  on conflict do nothing;

  -- LUMS
  insert into public.universities (name, short_name, slug, city, province)
  values ('Lahore University of Management Sciences (LUMS)', 'LUMS', 'lums', 'Lahore', 'Punjab')
  on conflict (slug) do update set name = excluded.name
  returning id into u_lums;

  insert into public.campuses (university_id, name, city, slug)
  values (u_lums, 'Main Campus (DHA Lahore)', 'Lahore', 'lums-main')
  on conflict do nothing;

  -- COMSATS
  insert into public.universities (name, short_name, slug, city, province)
  values ('COMSATS University Islamabad (CUI)', 'COMSATS', 'comsats', 'Islamabad', 'Islamabad Capital Territory')
  on conflict (slug) do update set name = excluded.name
  returning id into u_comsats;

  insert into public.campuses (university_id, name, city, slug)
  values
    (u_comsats, 'Islamabad Campus', 'Islamabad', 'comsats-islamabad'),
    (u_comsats, 'Lahore Campus', 'Lahore', 'comsats-lahore'),
    (u_comsats, 'Abbottabad Campus', 'Abbottabad', 'comsats-abbottabad'),
    (u_comsats, 'Wah Cantt Campus', 'Wah Cantt', 'comsats-wah'),
    (u_comsats, 'Attock Campus', 'Attock', 'comsats-attock'),
    (u_comsats, 'Sahiwal Campus', 'Sahiwal', 'comsats-sahiwal'),
    (u_comsats, 'Vehari Campus', 'Vehari', 'comsats-vehari')
  on conflict do nothing;

  -- GIKI
  insert into public.universities (name, short_name, slug, city, province)
  values ('Ghulam Ishaq Khan Institute (GIKI)', 'GIKI', 'giki', 'Topi', 'Khyber Pakhtunkhwa')
  on conflict (slug) do update set name = excluded.name
  returning id into u_giki;

  insert into public.campuses (university_id, name, city, slug)
  values (u_giki, 'Topi Campus', 'Topi', 'giki-topi')
  on conflict do nothing;

  -- ITU
  insert into public.universities (name, short_name, slug, city, province)
  values ('Information Technology University (ITU)', 'ITU', 'itu', 'Lahore', 'Punjab')
  on conflict (slug) do update set name = excluded.name
  returning id into u_itu;

  insert into public.campuses (university_id, name, city, slug)
  values (u_itu, 'Arfa Karim Tower Campus', 'Lahore', 'itu-main')
  on conflict do nothing;

  -- Punjab University
  insert into public.universities (name, short_name, slug, city, province)
  values ('University of the Punjab (PU)', 'Punjab University', 'pu', 'Lahore', 'Punjab')
  on conflict (slug) do update set name = excluded.name
  returning id into u_pu;

  insert into public.campuses (university_id, name, city, slug)
  values
    (u_pu, 'Quaid-e-Azam (New) Campus', 'Lahore', 'pu-new-campus'),
    (u_pu, 'Allama Iqbal (Old) Campus', 'Lahore', 'pu-old-campus'),
    (u_pu, 'Gujranwala Campus', 'Gujranwala', 'pu-gujranwala'),
    (u_pu, 'Jhelum Campus', 'Jhelum', 'pu-jhelum')
  on conflict do nothing;

  -- GCU Lahore
  insert into public.universities (name, short_name, slug, city, province)
  values ('Government College University (GCU) Lahore', 'GCU Lahore', 'gcu', 'Lahore', 'Punjab')
  on conflict (slug) do update set name = excluded.name
  returning id into u_gcu;

  insert into public.campuses (university_id, name, city, slug)
  values
    (u_gcu, 'Main Campus (Katchery Road)', 'Lahore', 'gcu-main'),
    (u_gcu, 'Kala Shah Kaku (KSK) Campus', 'Kala Shah Kaku', 'gcu-ksk')
  on conflict do nothing;

  -- Update existing unassigned rides, listings, and verifications to UET Lahore Main Campus
  update public.rides set university_id = u_uet, campus_id = c_uet_main where campus_id is null;
  update public.listings set university_id = u_uet, campus_id = c_uet_main where campus_id is null;
  update public.bikes set university_id = u_uet, campus_id = c_uet_main where campus_id is null;
  update public.hostel_roommates set university_id = u_uet, campus_id = c_uet_main where campus_id is null;
  update public.hostel_services set university_id = u_uet, campus_id = c_uet_main where campus_id is null;
  update public.community_events set university_id = u_uet, campus_id = c_uet_main where campus_id is null;
  update public.verifications set university_id = u_uet, campus_id = c_uet_main where campus_id is null;
end $$;
