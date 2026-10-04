-- ========================================================
-- CampuStitch - Complete Supabase Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  password_hash text,
  full_name text not null,
  student_id text unique,
  university text not null default 'UET Lahore',
  program text,
  department text,
  is_verified boolean not null default false,
  verification_status text check (verification_status in ('unverified', 'pending', 'verified', 'rejected')) default 'unverified',
  avatar_url text,
  card_photo_url text,
  cnic text,
  expiry_date text,
  phone text,
  rating_avg numeric default 5.0,
  rating_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create unique index if not exists profiles_email_idx on public.profiles (email);


-- 2. RIDES (COMMUTE) TABLE
create table if not exists public.rides (
  id uuid primary key default uuid_generate_v4(),
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

-- 3. RIDE BOOKINGS TABLE
create table if not exists public.ride_bookings (
  id uuid primary key default uuid_generate_v4(),
  ride_id uuid references public.rides(id) on delete cascade not null,
  rider_name text not null,
  seats_booked integer not null default 1,
  cost_share numeric not null default 50,
  status text check (status in ('confirmed', 'cancelled')) default 'confirmed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. MARKETPLACE LISTINGS TABLE
create table if not exists public.listings (
  id uuid primary key default uuid_generate_v4(),
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

-- 5. BIKES FOR RENT TABLE
create table if not exists public.bikes (
  id uuid primary key default uuid_generate_v4(),
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

-- 6. BIKE RENTAL REQUESTS TABLE
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

-- 7. SHARED CO-OWNED ITEMS TABLE
create table if not exists public.shared_items (
  id uuid primary key default uuid_generate_v4(),
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

-- 8. HOSTEL ROOMMATES & SERVICES TABLE
create table if not exists public.hostel_roommates (
  id uuid primary key default uuid_generate_v4(),
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
  provider_name text not null,
  service_name text not null,
  location text not null,
  turnaround_time text not null,
  is_verified boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. COMMUNITY EVENTS TABLE
create table if not exists public.community_events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  organizer text not null,
  event_month text not null default 'OCT',
  event_day text not null default '7',
  event_time text not null default 'Wed, 3:00 PM',
  category text not null default 'Workshop',
  registered_count integer default 42,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. STUDENT CARD VERIFICATIONS QUEUE (ADMIN)
create table if not exists public.verifications (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  student_id text,
  program text not null,
  department text,
  university text not null default 'UET Lahore',
  confidence_status text check (confidence_status in ('matches', 'unreadable', 'unclear', 'expired')) default 'matches',
  status text check (status in ('pending', 'approved', 'rejected', 'reupload')) default 'pending',
  card_photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Permissive policies for student campus sharing
-- ========================================================

alter table public.profiles enable row level security;
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

-- Public READ & WRITE policies (for seamless student access)
create policy "Allow public read profiles" on public.profiles for select using (true);
create policy "Allow public insert profiles" on public.profiles for insert with check (true);
create policy "Allow public update profiles" on public.profiles for update using (true);

create policy "Allow public read rides" on public.rides for select using (true);
create policy "Allow public insert rides" on public.rides for insert with check (true);
create policy "Allow public update rides" on public.rides for update using (true);

create policy "Allow public read bookings" on public.ride_bookings for select using (true);
create policy "Allow public insert bookings" on public.ride_bookings for insert with check (true);
create policy "Allow public update bookings" on public.ride_bookings for update using (true);

create policy "Allow public read listings" on public.listings for select using (true);
create policy "Allow public insert listings" on public.listings for insert with check (true);
create policy "Allow public update listings" on public.listings for update using (true);

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
-- SEED DATA - Exact initial state matching design specifications
-- ========================================================

-- Insert Initial Rides
insert into public.rides (organizer_name, organizer_verified, from_location, to_location, departure_time, vehicle_type, total_cost, price_per_seat, total_seats, available_seats, pickup_point, notes)
values
  ('Ahmed', true, 'Khurrialwala', 'University', '8:00 AM', 'rickshaw', 200, 50, 4, 1, 'Main chowk stop', 'Rickshaw split: Rs. 200 ÷ 4 students'),
  ('Sara', true, 'Near Khurrialwala', 'University', '8:15 AM', 'car', 280, 70, 4, 3, 'Gulshan gate', 'AC on, polite driving'),
  ('Usman', true, 'Khurrialwala', 'University', '8:30 AM', 'car', 240, 60, 4, 2, 'Civil lines stop', 'Leaving sharp 8:30 AM');

-- Insert Initial Bikes
insert into public.bikes (owner_name, owner_verified, model, condition, location, daily_rate, deposit_amount, available_date, available_time)
values
  ('Ahmed', true, 'Honda CD 70', 'Good condition', 'Hostel Block A', 300, 1000, 'Tomorrow', '8 AM – 4 PM'),
  ('Bilal', true, 'Yamaha YBR 125', 'Excellent condition', 'Hostel Block B', 380, 1500, 'Tomorrow', '8 AM – 4 PM');

-- Insert Initial Listings
insert into public.listings (seller_name, seller_verified, title, category, price, condition, location, is_graduation_sale, status)
values
  ('Muhammad Hammad', true, 'Phone cooler', 'Electronics', 1800, 'Like new', 'Hostel Block B', false, 'available'),
  ('Muhammad Hammad', true, 'Study table', 'Furniture', 2000, 'Good', 'Hostel Block A', true, 'available'),
  ('Muhammad Hammad', true, 'Chair', 'Furniture', 1000, 'Good', 'Hostel Block A', true, 'sold'),
  ('Muhammad Hammad', true, '24-inch monitor', 'Electronics', 15000, 'Good', 'Near campus', true, 'reserved'),
  ('Muhammad Hammad', true, 'Mini fridge', 'Hostel', 8000, 'Fair', 'Hostel Block B', true, 'available');

-- Insert Initial Shared Item
do $$
declare
  item_id uuid;
begin
  insert into public.shared_items (title, total_cost, current_valuation)
  values ('Phone cooler', 4000, 2000)
  returning id into item_id;

  insert into public.shared_item_owners (item_id, owner_name, owner_initial, contribution_amount, share_percentage)
  values
    (item_id, 'Ali', 'A', 1000, 25),
    (item_id, 'Ahmed', 'A', 1000, 25),
    (item_id, 'Hassan', 'H', 1000, 25),
    (item_id, 'Usman', 'U', 1000, 25);
end $$;

-- Insert Hostel Roommate & Services
insert into public.hostel_roommates (user_name, is_verified, title, room_type, monthly_rent, available_from, hostel_block)
values ('Usman', true, '1 seat in Block B', 'Shared room, 2 students', 8000, 'November', 'Hostel Block B');

insert into public.hostel_services (provider_name, service_name, location, turnaround_time, is_verified)
values ('Hamza S.', 'Laundry pickup', 'Hostel Block A', 'Next-day return', true);

-- Insert Community Events
insert into public.community_events (title, organizer, event_month, event_day, event_time, category, registered_count)
values
  ('Agentic AI workshop', 'CS Society', 'OCT', '7', 'Wed, 3:00 PM', 'Workshop', 42),
  ('Career talk: internships', 'Placement office', 'OCT', '9', 'Fri, 11:00 AM', 'Seminar', 85);

-- Insert Initial Admin Verification Queue
insert into public.verifications (name, student_id, program, department, university, confidence_status, status)
values
  ('Muhammad Hammad', '2021-CS-104', 'BSCS', 'Computer Science', 'UET Lahore', 'unreadable', 'pending'),
  ('Sara K.', '2022-CS-045', 'BSCS', 'Computer Science', 'UET Lahore', 'unclear', 'pending'),
  ('Bilal R.', '2020-EE-089', 'BSEE', 'Electrical Engineering', 'UET Lahore', 'expired', 'pending'),
  ('Usman T.', '2023-ME-112', 'BSME', 'Mechanical Engineering', 'UET Lahore', 'matches', 'pending');
