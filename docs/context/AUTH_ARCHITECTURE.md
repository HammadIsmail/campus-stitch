# CampuStitch — Authentication & Identity Architecture

## 1. Architecture Overview
CampuStitch employs a clean, two-phase student identity model:
1. **Phase 1: Instant Account Registration (`/sign-up`)**: Standard manual registration with password hashing, university, campus city, department, and 6-digit email OTP verification. Any valid email (Gmail, Outlook, Yahoo, edu) is accepted. Newly created accounts default to **Unverified**.
2. **Phase 2: Binance-Style KYC Verification (`/verify`)**: Students verify their account by snapping a live face selfie using their webcam (with an oval frame guide) and uploading the front of their student ID card. An administrator reviews the application via `/admin` and awards the verified badge.

```
                    ┌─────────────────────────┐
                    │ Student Signs Up        │
                    │ (/sign-up page)         │
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
                    │ in Email Inbox (< 2s)   │
                    └────────────┬────────────┘
                                 │
                     Student Enters 6-Digit Code
                                 │
                     POST /api/auth/sign-up
                                 │
                    ┌────────────▼────────────┐
                    │ Profile Created with    │
                    │ is_verified = false     │
                    │ Sets JWT Cookie         │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ UnverifiedDialog on /   │
                    │ Options: Verify / Skip  │
                    └────────────┬────────────┘
                                 │ (Clicks Verify)
                    ┌────────────▼────────────┐
                    │ /verify (Binance KYC)   │
                    │ Live Face + ID Card     │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ /admin (Manual Review)  │
                    │ Approve -> Verified     │
                    └─────────────────────────┘
```

---

## 2. Key Components

### 1. Registration & Supabase Profile Persistence (`src/app/api/auth/sign-up/route.ts`)
- **No Roll Number Field:** Roll number / student ID is **not** requested or saved. The `profiles` table in Supabase does not store `student_id`.
- **No Profile Picture Required:** Avatar upload is skipped during onboarding.
- **Dynamic University & City:** Supports 16 major Pakistani universities with city-only campus dropdowns.
- **System-Fed Department:** Populated from the curated 18-department list via `/api/departments`.
- **Default Status:** Sets `is_verified: false` and `verification_status: "unverified"`.
- **Primary Key Generation:** Generates valid standard UUIDs (`crypto.randomUUID()`) for `profiles.id`.
- **Password Security:** Hashes passwords with salt using Node.js `crypto.scryptSync` (`src/lib/password.ts`) and stores `password_hash` in `profiles`.
- **Error Handling:** Directly validates Supabase `{ data, error }` return values, failing fast on database errors.

### 2. Nodemailer Gmail Transporter (`src/lib/mailer.ts`)
- Configured with Gmail SMTP:
  - `host: "smtp.gmail.com"`
  - `port: 465` (SSL/TLS) or `port: 587` (STARTTLS)
  - `auth: { user: process.env.MAIL_USERNAME, pass: process.env.MAIL_PASSWORD }`
- **IPv4 Fallback:** Uses `dns.setDefaultResultOrder("ipv4first")` to ensure reliable SMTP socket connectivity on Windows environments.
- Sends a mobile-optimized, branded black & white HTML email displaying the 6-digit passcode.

### 3. In-Memory OTP Store (`src/lib/otp-store.ts`)
- Holds active OTP codes with timestamps:
  - Expiration: **10 minutes**.
  - Rate limiting: Maximum **5 attempts** per OTP before invalidation.
  - One-time consumption: The code is deleted immediately upon successful verification.

### 4. Next.js 16 Proxy Convention (`src/proxy.ts`)
- Replaces the deprecated `middleware.ts` convention.
- **Public Routes Whitelist:**
  ```typescript
  const PUBLIC_PREFIXES = [
    "/sign-in",
    "/sign-up",
    "/login",
    "/forgot-password",
    "/api/auth",
    "/auth",
    "/api/upload",
    "/api/departments",
    "/api/universities",
  ];
  ```
- **Protected Routes:** Every other route (including root `/`) requires an active authenticated session. Unauthenticated requests receive `307 Redirect` to `/sign-in`.
- **Admin Protection:** Checks `payload.role === "admin"`. Non-admin students attempting to access `/admin` receive `403 Forbidden` or redirect.

### 5. Client Auth Context & Provider (`src/lib/auth-context.tsx`)
- Provides `useAuth()` hook for state tracking, manual sync, and login/logout triggers.
- Navigation upon sign-up and sign-in completion uses full-page transitions to guarantee clean cookie attachment.

### 6. Binance-Style KYC Verification (`src/app/verify/page.tsx` & `/api/verifications`)
- **Live Face Camera:** Prompts the student to center their face in an oval viewfinder and captures a live webcam snapshot blob.
- **Student ID Front Photo:** Attaches an image file of the student ID card.
- **Submission:** Submits both images to `POST /api/verifications`, updating `profiles.verification_status` to `"pending"`.

### 7. Admin Moderation Panel (`src/app/admin/page.tsx`)
- Lists pending verifications with side-by-side Live Face Selfie & Student ID card preview.
- **Approve Action:** Calls `PATCH /api/verifications` with `status: "approved"`, updating `profiles.is_verified = true` and `profiles.verification_status = "verified"`.
- **Reject Action:** Calls `PATCH /api/verifications` with `status: "rejected"`.
