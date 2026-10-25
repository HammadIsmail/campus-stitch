# CampuStitch — Platform Development & Integrity Rules

## 1. Absolute Truth in Data & Honest Empty States (MANDATORY)
- **Never Fabricate Data:** Never fabricate production data, statistics, charts, or user activity. Use actual data sources or honest empty states.
- **Zero Seeding / Mock Data in Production Views:** Our application will NEVER show any seeding, mock, or hardcoded fallback data in production or client-facing views.
- **True Database State Reflection:** When database tables (e.g., `rides`, `bikes`, `listings`, `community_posts`, `communities`, `hostel_roommates`, `hostel_services`, `verifications`) are empty or truncated, the application MUST truthfully display clean, designed empty states (e.g., *"No active rides found"*, *"No listings available"*, *"No posts yet"*).
- **No Invisible LocalStorage Mock Caching:** Client services and storage managers must never silently serve old mock seeds when remote tables are empty. If a database query returns zero records, the local cache must reflect zero records.
- **Never Expose Implementation Details:** Never expose implementation details such as Supabase, PostgreSQL, or multi-tenancy in customer-facing UI unless genuinely necessary.
- **Remove Non-Essential UI Clutter:** Remove every UI element that does not serve a real user need.

---

## 2. Real-World User Focus (Strict AI Confidentiality)
- **NO AI Jargon or Internal Model Names:** Never display internal AI names, LLMs, or developer tech terms (such as "Gemini AI", "LLM", "Vercel AI SDK", "Prompt", etc.) on ANY user-facing page, screen, button, or message.
- All user-facing copy must be clean, natural, and professional (e.g., "Smart Student Verification", "Automatic Verification", "Campus Verification", "Verified Student Card").

---

## 3. Authentication & Credential Rules
- **Password Selection at Sign-Up:** Users set their password during account registration.
- **Password-Based Login:** Users sign in with their registered Email and Password.
- **Strict Email Existence Validations:**
  - **Sign-Up:** If an email is already registered, registration is blocked:
    > *"An account with this email already exists. Please sign in instead."*
  - **Sign-In:** If an email is not found in the system, login is blocked:
    > *"No account found with this email. Please create an account first."*
  - **Invalid Password:** If the password does not match:
    > *"Incorrect password. Please try again."*
- **Email OTP Verification on Sign-Up:** When creating an account, a 6-digit OTP code is dispatched to the student's email. Account creation is finalized only upon entering the valid OTP code on Step 2.

---

## 4. Auth Screens Cleanliness (`/sign-in` & `/sign-up`)
- On the Sign-In (`/sign-in`) and Sign-Up (`/sign-up`) screens:
  - Do NOT show navigation tabs (`Home`, `Commute`, `Marketplace`, `Hostel`, `Community`).
  - Do NOT show the search bar.
  - Do NOT show quick action icons (Messages, Notifications, Profile).
  - Do NOT show the floating microphone button.
- Authentication screens must be focused, clean, and distraction-free with only the brand logo and the registration/login form.

---

## 5. Student Card Upload & Verification Standards
- **2MB Size Limit:** Image uploads (student card and avatar) must strictly not exceed 2MB.
- **WebP Optimization:** Images are converted to WebP format before upload to optimize bandwidth.
- **Clean UI Elements:** Do not show raw, long file names. Show clean status indicators like *"Student Card attached ✓"*.
- **Locked Fields on Step 2:** Data extracted from the university card is displayed in read-only / disabled fields that the user cannot edit.

---

## 6. No Hostel Info Requirement on Registration
- **No Hostel/Residence Collection on Sign-Up:** Do not ask for, display, or require hostel or residence details during student registration or card verification.
- Campus identity verification relies strictly on official university card credentials.
