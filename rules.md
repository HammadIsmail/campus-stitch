# CampuStitch — Platform Development & Design Rules

## 1. Real-World User Focus (Strict AI Confidentiality)
- **NO AI Jargon or Internal Model Names:** Never display internal AI names, LLMs, or developer tech terms (such as "Gemini AI", "LLM", "Vercel AI SDK", "Prompt", etc.) on ANY user-facing page, screen, button, or message.
- This application is built for real-world UET Lahore students, faculty, and campus residents.
- All user-facing copy must be clean, natural, and professional (e.g., "Smart Student Verification", "Automatic Verification", "Campus Verification", "Verified Student Card").

---

## 2. Authentication & Credential Rules
- **Password Selection at Sign-Up:** Users set their password during account registration.
- **Password-Based Login:** Users sign in with their registered Email and Password.
- **Strict Email Existence Validations:**
  - **Sign-Up:** If an email is already registered, registration is blocked with the error message:
    > *"An account with this email already exists. Please sign in instead."*
  - **Sign-In:** If an email is not found in the system, login is blocked with the error message:
    > *"No account found with this email. Please create an account first."*
  - **Invalid Password:** If the password does not match, show:
    > *"Incorrect password. Please try again."*

---

## 3. Auth Screens Cleanliness (`/sign-in` & `/sign-up`)
- On the Sign-In (`/sign-in`) and Sign-Up (`/sign-up`) screens:
  - **Do NOT show navigation tabs** (`Home`, `Commute`, `Marketplace`, `Hostel`, `Community`).
  - **Do NOT show the search bar** (`Ask Student AI...`).
  - **Do NOT show quick action icons** (Messages, Notifications, Profile).
  - **Do NOT show the floating microphone button**.
- The authentication screens must be focused, clean, and distraction-free with only the brand logo and the registration/login form.

---

## 4. Student Card Upload & Verification Standards
- **2MB Size Limit:** Image uploads (student card and avatar) must strictly not exceed 2MB.
- **WebP Optimization:** Images are converted to WebP format before upload to optimize bandwidth.
- **Clean UI Elements:** Do not show raw, long file names (e.g. WhatsApp export names) that cause visual text wrapping/overlapping. Show clean status indicators like *"Student Card attached ✓"*.
- **Locked Fields on Step 2:** Data extracted from the university card (Name, Roll Number, University, Department, Program, CNIC, Expiry Date) is displayed in read-only / disabled fields that the user cannot edit.

---

## 5. No Hostel Info Requirement
- **No Hostel/Residence Collection on Sign-Up:** Do not ask for, display, or require hostel or residence details during student registration or card verification.
- Campus identity verification relies strictly on official university card credentials.

