# CampuStitch — Project Overview

## 1. Executive Summary
**CampuStitch** is a dedicated student life platform designed for university students, faculty, and campus communities across Pakistan (originating at UET Lahore). 

It unifies daily campus mobility, peer-to-peer student marketplace commerce, hostel living services, campus communities, and an AI campus voice assistant into a unified, mobile-first responsive web application.

---

## 2. Core Pillars & Features

### 🚖 1. Student Commute & Ride Sharing (`/commute`)
- **Carpools & Rickshaw Splits:** Students traveling along common routes offer empty seats or request splits.
- **Fair Fare Splitting:** Built-in cost calculator per seat to eliminate daily campus commuting haggling.
- **Safety & Verification:** Prominently displays the `Verified Student` trust badge for authenticated peers.

### 🚲 2. Campus Bike Rentals (`/bikes`)
- Daily student rentals and bicycle sharing on campus.
- Fixed hourly/daily rates for eco-friendly transit between academic blocks, student hostels, and sport complexes.

### 🛍️ 3. Student Marketplace (`/market`)
- **Peer-to-Peer Trading:** Buy, sell, or rent textbooks, engineering drawing tools, hostel appliances, coolers, and tech gadgets.
- **Graduation & Relocation Clearance:** High-discount item clearing when seniors graduate or change hostels.
- **Direct Image Uploads:** Cloudinary integration with automatic WebP compression.

### 🏢 4. Hostel Services & Living (`/hostel`)
- Community-driven services within student hostels (Hostel Block A, Block B, Zubair Hall, Girls Hostels).
- Laundry requests, room sharing listings, and peer maintenance assistance.

### 👥 5. Reddit-Style Campus Communities (`/community`)
- **Subreddit Architecture:** Organized by campus spaces (e.g., `r/cs-uet`, `r/commute-splits`, `r/hostel-life`, `r/exam-pastpapers`, `r/lost-and-found`).
- **Dynamic Post Pages (`/community/post/[id]`):** Dedicated discussion pages with separate upvote/downvote counters (`[ ↑ {upvotes} | ↓ {downvotes} ]`), verified student badges, image attachments, comment composer, and threaded nested discussions.
- **Independent 3-Column Scroll:** Left subreddit directory, center discussion feed, and right "About Community" widget each scroll independently with zero full-webpage body scroll.
- **Pinned Bottom Navigation:** Mobile users retain constant access to the platform bottom navigation tabs without obscuring feed content.

### 🔔 6. Cart-Style Notification Slide-Over Drawer
- **Quick Slide-Out Access:** Clicking the notification bell in the global header slides out a smooth cart-like drawer from the right edge on web and mobile.
- **Categorized Tabs:** Real-time updates filtered by `All`, `Rides`, `Market`, and `Verification`.
- **Instant Actions:** One-click "Mark read" and direct deep-linking to relevant rides, listings, or community posts.

### 🎙️ 7. AI Student Assistant (`/assistant`) & Voice Messaging (`/messages`)
- **Multilingual Support:** English and Urdu voice query support.
- **Urdu Speech-to-Speech:** Integrated with Uplift AI (Urdu TTS) and Google Gemini with tool calls via the Vercel AI SDK.
- **Voice Notes in Chat:** Resilient HTML5 base64 audio voice note recording and playback with format fallbacks and auto-scrolling message streams.

---

## 3. Two-Phase Student Identity & Verification Framework

### Phase 1: Streamlined Sign-Up (`/sign-up`)
- **Standard Registration:** Full Name, University (searchable across 16 major Pakistani universities), Campus City (clean city names only), System-Fed Department dropdown, Email, and Password.
- **Zero Friction:** No upfront card OCR scanning required, no avatar upload required at sign-up, and no Roll Number or Student ID field requested or stored.
- **Broad Email Acceptance:** Any standard email address (Gmail, Outlook, Yahoo, edu) is accepted, confirmed via an instantaneous 6-digit email OTP.
- **Default Unverified Account:** Newly registered students default to `is_verified = false`, `verification_status = 'unverified'`, and are greeted by an interactive `UnverifiedDialog` modal.

### Phase 2: Binance-Style KYC Verification (`/verify` & `/admin`)
- **Webcam Live Face Capture:** Live video stream with a centered oval face guide frame ensuring an authentic live human selfie.
- **Student ID Card Front Upload:** High-resolution image capture of the applicant's official student ID card front.
- **Manual Admin Inspection (`/admin`):** Side-by-side visual comparison of the applicant's live webcam selfie against their student ID card photo. One-click Approve grants the official `Verified Student` badge; Reject marks as rejected.
- **Universal Trust Badge:** The `<VerificationBadge />` renders across community posts, carpool rides, marketplace listings, and hostel profiles.

---

## 4. Design Philosophy & User Experience
- **Unified Black & White Aesthetic:** High-contrast monochrome palette (`bg-black dark:bg-white text-white dark:text-black`, `border-zinc-300 dark:border-zinc-700`) across all auth pages, dialogs, badges, and verification controls.
- **Full Dark Mode Support:** Theme context with anti-flash script, header toggle, and profile settings switch.
- **No Unnecessary Footers:** The application operates as a clean modern web app without redundant bottom web footers.
- **Mobile-First Responsive Shell:** Optimized for mobile devices (pinned bottom navigation bar) and desktop screens (top navigation bar + independent section scroll containers).
- **Zero Dummy Data Leaks:** Realistic, diverse user data without hardcoded personal names (e.g. `'Muhammad Hammad'`) or fake roll numbers.
