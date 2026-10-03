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

3. **Design Aesthetic:**
   - Unified classic black & white monochrome aesthetic (`#000000`, `#FFFFFF`, `#18181B`, `#F4F4F5`, `#ECEEF2`).
   - No flashy or unharmonious primary colors.

4. **Secrets & Git Security:**
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
