# CampuStitch - Developer & AI Context Cheatsheet

> **Purpose**: This single document provides the complete, authoritative architectural snapshot of CampuStitch. Any developer or AI agent (Antigravity/Claude/GPT) can read **only this file** to understand how to add new features, endpoints, or screens without scanning the rest of the codebase.

---

## 1. Project Identity & Stack Overview

- **Product**: **CampuStitch** — Pakistani Multi-Tenant University Student SuperApp (Carpooling, Bike Rentals, Hostel Marketplace, Student Services & Verified Community).
- **Package Name (Android)**: `com.campusstitch.app`
- **Live Production Web**: `https://campus-stitch.vercel.app`
- **Web Tech**: Next.js 16 (App Router, Turbopack), React 19, Vanilla CSS / CSS Modules, Supabase PostgreSQL, Firebase Cloud Messaging (FCM).
- **Mobile Tech**: Flutter 3 (Dart 3), pure-Dart `http` client, `AuthState` singleton state, Firebase Messaging.
- **Design System**: High-contrast Zinc Dark Theme (`#09090b` background, `#18181b` card, `#27272a` border, `#10b981` emerald accent, `#3b82f6` blue accent).

---

## 2. Directory & Architecture Map

```
campus-stitch/
├── docs/                                  # Master Documentation & Guides
│   ├── DEVELOPER_CONTEXT_CHEATSHEET.md   # <--- THIS FILE (Complete Context)
│   ├── ARCHITECTURE.md                    # Multi-tenant and security model
│   ├── API_REFERENCE.md                   # REST API contract for all endpoints
│   ├── DATABASE_SCHEMA.md                 # Supabase PostgreSQL tables & indexes
│   └── CREDENTIALS_AND_RUNBOOK.md         # Demo accounts & local dev commands
├── store_assets/truepane/                 # Google Play Store release assets (1080x2400, 1024x500, 512x512)
├── web/                                   # Next.js 16 Web Application
│   ├── scripts/                           # Sanitized admin & DB maintenance scripts
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/                    # Sign-in, sign-up, forgot-password
│   │   │   ├── admin/                     # /admin (Campus Admin), /admin/super (Super Admin)
│   │   │   ├── api/                       # REST API Routes (Route Handlers)
│   │   │   │   ├── admin/super/           # Super Admin releases & campus assignment
│   │   │   │   ├── app/version/           # Mobile in-app update check
│   │   │   │   ├── auth/                  # sign-in, sign-up, sign-out, otp, check-email
│   │   │   │   ├── commute/               # carpool routes, bookings
│   │   │   │   ├── market/                # hostel marketplace listings
│   │   │   │   ├── profile/               # GET user profile, DELETE account
│   │   │   │   └── verification/          # student ID upload, admin review queue
│   │   │   ├── commute/                   # /commute (rides list), /commute/bike (bike rentals)
│   │   │   ├── market/                    # /market (hostel buy/sell items)
│   │   │   ├── profile/                   # /profile (student identity & account deletion)
│   │   │   ├── delete-account/            # /delete-account (public Google Play deletion portal)
│   │   │   └── community/                 # /community (student campus feed)
│   │   ├── components/                    # AppHeader, MobileShell, NotificationSlider, UI buttons
│   │   └── lib/                           # JWT, Supabase server client, rate-limiter, tenants-store
└── mobile/                                # Flutter 3 Cross-Platform Mobile App
    ├── android/                           # Release keystore, key.properties, Gradle config
    └── lib/
        ├── core/
        │   ├── api/api_constants.dart     # Base URLs and all endpoint paths
        │   ├── api/api_client.dart        # Pure-Dart HTTP client with JWT header injection
        │   ├── state/auth_state.dart      # Global singleton ChangeNotifier for session & user
        │   └── theme/app_theme.dart       # AppColors (zinc, darkCard, success, warning)
        ├── models/                        # UserModel, CommuteModel, MarketItemModel
        ├── screens/
        │   ├── auth/                      # LoginScreen, RegisterScreen, ForgotPasswordScreen
        │   ├── commute/                   # CommuteScreen (rides list & seat booking dialog)
        │   ├── market/                    # MarketScreen (hostel items buy/sell)
        │   ├── messages/                  # MessagesScreen & ChatDetailScreen
        │   ├── profile/                   # ProfileScreen (Identity card, Settings, Account Deletion)
        │   ├── admin/                     # CampusAdminScreen (Student KYC approval)
        │   └── update/                    # InAppUpdateDialog (auto-update modal)
        └── services/                      # AuthService, PushNotificationService, UpdateService
```

---

## 3. How Core Systems Work

### A. Authentication & Session
- **Web**: JWT signed using `JWT_SECRET` (falls back to secure runtime key). Stored in HTTP-only cookie (`auth_token`) + client response payload.
- **Mobile**: JWT stored in-memory in `AuthState.instance.token` and passed as `Authorization: Bearer <token>` in `ApiClient`.
- **Demo Accounts**:
  - `admin@uet.edu.pk` / `AdminPass123!` (Campus Admin)
  - `student@uet.edu.pk` / `StudentPass123!` (Verified Student)
  - `ranahammadismail@gmail.com` / `AdminPass123!` (Super Admin)

### B. Multi-Tenancy Hierarchy
- Every student belongs to a **University** (`university_id`, e.g. `uni_uet_lahore`) and a **Campus Tenant** (`campus_id`, e.g. `camp_uet_main`).
- Campus Admins only see and approve students registered under their assigned `campus_id`.
- Listings, rides, and community feeds are partitioned by `campus_id` so students only see their own campus community.
- `TenantsStore` (`web/src/lib/tenants-store.ts`) manages persistent campus records with fallback to `tenants-cache.json`.

### C. Account Deletion & Data Purge (Google Play & GDPR Compliant)
- **Web API**: `DELETE /api/profile` requires user authentication, purges profile from `profiles`, removes `verifications`, deletes physical card scans, removes FCM push tokens, and clears auth cookies.
- **Web Portal**: `/delete-account` is a public portal protected by mandatory password authentication (preventing unauthorized email griefing).
- **Mobile App**: Profile screen has a dedicated "Account Deletion & Data Purge" card that triggers `AuthState.instance.deleteAccount()` and provides a link to `/delete-account`.

### D. Android Release & Signing
- **Keystore**: `mobile/android/app/upload-keystore.jks` (RSA 2048-bit, valid until 2054).
- **Properties**: `mobile/android/key.properties` (gitignored).
- **Build output**:
  - App Bundle: `mobile/build/app/outputs/bundle/release/app-release.aab`
  - Direct APK: `mobile/build/app/outputs/flutter-apk/app-release.apk`
- **Version Bump**: Increment `version: 1.0.x+N` in `mobile/pubspec.yaml` before every Play Store upload.

---

## 4. Cookbooks: How to Add Features Fast

### Recipe 1: Adding a New Backend REST API Route
1. Create a folder in `web/src/app/api/<feature_name>/route.ts`.
2. Apply OWASP rate limiting from `@/lib/rate-limiter`:
   ```ts
   import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
   const clientIp = getClientIp(request.headers);
   const rateLimit = checkRateLimit(`feature_${clientIp}`, { limit: 10, windowMs: 60000 });
   if (!rateLimit.allowed) return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
   ```
3. Extract JWT user payload if protected:
   ```ts
   import { getJwtUserFromRequest } from "@/lib/jwt";
   const user = await getJwtUserFromRequest(request);
   if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
   ```
4. Query Supabase using `@/lib/supabase/server`:
   ```ts
   import { createClient } from "@/lib/supabase/server";
   const supabase = await createClient();
   const { data, error } = await supabase.from("<table_name>").select("*").eq("campus_id", user.campusId);
   ```

### Recipe 2: Adding a New Screen or Feature in Mobile
1. Add the endpoint constant in [`mobile/lib/core/api/api_constants.dart`](file:///c:/Users/ranah/Desktop/campus-stitch/mobile/lib/core/api/api_constants.dart):
   ```dart
   static const String myFeature = '/api/my-feature';
   ```
2. Create service methods in `mobile/lib/services/` using `ApiClient`:
   ```dart
   final res = await ApiClient.get(ApiConstants.myFeature);
   ```
3. Create your UI screen in `mobile/lib/screens/<category>/` using `AppTheme` colors (`AppColors.zinc900`, `AppColors.darkCard`, `AppColors.white`, `AppColors.success`).
4. Link it into [`mobile/lib/screens/main_navigation_screen.dart`](file:///c:/Users/ranah/Desktop/campus-stitch/mobile/lib/screens/main_navigation_screen.dart) or navigation routes.

### Recipe 3: Adding or Migrating Database Schema
1. Write the clean SQL migration into `web/supabase/schema.sql`.
2. If running scripts directly with Node/Postgres, strictly read `process.env.DATABASE_URL` or load from `.env.local` — **NEVER** hardcode credentials.
3. Test locally with `npm run db:reset` or execute directly in Supabase SQL editor.

---

## 5. Non-Negotiable Coding Rules

1. **NO Hardcoded Credentials**: Never write Postgres passwords, secret keys, or JWT secrets into scripts or source files. Always use `process.env`.
2. **Multi-Tenant Isolation**: Never query cross-campus data without filtering by `campus_id` (except for Super Admin).
3. **Vanilla CSS & Theme Tokens**: On web, do not inject Tailwind utilities unless explicitly requested. Use existing CSS tokens in `globals.css`.
4. **Dart Typing**: Keep Flutter models null-safe and handle network errors gracefully using `ApiClient` return structures.
5. **Git Safety**: Keystores (`*.jks`, `*.keystore`), `key.properties`, and `.env*` files must remain strictly in `.gitignore`.
