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

4. **Community Independent Section Scrolling (No Body Scroll):**
   - On `/community` and `/community/post/[id]`, full body scrolling is prohibited.
   - Handled in `src/components/mobile-shell.tsx` via `isCommunityPage`, locking the main container to `h-screen max-h-screen overflow-hidden` and `h-[calc(100dvh-64px)] min-h-0`.
   - Desktop footer is hidden on community routes.
   - Each column (`<aside>` left, `<main>` center, `<aside>` right) manages its own `h-full overflow-y-auto` scroll container.

5. **AI Assistant & Tool Calling Architecture:**
   - `src/app/api/assistant/chat/route.ts` is built on the **Vercel AI SDK** (`ai` + `@ai-sdk/google`).
   - Uses `generateText()` with `stepCountIs(5)` and tools: `searchCampusInfo`, `getCommuteRides`, `getMarketplaceItems`, `getBikeRentals`, `getHostelServices`, `createTicket`.
   - `src/app/api/auth/verify-student-card/route.ts` uses raw Gemini Vision REST calls and regex/OCR parsing (not Vercel AI SDK).

6. **Design Aesthetic:**
   - Unified classic black & white monochrome aesthetic (`#000000`, `#FFFFFF`, `#18181B`, `#F4F4F5`, `#ECEEF2`).
   - No flashy or unharmonious primary colors.

7. **Secrets & Git Security:**
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
- Route protection is strictly enforced in **`src/proxy.ts`**; unauthenticated visits to `/` redirect to `/sign-in`.
- `jose` is **not installed**; NextAuth's native `encode` and `decode` in `src/lib/jwt.ts` manage all token handling.
- Student ID card verification rejects cropped/incomplete photos missing University Name, Full Name, or Roll Number with zero hardcoded fallbacks.

