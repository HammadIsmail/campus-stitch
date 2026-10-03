# CampuStitch — Authentication Architecture

## 1. Architecture Overview
CampuStitch employs a unified **NextAuth.js v5 (Auth.js)** authentication system combined with a custom **Nodemailer Gmail SMTP 6-digit OTP delivery pipeline** and **Next.js 16 `src/proxy.ts`** route guarding.

```
                    ┌─────────────────────────┐
                    │ Student Enters Email    │
                    │   (/sign-in page)       │
                    └────────────┬────────────┘
                                 │
                     POST /api/auth/otp/send
                                 │
                    ┌────────────▼────────────┐
                    │  src/lib/otp-store.ts   │
                    │  (Generates 6-Digit OTP)│
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   src/lib/mailer.ts     │
                    │   (Nodemailer Gmail)    │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Student Receives OTP    │
                    │ in Gmail Inbox (< 2s)   │
                    └────────────┬────────────┘
                                 │
                     Student Enters 6-Digit Code
                                 │
                     signIn("credentials")
                                 │
                    ┌────────────▼────────────┐
                    │       src/auth.ts       │
                    │ (NextAuth.js v5 Engine) │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Issues Session Token    │
                    │ Sets HTTP-Only Cookies  │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  src/proxy.ts allows    │
                    │ access to Home (/)      │
                    └─────────────────────────┘
```

---

## 2. Key Components

### 1. NextAuth.js v5 Core (`src/auth.ts`)
- **Credentials Provider:** Accepts `email` and `code` (6-digit OTP).
- **Verification Hook:** Calls `verifyOtp(email, code)` from `src/lib/otp-store.ts`.
- **Role Assignment:** Automatically tags admin emails (e.g., `ranahammadismail@gmail.com` or addresses containing `admin`) with `role: "admin"`; all other students receive `role: "student"`.
- **Session Strategy:** Stateless JWT session strategy (`maxAge: 7 days`).
- **Callbacks:** Enriches session and JWT token with `studentId`, `role`, `program`, `isVerified`, and `hostelBlock`.

### 2. NextAuth App Router Handler (`src/app/api/auth/[...nextauth]/route.ts`)
```typescript
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

### 3. Nodemailer Gmail Transporter (`src/lib/mailer.ts`)
- Configured with Gmail SMTP:
  - `host: "smtp.gmail.com"`
  - `port: 465` (SSL/TLS)
  - `auth: { user: process.env.MAIL_USERNAME, pass: process.env.MAIL_PASSWORD }`
- **Critical Fix:** Uses `dns.setDefaultResultOrder("ipv4first")` to ensure seamless SMTP socket connectivity on Windows environments where IPv6 lookups can stall.
- Sends a mobile-optimized, branded black & white HTML email displaying the 6-digit passcode.

### 4. OTP Store (`src/lib/otp-store.ts`)
- In-memory store holding active codes with timestamps:
  - Expiration: **10 minutes**.
  - Rate limiting: Maximum **5 attempts** per OTP before invalidation.
  - One-time consumption: The code is deleted immediately upon successful verification.

### 5. Next.js 16 Proxy Convention (`src/proxy.ts`)
- Replaces the deprecated `middleware.ts` convention.
- **Public Routes Whitelist:**
  ```typescript
  const PUBLIC_PREFIXES = ["/sign-in", "/sign-up", "/login", "/api/auth", "/auth"];
  ```
- **Protected Routes:** Every other route (including root `/`) requires an active authenticated session. Unauthenticated requests receive `307 Redirect` to `/sign-in`.
- **Admin Protection:** Checks `req.auth?.user?.role === "admin"`. Non-admin students accessing `/admin` are bounced to `/?error=admin_access_required`.

### 6. Client Auth Context & Provider (`src/lib/auth-context.tsx` & `src/components/auth-session-provider.tsx`)
- Root layout is wrapped with `AuthSessionProvider` (`SessionProvider` from `next-auth/react`).
- Exposes `useAuth()` hook for state tracking, manual sync, and login/logout triggers.
