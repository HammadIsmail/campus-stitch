# CampuStitch — Current Project State

## 1. Where We Are Right Now (Snapshot)
- **Framework & Runtime:** Next.js `16.3.8` (App Router), React `19.2.8`, Node.js `v24.14.0` on Windows.
- **Authentication System:** Complete **NextAuth.js v5** (`next-auth@5.0.0-beta.32`) implementation with 6-digit email OTPs.
- **Student Verification:** Strict AI + OCR student card verification rejecting cropped photos, enforcing visible University Name, Full Name, and Roll Number, with zero hardcoded fallbacks.
- **Community Feed:** Reddit-style dynamic pages (`/community/post/[id]`) with 3-column independent section scrolling (no complete body scroll), vertical vote pillars, and threaded nested comments.
- **Voice & Messaging:** Base64 persistent audio voice messages with resilient HTML5 audio playback and internal auto-scrolling (`/messages`).
- **Email Delivery:** **Nodemailer** using Gmail SMTP (`MAIL_SERVER=smtp.gmail.com`, Port `465`/`587`) for instantaneous delivery of 6-digit OTP codes.
- **Route Guarding:** Next.js 16 `src/proxy.ts` convention strictly protecting `/` and all private platform routes with `307 Redirect` to `/sign-in`.
- **Database & Storage:** Supabase PostgreSQL connected via `@supabase/ssr` / `@supabase/supabase-js`, and Cloudinary for media uploads.
- **Git Status:** 100% synchronized with `https://github.com/HammadIsmail/campus-stitch.git` on branch `main`.

---

## 2. Recent Major Milestones Completed

### A. Strict Student Card Verification & Anti-Spoofing (`/api/auth/verify-student-card` & `/sign-up`)
- **Cropping & Incomplete Photo Detection:** The verification system now strictly rejects cropped or partially cut-off cards.
- **Mandatory 3 Core Fields:** Enforces that **University Name / Institutional Header**, **Student Full Name**, and **Roll Number / Student ID** are clearly visible and legible in the picture.
- **Zero Default Assumptions:** Removed hardcoded defaults (`let university = "University of Engineering & Technology Lahore"`). If the university name is cropped out or missing, the API immediately rejects the card with HTTP 400.
- **Detailed Missing Field Feedback:** Informs the user precisely which fields are missing:
  > *"Please upload a complete student card photo. The following fields are missing in the picture: University Name."*
- **Eliminated Hardcoded Mock Data:** Deleted all hardcoded test student credentials (`MUHAMMAD HAMMAD ISMAIL`, `2023-CS-807`, `3660128257509`, `31-10-2027`) from both the API route and the sign-up page defaults (`src/app/sign-up/page.tsx`).

### B. Dynamic Reddit Post Experience (`/community/post/[id]`)
- **Replaced Dialog Box Modal:** Posts no longer open inside a popup modal dialog. Clicking a post card or comments button navigates directly to `/community/post/[id]`.
- **Next.js 16 Route Handling:** Implemented `React.use(params)` for route extraction conforming to Next.js 16 conventions.
- **Full Reddit 3-Column Experience:**
  - **Left Column:** Subreddit directory (`r/cs-uet`, `r/commute-splits`, `r/exam-pastpapers`, etc.) with direct Join/Leave buttons.
  - **Main Center Column:** Back navigation breadcrumb (`← Back to r/...`), vertical vote pillar (▲ score ▼), verified student badge, full content, link previews, image attachments, comment composer, and threaded discussion tree.
  - **Right Column:** "About Community" widget with member stats, online activity indicator, community rules, and campus honor code.
- **Single Post API Endpoint:** Updated `GET /api/community/posts?id=...` to resolve individual posts from Supabase or fallback records.
- **Direct Post Sharing:** Updated share button to copy direct links: `window.location.origin/community/post/${post.id}`.

### C. Independent 3-Column Section Scrolling (No Full Body Scroll)
- **Problem Solved:** Previously, scrolling on `/community` scrolled the entire webpage body down, causing the top navbar and sidebars to scroll off screen.
- **Fixed App Layout Shell:** In `src/components/mobile-shell.tsx`, routes under `/community` are detected via `isCommunityPage` and constrained to `h-screen max-h-screen overflow-hidden` and `h-[calc(100dvh-64px)] min-h-0`.
- **Hidden Footer on Community:** Prevented the global footer from rendering on community pages to avoid body overflow.
- **Independent Scroll Containers:**
  - Left Subreddit Directory (`<aside>`): Has its own independent `h-full overflow-y-auto` scroll container.
  - Center Feed (`<main>`): Has its own independent `h-full overflow-y-auto` scroll container.
  - Right "About Community" Sidebar (`<aside>`): Has its own independent `h-full overflow-y-auto` scroll container.
- Applied identical independent section scrolling to `/community/post/[id]`.

### D. Audio & Voice Messaging Enhancement (`/messages`)
- **Voice Message Playback:** Added persistent base64 audio recording and playback with multi-format fallback (WebM, OGG, WAV, MP3) and error-resilient HTML5 audio controllers.
- **Scrollable Message Container:** Constrained message feed height and implemented automatic smooth scrolling (`messagesEndRef`) so new incoming and outgoing messages remain immediately visible without pushing outer containers.

### E. AI Assistant & Tool Calling Architecture (`/api/assistant/chat`)
- **Vercel AI SDK Integration:** `src/app/api/assistant/chat/route.ts` uses the Vercel AI SDK (`ai` and `@ai-sdk/google` via `google("gemini-2.5-flash")`).
- **Tool Calling Enabled:** Configured with `generateText()` and `stepCountIs(5)` alongside tools:
  - `searchCampusInfo`: Queries campus locations, library, timings, administrative contacts.
  - `getCommuteRides`: Fetches active carpools, rickshaw splits, routes, and seats.
  - `getMarketplaceItems`: Retrieves student items for sale and prices.
  - `getBikeRentals`: Queries available campus bicycles.
  - `getHostelServices`: Looks up laundry, maintenance, and hostel room services.
  - `createTicket`: Creates admin moderation/support requests.
- **Card Verification Distinct Stack:** In contrast, `src/app/api/auth/verify-student-card/route.ts` uses raw Gemini Vision REST calls and regex/OCR parsing rather than the Vercel AI SDK.

### F. Migration to NextAuth.js v5 & Removal of `jose`
- Installed `next-auth@^5.0.0-beta.32` and aligned `nodemailer` to `^8.0.11`.
- Configured NextAuth v5 in `src/auth.ts` with Credentials Provider verifying 6-digit OTP codes.
- Rewrote `src/lib/jwt.ts` to utilize NextAuth native `encode` and `decode`, eliminating `jose`.
- Replaced deprecated `middleware.ts` with Next.js 16 `src/proxy.ts`.

### G. Git Push & Deployment
- All local commits pushed to remote GitHub repository:
  `To https://github.com/HammadIsmail/campus-stitch.git on branch main`
- Triggered automated Vercel production rebuild with strict verification and dynamic post routes.

### I. Complete Dummy Data Seeding Across All Database Endpoints
- **Automated Seeding Pipeline (`scripts/seed_all_endpoints.mjs`):** Populated remote Supabase PostgreSQL with rich, contextual UET Lahore student data across all endpoints.
- **Seeded Tables:**
  - `profiles`: Authentic student accounts across CS, EE, ME, Civil, Architecture with hashed passwords and verified badges.
  - `rides`: Realistic carpools & rickshaw splits (Khurrialwala, Shahdara, Thokar, Gulberg, Begum Kot to UET).
  - `bikes`: Bicycle rentals located at Hostel Blocks (Honda CD 70, Sohrab Roadstar, Phoenix Commuter).
  - `listings`: Student marketplace items (Calculators, textbooks, phone coolers, mini refrigerators, lab coats).
  - `shared_items` & `owners`: High-demand fractional campus gear (DSLR cameras, gaming monitors, scientific instruments).
  - `hostel_roommates` & `services`: Roommate matching listings and room services (laundry, room cleaning, ironing).
  - `communities`: Core subreddits (`r/cs-uet`, `r/commute-splits`, `r/market-uet`, `r/hostel-life`, `r/exam-pastpapers`, etc.).
  - `community_posts` & `comments`: Authentic campus discussions, midterm past paper drives, and lab tips.
  - `notifications`: Realistic alerts for ride confirmations, buyer inquiries, verification badges, and comment replies.
- **Verification Scripts:** Verified live in database via `scripts/verify_all_endpoints.mjs` and `scripts/test_api_endpoints.mjs`.

### J. Dark Mode System & Theme Provider (`src/lib/theme-context.tsx`)
- **Theme Provider:** Created `ThemeProvider` with support for `"light" | "dark" | "system"`.
- **Theme Flash Prevention:** Added inline anti-flash script in `src/app/layout.tsx` before DOM render to immediately apply `.dark` class from `localStorage` without FOUC (flash of unstyled content).
- **Navbar & Profile Settings:** Added instant theme toggle button (Sun/Moon icon) in the header (`src/components/mobile-shell.tsx`) and an interactive theme switcher switch in the Profile page settings (`src/app/profile/page.tsx`).
- **Comprehensive Dark Styling:** Styled inputs, modals, sidebars, community posts, dropdowns, and cards using Tailwind dark variants (`dark:bg-[#121215]`, `dark:border-zinc-800`, `dark:text-white`).

### K. End-to-End Forgot Password Flow (`/forgot-password`)
- **Interactive 3-Step UI (`src/app/forgot-password/page.tsx`):**
  - **Step 1:** Student submits registered UET email address.
  - **Step 2:** Student enters the 6-digit verification OTP delivered to their email.
  - **Step 3:** Student inputs and confirms their new password with validation.
- **OTP Generation & Email Route (`POST /api/auth/forgot-password`):** Generates a secure 6-digit numeric OTP, records it in the Supabase `password_resets` table with a 15-minute expiration, and delivers it instantly via Nodemailer Gmail SMTP.
- **Password Reset Endpoint (`POST /api/auth/reset-password`):** Validates the email and OTP, computes a new `pbkdf2Sync` password hash with a unique salt, updates `profiles.password_hash`, and marks the OTP as used.
- **Sign-In Page Integration:** Added a "Forgot password?" link on the student login form (`src/app/sign-in/page.tsx`).

### L. Separate Upvote and Downvote Counters
- **Independent Counter Architecture:** Updated both the Reddit community quad feed (`src/app/community/page.tsx`) and the post detail view (`src/app/community/post/[id]/page.tsx`) to show separate vote counters instead of a merged net score.
- **Pill UI Layout:** Implemented an integrated split pill: `[ ↑ {upvotes} | ↓ {downvotes} ]` with a central divider line, individual active colors (orange for upvoted, blue for downvoted), and optimistic state updates with Supabase persistence.

### M. Student Profile Data Integrity & Nullable Bio
- **Avatar Synchronization:** The profile picture provided by the student during registration is now fetched and displayed on `/profile` via `GET /api/profile` and `GET /api/auth/me`.
- **Database Bio Support:** Added `bio` text column to `profiles` table (`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;`).
- **Nullable Bio State:** Bio state in profile defaults to `authUser?.bio || ""` with full editing capabilities.
- **Removed Hardcoded Mock Leaks:** Removed all hardcoded user names, emails, roll numbers, and dummy credentials.
- **Removed Hostel Info:** Excluded hostel fields from the user profile display as requested.

### N. Cart-Style Notification Slide-Over Drawer (`src/components/notifications-slider.tsx`)
- **Right Slide-Over Drawer:** Instead of redirecting to a separate page, clicking the notification bell in the global header opens a slide-over panel from the right edge (`fixed inset-y-0 right-0 w-full sm:w-[420px]`).
- **Dimmed Backdrop Overlay:** Includes an accessible `fixed inset-0 bg-black/60 backdrop-blur-xs` overlay that dismisses on click or <kbd>Esc</kbd> keypress, with body scroll locking.
- **Category Filter Tabs:** Tabs for `All`, `Rides`, `Market`, and `Verification`.
- **Rich Cards & Actions:** Category badges/icons (Compass, Bike, Tag, ShieldCheck, MessageSquare), unread pulse dots, relative timestamps, and "View details →" links that route and close the drawer.
- **Instant Mark As Read:** Features a "Mark read" button updating both local state and remote Supabase `notifications` records.
- **Global Header Connection:** Replaced the Bell `<Link href="/notifications">` with an interactive button in `src/components/mobile-shell.tsx`.

### O. Pinned Community Bottom Navigation & Footer Removal
- **Pinned Bottom Navigation in Communities:** Added `<BottomNav />` to `src/app/community/page.tsx` and `src/app/community/post/[id]/page.tsx`, with `pb-20 md:pb-5` padding on the center scroll containers to ensure posts scroll smoothly above the fixed mobile bar.
- **Removed Global Web Footer:** Completely deleted the desktop and mobile footer from `src/components/mobile-shell.tsx`. No footer is rendered anywhere across the application.
- **Vercel Build Font Fix:** Replaced `next/font/google` (`Figtree`) in `src/app/layout.tsx` with preconnected Google Fonts (`Plus Jakarta Sans` & `Inter`), resolving Turbopack `@vercel/turbopack-next/internal/font/google/font` resolution failure and dropping production build time to 9.1s.

---

## 3. Verified System Status
| Component | Status | Notes |
| :--- | :--- | :--- |
| **Dev Server** | 🟢 Running | `npm run dev` running locally on port 3000 |
| **TypeScript Compilation** | 🟢 Passing | `npx tsc --noEmit` exits with code 0 (zero errors) |
| **Production Build** | 🟢 Passing | `npm run build` with Turbopack compiles 49 routes in ~9s |
| **Account Creation & DB** | 🟢 Fixed | Valid UUID profile persistence; verified in Supabase PostgreSQL |
| **Forgot Password Flow** | 🟢 Live | Email OTP delivery + password reset verified end-to-end |
| **Separate Vote Counts** | 🟢 Active | `[ ↑ {upvotes} \| ↓ {downvotes} ]` on feed and post detail |
| **Dark Mode System** | 🟢 Active | Theme context with anti-flash script, header & profile toggle |
| **Notifications Drawer** | 🟢 Active | Cart-style right slider with filter tabs and mark-as-read |
| **Community Bottom Nav** | 🟢 Active | Pinned mobile tabs on `/community` and `/community/post/[id]` |
| **Global Web Footer** | 🟢 Removed | Completely eliminated from all views |
| **Student Card Verification** | 🟢 Strict & Fixed | Cropped photos rejected; required fields enforced |
| **Remote Git** | 🟢 Synced | Pushed to GitHub `main` branch |
