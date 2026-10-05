# CampuStitch — Agent Resume Guide

## 1. When Reopening Antigravity IDE
When this repository is loaded into an AI agent session after closing Antigravity, read this file and `CURRENT_STATE.md` first.

---

## 2. Critical User Rules & Constraints (Non-Negotiable)

1. **User Tests the UI:** 
   - **DO NOT launch `browser_subagent` to click or test pages.** 
   - The user explicitly commanded: *"i will test every feature now myself"*.
   - Only run backend/API tests (`curl`, `fetch`, `npx tsc --noEmit`, `git` commands).

2. **Next.js 16 Proxy Convention (`AGENTS.md`):**
   - The middleware file convention is **deprecated** in Next.js 16.
   - We use `src/proxy.ts` (exporting `export async function proxy(request)` or `export const proxy = auth(...)`).
   - Do **NOT** revert to `middleware.ts`.

3. **Next.js 16 Dynamic Route Parameters (`params` Promise):**
   - In Next.js 16 App Router, `params` passed into page components is a Promise.
   - Client components must unwrap it using React 19's `React.use(params)`:
     ```tsx
     export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
       const resolvedParams = React.use(params);
       const postId = resolvedParams.id;
       ...
     }
     ```

4. **Community Independent Section Scrolling & Pinned BottomNav:**
   - On `/community` and `/community/post/[id]`, full body scrolling is prohibited.
   - Handled in `src/components/mobile-shell.tsx` via `isCommunityPage`, locking the main container to `h-screen max-h-screen overflow-hidden` and `h-[calc(100dvh-64px)] min-h-0`.
   - Each column manages its own independent `h-full overflow-y-auto` scroll container with `pb-20 md:pb-5` padding so cards scroll cleanly above the mobile tabs.
   - Pinned mobile bottom navigation `<BottomNav />` is rendered on all community pages.
   - The global desktop/mobile footer has been completely removed across the application.

5. **AI Assistant & Tool Calling Architecture:**
   - `src/app/api/assistant/chat/route.ts` is built on the **Vercel AI SDK** (`ai` + `@ai-sdk/google`).
   - Uses `generateText()` with `stepCountIs(5)` and tools: `searchCampusInfo`, `getCommuteRides`, `getMarketplaceItems`, `getBikeRentals`, `getHostelServices`, `createTicket`.
   - `src/app/api/auth/verify-student-card/route.ts` uses raw Gemini Vision REST calls and regex/OCR parsing (not Vercel AI SDK).

6. **Design Aesthetic & Dark Mode:**
   - Unified classic black & white monochrome aesthetic (`#000000`, `#FFFFFF`, `#18181B`, `#F4F4F5`, `#ECEEF2`).
   - Full dark mode support managed by `ThemeProvider` (`src/lib/theme-context.tsx`).
   - All components must provide dark variant classes (`dark:bg-[#121215]`, `dark:border-zinc-800`, `dark:text-white`).

7. **Notification Slide-Over Drawer:**
   - Notifications do **NOT** navigate away to `/notifications`.
   - Clicking the Bell button in the global header triggers the right slide-over drawer (`src/components/notifications-slider.tsx`) with category filters (`All`, `Rides`, `Market`, `Verification`) and instant mark-as-read.

8. **Turbopack Google Font Rule (Vercel Build Stability):**
   - Do **NOT** use `next/font/google` (`import { Figtree } from "next/font/google"`).
   - In Next.js 16 (`16.3.8`), Turbopack on Vercel fails with `Can't resolve '@vercel/turbopack-next/internal/font/google/font'`.
   - Always load external fonts via preconnected `<link rel="stylesheet">` tags in `src/app/layout.tsx` `<head>` and declare via `--font-sans` in `src/app/globals.css`.

9. **Separate Upvote & Downvote Counters:**
   - Upvotes and downvotes must always be kept separate (`[ ↑ {upvotes} | ↓ {downvotes} ]`), not merged into a single net score.

10. **Zero Dummy Data Leaks:**
    - Never hardcode mock student credentials, names, emails, roll numbers, or passwords in components or routes.
    - Profiles must dynamically read from `profiles` via `useAuth()` or `GET /api/profile`.
    - Profile `bio` is nullable and user-editable. Do not display hostel details on student profiles.

11. **Secrets & Git Security:**
    - `.env.local` contains live credentials (Gmail App Password, Supabase Key, Gemini Key, Uplift Key, Cloudinary).
    - `.env.local` is in `.gitignore`. **NEVER commit sensitive credentials to GitHub.**

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
Run in PowerShell from the project root:

```powershell
# 1. Check TypeScript compilation
npx tsc --noEmit

# 2. Check Git status
git status

# 3. Check dev server status
node -e "fetch('http://localhost:3000/api/auth/otp/send', { method: 'OPTIONS' }).then(r => console.log('SERVER ONLINE:', r.status))"
```

---

## 5. Summary of Authentication Architecture
- Sign-In uses **NextAuth.js v5** (`src/auth.ts`) with a Credentials provider.
- 6-digit OTP codes are delivered to student emails via **Nodemailer Gmail SMTP** (`src/lib/mailer.ts`).
- Account creation persists student profiles to Supabase PostgreSQL (`public.profiles`) using standard UUIDs (`crypto.randomUUID()`) and `scrypt` password hashing (`src/lib/password.ts`).
- Sign-In queries `profiles` by `email` and verifies `password_hash`, issuing an authenticated JWT session (`campus_stitch_token`).
- Route protection is strictly enforced in **`src/proxy.ts`** using `getJwtFromRequest(request)`; unauthenticated visits to `/` redirect to `/sign-in`.
- Client auth navigation upon sign-up and sign-in uses `window.location.href` to ensure HTTP cookies are cleanly attached by the browser during full-document navigation.
- `jose` is **not installed**; NextAuth's native `encode` and `decode` in `src/lib/jwt.ts` manage all token handling with multi-salt fallbacks.
- Student ID card verification rejects cropped/incomplete photos missing University Name, Full Name, or Roll Number with zero hardcoded fallbacks.

