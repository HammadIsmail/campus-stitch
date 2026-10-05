# CampuStitch — Agent Resume Guide

## 1. When Reopening Antigravity IDE
When this repository is loaded into an AI agent session after closing Antigravity, read this file and `CURRENT_STATE.md` first.

---

## 2. Critical User Rules & Constraints (Non-Negotiable)

1. **User Tests the UI:** 
   - **DO NOT launch `browser_subagent` to click or test pages.** 
   - The user explicitly commanded: *"i will test every feature now myself"*.
   - Only run backend/API tests (`curl`, `fetch`, `npx tsc --noEmit`, `git` commands).

2. **No Roll Number / Student ID Field:**
   - The user explicitly commanded: *"do not ask for Roll no from user we will not keep this field"*.
   - `student_id` is completely removed from `profiles` and `verifications` in `supabase/schema.sql` and all sign-up forms.
   - Do **NOT** reintroduce roll numbers or student IDs into registration or schema.

3. **No Profile Picture at Sign-up:**
   - Registration does not take or require a profile picture. Students can optionally upload an avatar later on `/profile`.

4. **No University Email Restriction:**
   - Any valid email address (Gmail, Outlook, Yahoo, etc.) is accepted for student accounts, verified via a 6-digit email OTP.

5. **Campus City Dropdown (City Names Only):**
   - The campus dropdown must display clean city names only (e.g. `Lahore`, `Faisalabad`, `Kala Shah Kaku`), **never** full street addresses.

6. **System-Fed Curated Departments:**
   - Departments are curated by the system and served dynamically via `GET /api/departments` from the PostgreSQL `departments` table, with a fallback list in `src/app/sign-up/page.tsx`.

7. **Unified Black & White Aesthetic:**
   - Strictly adhere to the app's minimalist monochrome theme (`bg-black dark:bg-white text-white dark:text-black`, `border-zinc-300 dark:border-zinc-700`).
   - Do **NOT** use green or emerald colors on auth buttons, dialogs, progress bars, or trust badges.

8. **Default Unverified Status & Dialog:**
   - Newly created accounts receive `is_verified: false` and `verification_status: "unverified"`.
   - The `UnverifiedDialog` component on the root dashboard explains this status and links to `/verify`.

9. **Binance-Style KYC & Admin Moderation:**
   - Verification takes place under `/verify` with a live webcam face selfie (oval guide frame) + student ID card front photo upload.
   - Admin moderates under `/admin` with side-by-side photo comparison and Approve / Reject controls.

10. **Next.js 16 Proxy Convention (`AGENTS.md`):**
    - The middleware file convention is **deprecated** in Next.js 16.
    - We use `src/proxy.ts` (exporting `export async function proxy(request)`).
    - Whitelist public endpoints: `/api/auth`, `/api/upload`, `/api/departments`, `/api/universities`.
    - Do **NOT** revert to `middleware.ts`.

11. **Next.js 16 Dynamic Route Parameters (`params` Promise):**
    - In Next.js 16 App Router, `params` passed into page components is a Promise.
    - Client components must unwrap it using React 19's `React.use(params)`.

12. **Community Independent Section Scrolling & Pinned BottomNav:**
    - On `/community` and `/community/post/[id]`, full body scrolling is prohibited.
    - Each column manages its own independent `h-full overflow-y-auto` scroll container with `pb-20 md:pb-5` padding.
    - Pinned mobile bottom navigation `<BottomNav />` is rendered on all community pages.
    - The global desktop/mobile footer has been completely removed across the application.

13. **Turbopack Google Font Rule (Vercel Build Stability):**
    - Do **NOT** use `next/font/google` (`import { Figtree } from "next/font/google"`).
    - In Next.js 16 (`16.3.8`), Turbopack on Vercel fails with `Can't resolve '@vercel/turbopack-next/internal/font/google/font'`.
    - Always load external fonts via preconnected `<link rel="stylesheet">` tags in `src/app/layout.tsx` `<head>` and declare via `--font-sans` in `src/app/globals.css`.

14. **Separate Upvote & Downvote Counters:**
    - Upvotes and downvotes must always be kept separate (`[ ↑ {upvotes} | ↓ {downvotes} ]`), not merged into a single net score.

15. **Zero Dummy Data Leaks:**
    - Never hardcode mock student credentials, names (e.g. `'Muhammad Hammad'`), emails, or fake roll numbers in components, routes, or database seeds.

16. **Secrets & Git Security:**
    - `.env.local` contains live credentials. It is in `.gitignore`. **NEVER commit sensitive credentials to GitHub.**

---

## 3. Required Environment Variables (`.env.local`)
Ensure `.env.local` exists in the workspace root with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ccxtfbytfrffewpuscak.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
DATABASE_URL=postgresql://postgres.ccxtfbytfrffewpuscak:...

# Nodemailer Gmail SMTP
MAIL_USERNAME=ranahammadismail@gmail.com
MAIL_PASSWORD=rxrv vzjx ljqg bvwt
MAIL_PORT=587
MAIL_FROM=ranahammadismail@gmail.com
MAIL_SERVER=smtp.gmail.com
MAIL_STARTTLS=True
MAIL_SSL_TLS=False

# NextAuth v5
AUTH_SECRET=campus-stitch-uet-lahore-nextauth-super-secret-key-2026-authjs
AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# AI & Media
GEMINI_API_KEY=AQ.Ab8RN6L2q_...
UPLIFT_API_KEY=sk_api_...
CLOUDINARY_URL=cloudinary://...
```

---

## 4. Key Verification Commands
```bash
# Typecheck
npx tsc --noEmit

# Test Departments API
Invoke-RestMethod -Uri 'http://localhost:3000/api/departments' -Method GET

# Production Build Validation
npm run build
```
