# CampuStitch — Project Overview

## 1. Executive Summary
**CampuStitch** is a dedicated student life platform designed specifically for the students, faculty, and resident community of **UET Lahore** (University of Engineering and Technology, Lahore). 

It unifies daily campus mobility, student-to-student commerce, hostel living services, student societies, and an AI campus voice assistant into a unified, mobile-first responsive web application.

---

## 2. Core Pillars & Features

### 🚖 1. Student Commute & Ride Sharing (`/commute`)
- **Carpools & Rickshaw Splits:** Students traveling along common routes (e.g., UET Main Campus to Wapda Town, Gulberg, Johar Town, DHA) can offer empty seats or request splits.
- **Fair Fare Splitting:** Built-in cost calculator per seat to eliminate daily campus commuting haggling.
- **Safety & Verification:** Verified student roll numbers and campus ID verification ensure ride-sharing is restricted to authenticated university peers.

### 🚲 2. Campus Bike Rentals (`/bikes`)
- Daily student rentals and bicycle sharing on campus.
- Fixed hourly/daily rates for eco-friendly transit between academic blocks, student hostels, and sport complexes.

### 🛍️ 3. Student Marketplace (`/market`)
- **Peer-to-Peer Trading:** Buy, sell, or rent textbooks, engineering drawing tools, hostel appliances, coolers, and tech gadgets.
- **Graduation & Hostel Relocation Deals:** High-discount item clearing when seniors graduate or change hostels.
- **Direct Image Uploads:** Cloudinary integration with automatic WebP compression.

### 🏢 4. Hostel Services & Living (`/hostel`)
- Community-driven services within student hostels (Hostel Block A, Block B, Zubair Hall, Girls Hostels).
- Laundry requests, room sharing listings, and peer maintenance assistance.

### 👥 5. Verified Campus Network (`/community`)
- Official campus societies, study groups, department circles, and hobby clubs.
- Moderated announcements and student group discovery.

### 🎙️ 6. AI Student Assistant (`/assistant`)
- **Multilingual Support:** English and Urdu voice query support.
- **Urdu Speech-to-Speech:** Integrated with Uplift AI (Urdu TTS) and Google Gemini via the Vercel AI SDK.
- **Voice Interactions:** Floating microphone trigger in bottom-right corner for hands-free campus inquiries.

---

## 3. Design Philosophy & User Experience
- **Monochrome Elegance:** Strictly curated black, zinc, and white palette (`#000000`, `#18181B`, `#FFFFFF`, `#F4F4F5`, `#ECEEF2`). No generic or conflicting bright colors.
- **Mobile-First Responsive Shell:** Optimized for both mobile devices (bottom navigation bar) and desktop screens (top navigation bar + centered mobile preview container).
- **Zero Dummy Data in Production:** All listings, rides, and services connect directly to persistent database tables.
