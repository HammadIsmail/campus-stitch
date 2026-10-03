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
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── assistant/chat/         <-- Gemini + Vercel AI SDK chat route
│   │   │   ├── assistant/tts/          <-- Uplift AI Urdu Voice Text-to-Speech
│   │   │   ├── auth/[...nextauth]/     <-- NextAuth v5 App Router route handler
│   │   │   ├── auth/me/                <-- Session validation endpoint
│   │   │   ├── auth/otp/send/          <-- Generates & emails 6-digit OTP
│   │   │   ├── auth/otp/verify/        <-- Verifies 6-digit OTP
│   │   │   ├── auth/sign-in/           <-- Credentials login
│   │   │   ├── auth/sign-out/          <-- Sign out endpoint
│   │   │   ├── auth/sign-up/           <-- Student registration
│   │   │   └── upload/                 <-- Cloudinary image upload route
│   │   ├── auth/callback/              <-- Supabase email link handler
│   │   ├── admin/                      <-- Admin moderation panel
│   │   ├── assistant/                  <-- AI Student Voice Assistant page
│   │   ├── bikes/                      <-- Campus bicycle rentals
│   │   ├── community/                  <-- Societies, groups & discussions
│   │   │   └── create/                 <-- Create society/group page
│   │   ├── commute/                    <-- Commute rideshare listings
│   │   │   └── offer/                  <-- Offer a ride page
│   │   ├── hostel/                     <-- Hostel services & amenities
│   │   │   └── offer/                  <-- Post hostel service/item
│   │   ├── market/                     <-- Student marketplace
│   │   │   └── sell/                   <-- Create marketplace listing page
│   │   ├── notifications/              <-- In-app student notifications
│   │   ├── profile/                    <-- Student profile & account settings
│   │   ├── sign-in/                    <-- NextAuth 6-digit OTP sign-in page
│   │   ├── sign-up/                    <-- Student registration onboarding
│   │   ├── verify/                     <-- Student ID card verification upload
│   │   ├── layout.tsx                  <-- Root layout with Session & Auth providers
│   │   └── page.tsx                    <-- CampuStitch Home Dashboard
│   ├── components/
│   │   ├── ui/                         <-- Base UI primitives (button, badge)
│   │   ├── auth-session-provider.tsx   <-- NextAuth client SessionProvider
│   │   ├── bottom-nav.tsx              <-- Bottom navigation bar (Mobile)
│   │   ├── floating-mic.tsx            <-- Persistent AI Assistant floating mic
│   │   └── mobile-shell.tsx            <-- Responsive wrapper with header
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
│   │   └── utils.ts                    <-- Tailwind merge & clsx utility
│   ├── auth.ts                         <-- NextAuth v5 configuration & credentials provider
│   └── proxy.ts                        <-- Next.js 16 route guarding & access control
```

---

## 2. Supabase Database Schema
The platform connects to Supabase PostgreSQL with the following tables:
1. `profiles`: `id`, `email`, `fullName`, `studentId`, `role`, `program`, `isVerified`, `hostelBlock`.
2. `rides`: `id`, `organizer_name`, `from_location`, `to_location`, `departure_time`, `vehicle_type`, `total_cost`, `price_per_seat`, `total_seats`, `available_seats`, `status`.
3. `marketplace_listings`: `id`, `seller_name`, `title`, `description`, `price`, `condition`, `category`, `location`, `image_url`, `status`.
4. `bike_rentals`: `id`, `owner_name`, `bike_model`, `bike_type`, `hourly_rate`, `daily_rate`, `pickup_location`, `is_available`.
5. `hostel_services`: `id`, `provider_name`, `service_title`, `service_type`, `price`, `hostel_block`, `room_number`.
6. `communities`: `id`, `name`, `category`, `description`, `member_count`, `icon_name`.
7. `notifications`: `id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`.
