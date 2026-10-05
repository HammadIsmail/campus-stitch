# CampuStitch — System Directory & Architecture Map

## 1. Directory Tree

```
campus-stitch/
├── docs/
│   ├── context/                        <-- Persistent context for future AI sessions
│   │   ├── PROJECT_OVERVIEW.md         <-- Goals & product pillars
│   │   ├── CURRENT_STATE.md            <-- Snapshot of active work & status
│   │   ├── AUTH_ARCHITECTURE.md        <-- Full NextAuth + Nodemailer blueprint
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
│   │   │   ├── auth/verify-student-card/ <-- Strict OCR/Vision student ID verification
│   │   │   ├── community/comments/     <-- Threaded comment CRUD & replies
│   │   │   ├── community/join/         <-- Community membership toggling
│   │   │   ├── community/list/         <-- Community directory listing
│   │   │   ├── community/posts/        <-- Community posts feed & single post (?id=)
│   │   │   ├── community/vote/         <-- Upvote / downvote score handling
│   │   │   ├── profile/                <-- Profile data retrieval & bio/avatar updates
│   │   │   └── upload/                 <-- Cloudinary image upload route
│   │   ├── auth/callback/              <-- Supabase email link handler
│   │   ├── admin/                      <-- Admin moderation panel
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
│   │   ├── profile/                    <-- Student profile, bio editor, ratings & theme settings
│   │   ├── sign-in/                    <-- NextAuth 6-digit OTP sign-in page with Forgot Password link
│   │   ├── sign-up/                    <-- Multi-step student card onboarding
│   │   ├── verify/                     <-- Student ID card verification upload
│   │   ├── layout.tsx                  <-- Root layout with Session, Theme, & Auth providers
│   │   └── page.tsx                    <-- CampuStitch Home Dashboard
│   ├── components/
│   │   ├── ui/                         <-- Base UI primitives (button, badge)
│   │   ├── auth-session-provider.tsx   <-- NextAuth client SessionProvider
│   │   ├── bottom-nav.tsx              <-- Pinned bottom navigation bar (Mobile)
│   │   ├── floating-mic.tsx            <-- Persistent AI Assistant floating mic
│   │   ├── mobile-shell.tsx            <-- App shell without global footer & with notifications slider toggle
│   │   └── notifications-slider.tsx    <-- Cart-like right slide-over notifications drawer
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               <-- Browser Supabase client (@supabase/ssr)
│   │   │   └── server.ts               <-- Server Supabase client (@supabase/ssr)
│   │   ├── auth-context.tsx            <-- React context & useAuth hook
│   │   ├── cloudinary.ts               <-- Cloudinary SDK configuration
│   │   ├── data-service.ts             <-- Supabase data access layer (Rides, Listings, Bikes)
│   │   ├── image-converter.ts          <-- WebP image compression helper
│   │   ├── jwt.ts                      <-- NextAuth native JWT encoder/decoder helpers
│   │   ├── mailer.ts                   <-- Nodemailer Gmail SMTP sender
│   │   ├── otp-store.ts                <-- In-memory 10-min OTP generator & verifier
│   │   ├── password.ts                 <-- Password hashing & validation
│   │   ├── theme-context.tsx           <-- Dark / light mode state provider
│   │   └── utils.ts                    <-- Tailwind merge & clsx utility
│   ├── auth.ts                         <-- NextAuth v5 configuration & credentials provider
│   └── proxy.ts                        <-- Next.js 16 route guarding & access control
```

---

## 2. Supabase Database Schema
The platform connects to Supabase PostgreSQL with the following tables:
1. `profiles`: `id (uuid pk)`, `user_id (uuid fk)`, `email (unique)`, `password_hash`, `full_name`, `student_id (unique)`, `university`, `program`, `department`, `is_verified`, `verification_status`, `avatar_url`, `bio`, `card_photo_url`, `cnic`, `expiry_date`, `phone`, `rating_avg`, `rating_count`, `created_at`.
2. `password_resets`: `id (uuid pk)`, `email`, `otp`, `expires_at`, `used`, `created_at`.
3. `rides`: `id`, `organizer_name`, `from_location`, `to_location`, `departure_time`, `vehicle_type`, `total_cost`, `price_per_seat`, `total_seats`, `available_seats`, `status`.
4. `ride_bookings`: `id`, `ride_id`, `passenger_id`, `seats_booked`, `status`, `created_at`.
5. `listings`: `id`, `seller_name`, `title`, `description`, `price`, `condition`, `category`, `location`, `image_url`, `status`.
6. `shared_items`: `id`, `name`, `category`, `total_shares`, `available_shares`, `share_price`, `maintenance_fee`, `image_url`.
7. `shared_item_owners`: `id`, `shared_item_id`, `owner_id`, `shares_owned`.
8. `bikes`: `id`, `owner_name`, `bike_model`, `bike_type`, `hourly_rate`, `daily_rate`, `pickup_location`, `is_available`.
9. `bike_rentals`: `id`, `bike_id`, `renter_id`, `start_time`, `end_time`, `status`.
10. `hostel_roommates`: `id`, `student_id`, `hostel_name`, `room_number`, `sleep_habit`, `study_habit`, `department`, `status`.
11. `hostel_services`: `id`, `provider_name`, `service_title`, `service_type`, `price`, `hostel_block`, `room_number`.
12. `communities`: `id`, `name`, `title`, `category`, `description`, `member_count`, `rules`.
13. `community_posts`: `id`, `community_id`, `community_name`, `author_id`, `author_name`, `author_student_id`, `author_verified`, `title`, `content`, `flair`, `image_url`, `link_url`, `upvotes`, `downvotes`, `score`, `comments_count`.
14. `community_comments`: `id`, `post_id`, `parent_comment_id`, `author_id`, `author_name`, `author_student_id`, `author_verified`, `content`, `upvotes`, `score`, `created_at`.
15. `notifications`: `id`, `user_id`, `title`, `message`, `type`, `deeplink`, `is_read`, `created_at`.
