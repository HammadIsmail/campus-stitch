# BUILD_PLAN.md — CampuStitch

Work **one phase at a time**. Do not start the next phase until the current one's acceptance criteria pass. Each phase ends with: lint + typecheck + tests green, RLS tests green, a short summary of manual steps for the owner.

PRD priority loops: **Mobility → Marketplace → Vehicle sharing → Community**. The assistant and voice come after the core loops work without AI.

---

## Phase 0 — Foundations
**Tasks**
- Create Next.js (App Router, TS) project with pnpm, Tailwind, shadcn/ui, lucide, Figtree, ESLint/Prettier, Vitest, Playwright.
- Supabase CLI setup (`supabase init`, local stack), env files, `.env.example`.
- `lib/supabase/{server,client,admin}.ts` using `@supabase/ssr`; `middleware.ts` skeleton.
- Base layout: mobile shell, top bar, bottom nav (Home, Commute, Market, Hostel, Community), design tokens from `DESIGN_GUIDE.md`.
- Core components: VerifiedBadge, Avatar, StatusChip, FilterChips, SegmentedControl, FormField, StickyActionBar, Skeleton/Empty/Error.
- PostHog + Sentry wiring (env-gated).
**Acceptance**: app runs locally; shell renders at 390px and desktop column; CI script runs lint/typecheck/test.

## Phase 1 — Auth, tenancy, verification
**Tasks**
- Migration: extensions, enums, `universities`, `profiles` (+ trigger on `auth.users`), `student_verifications`, `blocked_student_ids`, helper functions (`current_university_id`, `is_verified`, `is_admin`), RLS for these tables, seed UET Lahore.
- Email-code sign-in (`/sign-in`), session middleware, gating per `ARCHITECTURE.md` §3.
- Verification flow per `VERIFICATION.md`: university select, client WebP conversion (with JPEG fallback), `POST /api/verification/card` (Gemini structured extraction + Cloudinary authenticated upload), confirm screen, `decide.ts` with unit tests, status screens, profile setup.
- Minimal `/admin/verification` (queue, signed-URL image viewer, approve/reject/re-upload), audit log, image-deletion job endpoint.
- Rate limiting on upload endpoints.
**Acceptance**
- A new email can sign up, upload a card, confirm details, and end up `pending`; admin approves; user reaches Home.
- Duplicate card on a second account is blocked.
- Unverified user cannot read any tenant table (RLS test).
- Card image is deleted after decision; no card URL is ever returned to the client.
- `AUTO_APPROVE_ENABLED=false` by default.

## Phase 2 — Commute (Move)
**Tasks**
- Migration: `places` (+ aliases, trigram, `resolve_place`), `rides`, `ride_bookings`, RPCs `book_ride`, `cancel_booking`, RLS, seed places.
- Screens: Commute (find ride), Ride details, Offer a ride, My rides, rickshaw cost split display.
- Notifications table + in-app notifications screen with deep links; contextual conversation auto-created on join.
- pg_cron: `complete_past_rides`, `ride_reminders`.
**Acceptance**
- Two students can match on Khurrialwala → University; the second booking beyond capacity fails with `RIDE_FULL`; concurrent booking test proves no overbooking.
- Joining creates a notification for the organizer and a linked conversation.
- Cost split shows "Rs. 200 ÷ 4 = Rs. 50".

## Phase 3 — Market (Trade)
**Tasks**
- Migration: `listings`, `offers`, `graduation_sales`, `shared_items`, `shared_item_owners`, `shared_item_sales`, `shared_item_sale_shares`, `record_shared_item_sale` RPC, RLS.
- Cloudinary signed uploads (`/api/uploads/sign`) + client WebP conversion + image components with `f_auto,q_auto`.
- Screens: Market (search + filters), Listing details, Sell something (target < 1 minute), Make offer, Message seller, Shared item, Graduation sale dashboard.
**Acceptance**
- Listing creation with photos works and photos are WebP/AVIF delivered via Cloudinary.
- Shared-item sale split matches the PRD example (Rs. 2,000 → Rs. 500 × 4) and handles remainders (unit tests).
- Graduation sale shows item statuses and total sold.

## Phase 4 — Bikes (vehicle sharing)
**Tasks**
- Migration: `bikes`, `bike_rentals` (overlap exclusion constraint), RPCs `request_bike`, `respond_bike_rental`, RLS.
- Screens: Bikes tab in Commute, Bike details, List a bike, owner approval, conversation linked to rental.
**Acceptance**: overlapping approved rentals are impossible; owner receives request + notification; renter sees status.

## Phase 5 — Messaging and notifications polish
**Tasks**: `conversations`, `participants`, `messages` with Supabase Realtime; Messages screens; unread counts; report flow (`reports`) on every entity; admin `/admin/reports`.
**Acceptance**: realtime message delivery between two users; non-participants cannot read; reports reach the admin queue.

## Phase 6 — Student Assistant (text)
**Tasks**
- `agent_pending_actions`, `agent_tool_calls`, `confirm_pending_action` RPC.
- `/api/agent` with Vercel AI SDK + Gemini, tools per `AGENT_VOICE.md` (search tools first, then prepare tools), ConfirmCard UI, global search box routing.
- Eval set + runner (`tests/agent-evals.json`) with ≥ 30 cases.
- Langfuse (optional), rate limiting.
**Acceptance**
- "I need a bike tomorrow from 8 to 4 under Rs. 400" returns matching bikes and prepares (not executes) a request; the Confirm button executes it.
- Agent cannot book without a pending action; prompt-injection eval cases pass.
- All evals pass or failures are documented.

## Phase 7 — Urdu voice
**Tasks**
- `lib/voice/uplift.ts` per Uplift docs (STT + TTS), `/api/voice`, mic UI states, audio playback, transcript display, permission/error states.
- Voice-confirm policy (book ride/join/register by spoken command; money actions require tap).
- Place aliases improved from real test utterances.
**Acceptance (demo script)**
1. Student says: "kia koi khurrialwala ja raha hai" → transcript shown, Urdu spoken reply, ride cards.
2. Student says: "ok meri ride book kr do is k sath" → ride booked via the RPC, "Ride booked" card shown, `booking_source = agent_voice`, organizer notified.
3. A purchase request by voice does **not** execute without tapping Confirm.
- Test with ≥ 20 recorded real-world utterances (accents/noise) and record the STT accuracy in `docs/VOICE_TEST_LOG.md`.

## Phase 8 — Hostel (Live) and Community (Connect)
**Tasks**: `roommate_posts`, `services`, `lost_found`, `communities`, `community_members`, `events`, `event_registrations`, `help_requests` + RLS; screens for Hostel and Community; event reminders (pg_cron); organizer role can create events.
**Acceptance**: a student can find roommate posts by budget/area, register for an event and get a reminder, join a community; organizers manage their community events.

## Phase 9 — Admin, hardening, launch
**Tasks**
- Admin: listings moderation, users (suspend), university config; basic analytics via PostHog dashboards.
- PWA (manifest, icons, offline page), web push (OneSignal) optional.
- Security review: RLS audit, service-role usage audit, rate limits, input validation, secrets, logging hygiene.
- Performance: image sizes, list pagination, indexes.
- Supabase paid plan + custom SMTP (Resend) before real users; backups enabled.
- Turn on `AUTO_APPROVE_ENABLED` only after manual review data supports it.
**Acceptance**: checklist in `AGENTS.md` "Definition of done" passes for all screens; a fresh-device walkthrough (sign-up → verify → book ride → list item → ask assistant) works on a mid-range Android phone.

---

## Cross-cutting test checklist (run every phase)
- RLS: other-university user, unverified user, anonymous, owner.
- Concurrency: simultaneous booking attempts.
- Mobile: 360×640, 390×844, desktop column.
- Accessibility: keyboard + screen-reader labels on new screens.
- Error states: offline, API failure, empty lists.

## Out of scope (do not build)
Payments, maps/routing, native apps, WhatsApp notifications, reputation/reviews, multi-university UI, social feed, LMS/academic features.

## Owner's manual checklist (the owner does these, the IDE agent can't)
1. Create the accounts listed in `TECH_STACK.md` §6 and fill `.env`.
2. Enable Supabase extensions and custom SMTP.
3. Provide real card samples (blurred as needed) to tune extraction; provide the real `card_rules` per university.
4. Provide the list of campus places/areas with common spelling variants (Roman + Urdu).
5. Provide Uplift AI key and choose the TTS voice.
6. Export the Design canvas screenshots into `docs/design/`.
