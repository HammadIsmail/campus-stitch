# CampuStitch - Web Application

> **Live Production**: [https://campus-stitch.vercel.app](https://campus-stitch.vercel.app)  
> **Official Web Repository**: [https://github.com/HammadIsmail/campus-stitch](https://github.com/HammadIsmail/campus-stitch)  
> **Flutter Mobile App Repository**: [https://github.com/HammadIsmail/campus-stitch-mobile-app](https://github.com/HammadIsmail/campus-stitch-mobile-app)  
> **Documentation Hub**: [Master Project Documentation](../docs/README.md)

**CampuStitch** is a verified, multi-tenant university SuperApp built for Pakistani campuses. It connects verified university students for daily rickshaw/carpool commute splits, peer bike rentals, student-to-student marketplace, shared hostel items, and campus communities with native Web & Mobile push notifications.

---

## 🚀 Key Features

### 1. 🚗 Hyperlocal Commute & Carpooling (`/commute`)
- **Rickshaw Cost Splits:** Fixed daily routes (e.g. Khurrianwala ⇄ UET Lahore) splitting fares evenly among students.
- **Fair-Share Splitter:** Dynamic fare-per-person recalculation when seats fill or free up.
- **Bike & Cycle Rentals:** Peer-to-peer bike rentals with student ID verification and deposit escrow rules.
- **Post a Ride Offer (`/commute/offer`):** Instant ride offering with seats, departure time, and fair pricing.

### 2. 🛍️ Student Marketplace & Co-Ownership (`/market`)
- **Verified Peer Market:** Textbooks, lab coats, electronics, coolers, and hostel furniture.
- **Post Items for Sale (`/market/sell`):** Upload photos, select conditions, and categorize gear.
- **Graduation Pass-Out Bundles:** Seniors can bundle full hostel room inventory for incoming juniors.

### 3. 🏢 Hostel Hub (`/hostel`)
- **Roommate Vacancy Finder:** Listings for shared rooms, AC attachments, and hostel vacancies across campus blocks.
- **Offer Student Services (`/hostel/offer`):** Student-run services (laundry pickup, cooler repair, past paper printout delivery).

### 4. 👥 Reddit-Style Campus Community (`/community`)
- **3-Item Initial Load & Infinite Scroll:** Initial load fetches exactly 3 posts and 3 communities for maximum page speed.
- **Automatic Feed Pagination:** `IntersectionObserver` triggers seamless background fetching of 3-post batches.
- **React 19 Optimistic Voting:** Instant 0ms upvote/downvote transitions with automated rollback on network drop.
- **Scoped Subreddits:** Multi-campus isolation (`r/general`, `r/exams`, `r/commute-splits`, `r/cs-uet`).

### 5. 🔔 Firebase Push Notifications (`/api/notifications/*`)
- **Web Push Service Worker (`public/firebase-messaging-sw.js`):** Receives background notifications even when the browser tab is closed.
- **Firebase Admin Multicast (`src/lib/firebase/admin.ts`):** Automatically dispatches alerts to student devices.
- **Device Token Store (`user_push_tokens`):** Supabase table managing active tokens for Web, Android, and iOS.

### 6. 🛡️ Multi-Tenant Institutional Governance
- **Super Admin Console (`/admin/super`):** Create universities, manage campuses, and delegate/revoke campus admins.
- **Campus Admin Console (`/admin`):** Side-by-side student ID card vs. live webcam selfie review queue with one-click approve/reject.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16.3](https://nextjs.org/) (App Router + Turbopack)
- **Library:** [React 19](https://react.dev/) (`useActionState`, `useOptimistic`, `useTransition`, `useFormStatus`)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 with bespoke Dark/Light theme mode tokens
- **Database & Auth:** [Supabase](https://supabase.com/) PostgreSQL with Row-Level Security (RLS)
- **Push Notifications:** [Firebase Cloud Messaging (FCM)](https://firebase.google.com/docs/cloud-messaging) + Firebase Admin SDK
- **Email & OTP:** Nodemailer (Gmail SMTP) with 6-digit cryptographic verification
- **Icons:** Lucide React

---

## 🏃 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/HammadIsmail/campus-stitch.git
cd campus-stitch/web
npm install
```

### 2. Configure Environment Variables
Create `.env.local` in the `web/` directory:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-supabase.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
DATABASE_URL="postgresql://postgres:...@...pooler.supabase.com:6543/postgres"

# Firebase Web Client (Notifications)
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="campus-stitch.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="campus-stitch"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="campus-stitch.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="551202613453"
NEXT_PUBLIC_FIREBASE_APP_ID="1:551202613453:web:..."
NEXT_PUBLIC_FIREBASE_VAPID_KEY="..."

# Firebase Admin Service Account (Server-side)
FIREBASE_PROJECT_ID="campus-stitch"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@campus-stitch.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build & Validate
```bash
npx tsc --noEmit    # Validates TypeScript types (0 errors)
npm run build       # Production bundle build
```

---

## 📱 Cross-Platform Ecosystem
This web application works in concert with the **Flutter Mobile App**:
- Repository: [https://github.com/HammadIsmail/campus-stitch-mobile-app](https://github.com/HammadIsmail/campus-stitch-mobile-app)
- API Reference: [docs/API_REFERENCE.md](../docs/API_REFERENCE.md)
- Database Schema: [docs/DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md)
