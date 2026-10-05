# CampuStitch — System Directory & Architecture Map

## 1. Directory Tree

```
campus-stitch/
├── docs/
│   ├── context/                        <-- Persistent context for future AI sessions
│   │   ├── PROJECT_OVERVIEW.md         <-- Goals & product pillars
│   │   ├── CURRENT_STATE.md            <-- Snapshot of active work & status
│   │   ├── AUTH_ARCHITECTURE.md        <-- Full NextAuth, OTP, and KYC verification blueprint
│   │   ├── SYSTEM_MAP.md               <-- File & route mapping
│   │   └── RESUME_GUIDE.md             <-- Instructions when opening Antigravity
│   ├── AGENTS.md                       <-- Rules & constraints
│   ├── ARCHITECTURE.md                 <-- System architecture
│   ├── DATABASE.md                     <-- Database schemas & tables
│   └── TECH_STACK.md                   <-- Dependencies & tools
├── scripts/
│   ├── seed_all_endpoints.mjs          <-- Complete DB seeder with authentic UET campus data
│   ├── verify_all_endpoints.mjs        <-- Supabase schema and table count validator
│   ├── add_bio_column.mjs              <-- Database migration script for profile bio
│   └── test_api_endpoints.mjs          <-- Automated HTTP API endpoint integration tester
├── supabase/
│   └── schema.sql                      <-- Complete Supabase PostgreSQL database schema & migrations
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── assistant/chat/         <-- Gemini + Vercel AI SDK chat route
│   │   │   ├── assistant/tts/          <-- Uplift AI Urdu Voice Text-to-Speech
│   │   │   ├── auth/[...nextauth]/     <-- NextAuth v5 App Router route handler
│   │   │   ├── auth/check-email/       <-- Email existence check
│   │   │   ├── auth/forgot-password/   <-- Generates & emails 6-digit OTP for password reset
│   │   │   ├── auth/me/                <-- Session validation & profile resolution endpoint
│   │   │   ├── auth/otp/send/          <-- Generates & emails 6-digit OTP for registration
│   │   │   ├── auth/otp/verify/        <-- Verifies 6-digit OTP
│   │   │   ├── auth/reset-password/    <-- Validates OTP & resets student password in Supabase
│   │   │   ├── auth/sign-in/           <-- Credentials login
│   │   │   ├── auth/sign-out/          <-- Sign out endpoint
│   │   │   ├── auth/sign-up/           <-- Student registration
│   │   │   ├── community/comments/     <-- Threaded comment CRUD & replies
│   │   │   ├── community/join/         <-- Community membership toggling
│   │   │   ├── community/list/         <-- Community directory listing
│   │   │   ├── community/posts/        <-- Community posts feed & single post (?id=)
│   │   │   ├── community/vote/         <-- Upvote / downvote score handling
│   │   │   ├── departments/            <-- System-fed departments list endpoint
│   │   │   ├── profile/                <-- Profile data retrieval & bio/avatar updates
│   │   │   ├── universities/           <-- Supported universities and campuses endpoint
│   │   │   ├── upload/                 <-- Cloudinary image upload route
│   │   │   └── verifications/          <-- Student KYC submissions and admin approvals (GET, POST, PATCH)
│   │   ├── auth/callback/              <-- Supabase email link handler
│   │   ├── admin/                      <-- Admin KYC moderation panel (Side-by-side face & ID card)
│   │   ├── assistant/                  <-- AI Student Voice Assistant page
│   │   ├── bikes/                      <-- Campus bicycle rentals
│   │   ├── community/                  <-- Reddit communities quad feed (with pinned BottomNav)
│   │   │   ├── create/                 <-- Create society/group page
│   │   │   └── post/[id]/              <-- Dynamic Reddit post page with threaded comments
│   │   ├── commute/                    <-- Commute rideshare listings
│   │   │   └── offer/                  <-- Offer a ride page
│   │   ├── forgot-password/            <-- 3-Step Email OTP Forgot Password & Reset page
│   │   ├── hostel/                     <-- Hostel services & amenities
│   │   │   └── offer/                  <-- Post hostel service/item
│   │   ├── market/                     <-- Student marketplace
│   │   │   └── sell/                   <-- Create marketplace listing page
│   │   ├── messages/                   <-- Student chat with audio voice notes
│   │   ├── notifications/              <-- In-app student notifications fallback page
│   │   ├── profile/                    <-- Student profile, bio editor, ratings & verification status
│   │   ├── sign-in/                    <-- NextAuth 6-digit OTP sign-in page with Forgot Password link
│   │   ├── sign-up/                    <-- B&W manual registration with city campuses & departments
│   │   ├── verify/                     <-- Binance-style KYC face camera & student card upload
│   │   ├── layout.tsx                  <-- Root layout with Session, Theme, & Auth providers
│   │   └── page.tsx                    <-- CampuStitch Home Dashboard (mounts UnverifiedDialog)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx              <-- Button component
│   │   │   ├── badge.tsx               <-- Badge component
│   │   │   └── verification-badge.tsx  <-- Verified Student trust badge (verified, pending, unverified)
│   │   ├── auth-session-provider.tsx   <-- NextAuth client SessionProvider
│   │   ├── bottom-nav.tsx              <-- Pinned bottom navigation bar (Mobile)
│   │   ├── floating-mic.tsx            <-- Persistent AI Assistant floating mic
│   │   ├── mobile-shell.tsx            <-- App shell without global footer & with notifications slider toggle
│   │   ├── notifications-slider.tsx    <-- Cart-like right slide-over notifications drawer
│   │   └── unverified-dialog.tsx       <-- Post-registration unverified warning and verify prompt
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               <-- Browser Supabase client (@supabase/ssr)
│   │   │   └── server.ts               <-- Server Supabase client (@supabase/ssr)
│   │   ├── auth-context.tsx            <-- React context & useAuth hook
│   │   ├── cloudinary.ts               <-- Cloudinary SDK configuration
│   │   ├── data-service.ts             <-- Supabase data access layer (Rides, Listings, Bikes)
│   │   ├── image-converter.ts          <-- WebP image compression helper
│   │   ├── jwt.ts                      <-- JWT encoder/decoder helpers
│   │   ├── mailer.ts                   <-- Nodemailer Gmail SMTP sender
│   │   ├── otp-store.ts                <-- In-memory 10-min OTP generator & verifier
│   │   ├── password.ts                 <-- Password hashing & validation
│   │   ├── theme-context.tsx           <-- Dark / light mode state provider
│   │   ├── universities.ts             <-- 16 Pakistani Universities with city-only campuses
│   │   └── utils.ts                    <-- Tailwind merge & clsx utility
│   ├── auth.ts                         <-- NextAuth v5 configuration & credentials provider
│   └── proxy.ts                        <-- Next.js 16 route guarding & access control
```

---

## 2. Supabase Database Schema
The platform connects to Supabase PostgreSQL with the following tables:
1. `profiles`: `id (uuid pk)`, `user_id (uuid fk)`, `email (unique)`, `password_hash`, `full_name`, `university`, `city`, `program`, `department`, `is_verified (boolean)`, `verification_status ('unverified' | 'pending' | 'verified' | 'rejected')`, `avatar_url`, `live_photo_url`, `bio`, `card_photo_url`, `cnic`, `expiry_date`, `phone`, `rating_avg`, `rating_count`, `created_at`.
2. `departments`: `id (uuid pk)`, `name (unique)`, `created_at`.
3. `verifications`: `id (text pk)`, `user_id (uuid fk)`, `email`, `name`, `university`, `city`, `program`, `department`, `confidence_status`, `status ('pending' | 'approved' | 'rejected' | 'reupload')`, `card_photo_url`, `live_photo_url`, `created_at`.
4. `password_resets`: `id (uuid pk)`, `email`, `otp`, `expires_at`, `used`, `created_at`.
5. `rides`: `id`, `organizer_name`, `from_location`, `to_location`, `departure_time`, `vehicle_type`, `total_cost`, `price_per_seat`, `total_seats`, `available_seats`, `status`.
6. `ride_bookings`: `id`, `ride_id`, `passenger_id`, `seats_booked`, `status`, `created_at`.
7. `listings`: `id`, `seller_name`, `seller_verified`, `title`, `description`, `category`, `price`, `condition`, `location`, `is_graduation_sale`, `status`, `created_at`.
8. `bikes`: `id`, `owner_name`, `owner_verified`, `model`, `condition`, `location`, `daily_rate`, `deposit_amount`, `available_date`, `available_time`, `rules`, `is_available`, `created_at`.
9. `bike_rentals`: `id`, `bike_id`, `renter_name`, `rental_day`, `rental_time`, `total_amount`, `status`, `created_at`.
10. `shared_items` & `shared_item_owners`: fractional ownership items and percentages.
11. `hostel_roommates` & `hostel_services`: roommate requests and student hostel services.
12. `community_events`: society workshops and campus events.
