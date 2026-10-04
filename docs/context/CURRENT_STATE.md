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


---

## 3. Verified System Status
| Component | Status | Notes |
| :--- | :--- | :--- |
| **Dev Server** | 🟢 Running | `npm run dev` running locally on port 3000 |
| **TypeScript Compilation** | 🟢 Passing | `npx tsc --noEmit` exits with code 0 |
| **Student Card Verification** | 🟢 Strict & Fixed | Cropped photos rejected; required fields enforced; zero mock fallbacks |
| **Reddit Communities** | 🟢 Dynamic Routes | Dedicated `/community/post/[id]` pages + 3-column independent scroll |
| **Messaging & Voice** | 🟢 Ready | Base64 audio playback + fixed auto-scroll message container |
| **NextAuth.js v5** | 🟢 Active | Configured in `src/auth.ts` |
| **Nodemailer SMTP** | 🟢 Verified | Tested live email sending to Gmail (< 2s delivery) |
| **Route Protection** | 🟢 Active | Next.js 16 `src/proxy.ts` guarding platform routes |
| **Remote Git** | 🟢 Synced | All commits pushed to `origin/main` |
