# CampuStitch — Current Project State

## 1. Where We Are Right Now (Snapshot)
- **Framework & Runtime:** Next.js `16.3.8` (App Router), React `19.2.8`, Node.js `v24.14.0` on Windows.
- **Authentication & Onboarding:** Standard manual registration form with 6-digit email OTP verification (Nodemailer Gmail SMTP). Any valid email accepted (Gmail, Outlook, Yahoo, etc.).
- **No Roll Number / Student ID:** Completely eliminated `student_id` / Roll No from the database schema (`profiles` and `verifications` tables), sign-up form, and admin review queue.
- **No Profile Picture at Sign-up:** Avatar upload removed from registration; students can optionally upload a profile picture later on `/profile`.
- **Universities & Campuses:** Searchable dropdown supporting 16 major Pakistani universities with **city-only** campus dropdowns (e.g. Lahore, Kala Shah Kaku, Faisalabad, Narowal).
- **System-Fed Curated Departments:** 18 curated academic departments fed dynamically from the database (`departments` table) via `GET /api/departments`.
- **Default Unverified Account & Dialog:** All new sign-ups default to `is_verified = false`, `verification_status = 'unverified'`. Upon registration, an interactive modal dialog informs users of their unverified status with options to "Verify Yourself Now" or "Continue as Unverified".
- **Binance-Style KYC Verification (`/verify`):** Live webcam face selfie with an oval guide frame + student ID card front photo upload.
- **Admin Review Panel (`/admin`):** Real-time admin dashboard displaying live queue with side-by-side Live Face Selfie and Student ID Card comparison, one-click Approve (`is_verified = true`) or Reject actions.
- **Universal Verification Badge:** `<VerificationBadge isVerified={...} />` integrated across community posts, carpool rides, marketplace listings, and hostel roommate cards.
- **Unified Monochrome Styling:** Strict Black & White aesthetic (`bg-black dark:bg-white text-white dark:text-black`, `border-zinc-300 dark:border-zinc-700`) used across all auth pages, dialogs, badges, and verification controls.
- **Database & Storage:** Supabase PostgreSQL with clean schema (`supabase/schema.sql`), zero dummy data leaks, and Cloudinary for media uploads.
- **Route Guarding:** Next.js 16 `src/proxy.ts` strictly guarding private routes while whitelisting `/api/auth`, `/api/upload`, `/api/departments`, and `/api/universities`.
- **Git Status:** 100% synchronized with `https://github.com/HammadIsmail/campus-stitch.git` on branch `main`.

---

## 2. Recent Major Milestones Completed

### A. Frictionless Sign-up & Onboarding Form (`/sign-up`)
- **Eliminated Upfront OCR Requirement:** Students no longer need to perform complex card scanning just to create an account.
- **Removed Roll Number Field:** As requested, roll number / student ID is no longer asked or kept during sign-up. The `student_id` column was dropped from `profiles` in `supabase/schema.sql`.
- **Removed Avatar Capture from Sign-up:** Students sign up quickly without being prompted for a webcam profile photo.
- **Broad Email Acceptance:** Any valid email address (Gmail, Yahoo, Outlook, university email) is allowed and confirmed with an instantaneous 6-digit email OTP.
- **Clean City-Only Campuses:** Replaced verbose street addresses with clear city names across all 16 major supported Pakistani universities (`src/lib/universities.ts`).
- **Dynamic System-Fed Departments:** Curated list of 18 departments (`/api/departments` & `public.departments`) populated in a styled select dropdown.
- **Strict Black & White Palette:** Replaced green/emerald accents with high-contrast monochrome design tokens.

### B. Default Unverified Account Flow & Onboarding Prompt
- **Default Unverified Status:** Accounts are created with `is_verified: false` and `verification_status: "unverified"`.
- **Unverified Modal Dialog (`src/components/unverified-dialog.tsx`):** Displays automatically upon initial landing on the dashboard after sign-up, explaining the safety perks of verification with clean "Verify Yourself Now" and "Continue as Unverified" buttons.

### C. Binance-Style KYC Live Face & ID Card Verification (`/verify`)
- **Webcam Live Face Capture:** Interactive camera feed with a centered SVG oval face guide frame for authentic biometric capture.
- **Student ID Card Front Upload:** Easy drag-and-drop or file selector to attach the front of the student ID card.
- **Full Profile Confirmation:** Displays student name, program, university, and campus city.
- **Submission Endpoint (`POST /api/verifications`):** Uploads biometric selfie and card front, sets profile status to `pending`, and queues for admin review.

### D. Live Admin Verification Review Panel (`/admin`)
- **Live Supabase Queue:** Fetches submitted verification requests via `GET /api/verifications`.
- **Side-by-Side Visual Comparison:** Side-by-side display of the applicant's **Live Face Selfie** and **Student ID Front Photo**.
- **Admin Decisions (`PATCH /api/verifications`):**
  - **Approve:** Sets `profiles.is_verified = true` and `verification_status = 'verified'`, awarding the Verified Student badge.
  - **Reject:** Sets `profiles.is_verified = false` and `verification_status = 'rejected'`.

### E. Universal Verification Badge (`src/components/ui/verification-badge.tsx`)
- Displays verified, pending, and unverified trust states across:
  - **Community Feed & Post Detail** (`/community` & `/community/post/[id]`)
  - **Commute Ride Listings** (`/commute`)
  - **Student Marketplace Listings & Modal** (`/market`)
  - **Hostel Roommate & Service Listings** (`/hostel`)
  - **Student Profile Page** (`/profile`) with "Verify Yourself" banner for unverified students.

### F. Complete Database Schema Sanitization (`supabase/schema.sql`)
- Dropped `student_id` from `profiles` and `verifications`.
- Added `city text` and `live_photo_url text` to `profiles`.
- Added dedicated `departments` table in PostgreSQL with public read RLS policy and auto-seeding.
- Added idempotent `ALTER TABLE` migrations for existing databases.
- Purged all hardcoded names (e.g. `'Muhammad Hammad'`) and mock roll numbers from listings and verification seeds.

---

## 3. Verified System Status
| Component | Status | Notes |
| :--- | :--- | :--- |
| **Dev Server** | 🟢 Running | `npm run dev` running locally on port 3000 |
| **TypeScript Compilation** | 🟢 Passing | `npx tsc --noEmit` exits with code 0 (zero errors) |
| **Registration Form** | 🟢 Live | B&W theme, city campuses, system-fed departments, no roll no |
| **Email OTP Delivery** | 🟢 Live | Instant 6-digit passcode via Nodemailer Gmail SMTP |
| **Unverified Dialog** | 🟢 Live | B&W post-registration prompt on dashboard |
| **Binance KYC Verification** | 🟢 Live | Live face camera with oval guide + ID card upload at `/verify` |
| **Admin KYC Moderation** | 🟢 Live | Side-by-side live selfie & ID card review at `/admin` |
| **Universal Trust Badge** | 🟢 Live | Active on Community, Commute, Market, Hostel, Profile |
| **Departments API** | 🟢 Live | `GET /api/departments` returns 200 OK with curated list |
| **Database Schema** | 🟢 Clean | `supabase/schema.sql` updated with zero dummy leaks |
| **Remote Git** | 🟢 Synced | All changes committed and pushed to `main` branch |
