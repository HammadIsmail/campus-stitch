# CampuStitch — Current Project State

## 1. Where We Are Right Now (Snapshot)
- **Framework & Runtime:** Next.js `16.3.8` (App Router), React `19.2.8`, Node.js `v24.14.0` on Windows.
- **Authentication System:** Complete **NextAuth.js v5** (`next-auth@5.0.0-beta.32`) implementation.
- **Email Delivery:** **Nodemailer** using Gmail SMTP (`MAIL_SERVER=smtp.gmail.com`, Port `465`/`587`) for instantaneous delivery of 6-digit OTP codes.
- **Route Guarding:** Next.js 16 `src/proxy.ts` convention strictly protecting `/` and all private platform routes with `307 Redirect` to `/sign-in`.
- **Database & Storage:** Supabase PostgreSQL database tables connected via `@supabase/ssr` / `@supabase/supabase-js`, and Cloudinary for media uploads.
- **Git Repository:** Fully synchronized with `https://github.com/HammadIsmail/campus-stitch.git` on branch `main`.

---

## 2. Recent Major Milestones Completed

### A. Migration to NextAuth.js v5 & Removal of `jose`
- **User Request:** "use nextauth.js for complete auth system" & "uninstall jose".
- **Action Taken:**
  - Installed `next-auth@^5.0.0-beta.32` and aligned `nodemailer` to `^8.0.11` for clean, unforced peer dependency resolution.
  - Implemented NextAuth v5 configuration in `src/auth.ts` with Credentials Provider verifying 6-digit OTP codes.
  - Built NextAuth App Router endpoint at `src/app/api/auth/[...nextauth]/route.ts`.
  - Wrapped `src/app/layout.tsx` with `AuthSessionProvider` (`SessionProvider`).
  - Rewrote `src/lib/jwt.ts` to utilize NextAuth's native `encode` and `decode` functions (`next-auth/jwt`), completely eliminating the external `jose` package.
  - Uninstalled `jose` from `package.json` and `node_modules`.

### B. Nodemailer Gmail SMTP for 6-Digit OTP Codes
- **Context:** Supabase's default shared mailer (`noreply@mail.app.supabase.io`) locked email templates to prevent editing, sending only a generic sign-in link instead of a 6-digit code.
- **Action Taken:**
  - Configured Nodemailer with user-provided Gmail SMTP credentials (`ranahammadismail@gmail.com`).
  - Implemented `src/lib/mailer.ts` with IPv4-first DNS resolution (`dns.setDefaultResultOrder('ipv4first')`) to prevent Windows socket resolution errors.
  - Created in-memory 10-minute OTP store with attempt limiting in `src/lib/otp-store.ts`.
  - Built endpoints:
    - `POST /api/auth/otp/send`: Generates and emails the 6-digit code via Nodemailer.
    - `POST /api/auth/otp/verify`: Verifies code and generates user session.
  - Verified live email delivery directly to the user's Gmail inbox (< 2 seconds).

### C. UI & UX Refinement on Sign-In Page
- **Removed Hardcoded Test Codes:** Deleted all occurrences of `(Enter 123456 or your code)` and `(Use 123456 for instant test)`.
- **Removed Demo Bypass Button:** Completely deleted the "Instant Demo: Verified Student (2021-CS-104)" bypass button as requested by the user.
- **Neutral Placeholder:** Changed OTP input placeholder to `------`.
- **Integrated Sign-In:** Integrated `signIn("credentials")` from `next-auth/react`.

### D. Next.js 16 `src/proxy.ts` Implementation
- Replaced deprecated `src/middleware.ts` with `src/proxy.ts` (Next.js 16 breaking change).
- Whitelist architecture: Only `/sign-in`, `/sign-up`, `/login`, `/api/auth`, `/auth` are public.
- Any unauthenticated visit to `/` or any internal route returns `307 Redirect` to `/sign-in`.
- Role-based authorization: Non-admin users attempting to open `/admin` are redirected to `/?error=admin_access_required`.

---

## 3. Verified System Status
| Component | Status | Notes |
| :--- | :--- | :--- |
| **Dev Server** | 🟢 Running | `http://localhost:3000` |
| **TypeScript Compilation** | 🟢 Passing | `npx tsc --noEmit` exits with code 0 |
| **NextAuth.js v5** | 🟢 Active | Configured in `src/auth.ts` |
| **Nodemailer SMTP** | 🟢 Verified | Tested live email sending to Gmail |
| **Route Protection** | 🟢 Active | Tested with curl/fetch: `GET /` returns `307 Location: /sign-in` |
| **Remote Git** | 🟢 Up to date | Branch `main` on GitHub |
