# campus-stitch

> **A verified, hyperlocal student platform for UET Lahore** connecting students for daily commutes, bike rentals, peer marketplace, shared ownership, hostel living, and campus community with multilingual voice AI assistance.

---

## 🚀 Key Features & Pillars

### 1. 🚗 Student Commute & Carpooling
- **Rickshaw Cost Splits:** Fixed daily routes (e.g. Khurrialwala ⇄ UET Lahore) splitting fares evenly among verified students.
- **Fair-Share Calculator:** Automatic calculation as students join or leave seats.
- **Bike Rentals:** Peer-to-peer motorcycle and bicycle rentals between classes with daily rates and deposit tracking.

### 2. 🛍️ Student Marketplace & Co-Ownership
- **Verified Peer Market:** Textbooks, lab coats, electronics, coolers, and hostel furniture sold directly student-to-student.
- **Shared Ownership:** Group co-ownership of expensive hostel items (refrigerators, desert coolers). Auto-calculates fair payouts and resale shares when roommates graduate.
- **Graduation Pass-Out Bundles:** Seniors can group room items into single bundles for juniors with real-time status toggles.

### 3. 🏢 Hostel Hub
- **Roommate Finder:** Listings for shared rooms, AC attachments, and hostel vacancies across university blocks.
- **Student Services:** Door-to-door hostel services (laundry pickup, electrical repairs, past-paper printing deliveries).

### 4. 👥 Campus Community & Safety
- **Official Societies & Study Groups:** Event schedules, society workshops, and batch networks.
- **Student Help Board:** Hyperlocal campus Q&A for academic questions, lost calculators, and study materials.
- **Institutional Verification:** Student ID card verification system with AI optical checks and moderation queues.

### 5. 🎙️ AI & Voice Assistance
- **Urdu & English Voice AI:** Speech-to-text powered voice assistant capable of parsing student queries in natural Urdu and Roman Urdu.
- **Agentic Tool Calling:** Powered by Vercel AI SDK and Google Gemini for dynamic ride searching, seat booking, and item lookups.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Radix UI primitives with a classic unified monochrome aesthetic
- **Database & Auth:** [Supabase](https://supabase.com/) PostgreSQL with RLS and realtime subscriptions
- **AI & LLM:** Vercel AI SDK (`ai`), `@ai-sdk/google` (Google Gemini)
- **Voice STT:** Uplift Urdu Voice AI / Web Speech API
- **Icons:** Lucide React

---

## 🏃 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/HammadIsmail/campus-stitch.git
cd campus-stitch
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:...@...pooler.supabase.com:6543/postgres
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key
GEMINI_API_KEY=your-gemini-key
UPLIFT_API_KEY=your-uplift-key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Mobile-First PWA Experience
Designed specifically for mobile devices with pinned bottom navigation tabs, quick Urdu voice button, and responsive desktop layout.
