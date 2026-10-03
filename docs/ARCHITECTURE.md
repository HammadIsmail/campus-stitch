# ARCHITECTURE.md — CampuStitch

## 1. System overview

```
Browser (Next.js PWA, mobile-first)
   │  supabase-js (user JWT)            fetch
   ├────────────────────────► Supabase ◄───────────┐
   │                          • Auth (email OTP)   │
   │                          • Postgres + RLS     │ pg_cron / pg_net
   │                          • Realtime (chat)    │
   │                                               │
   └─► Next.js server (Vercel) ────────────────────┘
        • Server Components / Server Actions (CRUD as the user)
        • Route handlers:
            /api/verification/card   → Gemini (vision) + Cloudinary (authenticated)
            /api/uploads/sign        → signs Cloudinary uploads
            /api/agent               → Vercel AI SDK + Gemini + tools
            /api/voice               → Uplift STT → agent → Uplift TTS
            /api/jobs/*              → called by pg_net (shared secret)
        • Admin area /admin (role-gated)
```

Key rule: **the database is the authority.** RLS enforces university isolation and verification; atomic operations are Postgres functions.

## 2. Folder structure

```
/
├─ AGENTS.md
├─ docs/                       # PRD, journeys, and the specs in this folder
├─ supabase/
│  ├─ migrations/              # all schema, RLS, functions, cron jobs
│  ├─ seed.sql                 # university, places, sample communities
│  └─ tests/                   # RLS/function tests (pgTAP or SQL scripts)
├─ src/
│  ├─ app/
│  │  ├─ (public)/             # landing, sign-in (email code)
│  │  ├─ (onboarding)/verify/  # card upload → confirm → status
│  │  ├─ (app)/                # authenticated + verified shell with bottom nav
│  │  │  ├─ page.tsx           # Home
│  │  │  ├─ commute/           # rides, ride detail, create ride, bikes, bike detail
│  │  │  ├─ market/            # listings, detail, create, shared items, graduation sale
│  │  │  ├─ hostel/            # roommates, services, hostel marketplace, lost & found
│  │  │  ├─ community/         # communities, events, help requests
│  │  │  ├─ assistant/         # text + voice assistant
│  │  │  ├─ messages/          # conversations (contextual)
│  │  │  ├─ notifications/
│  │  │  └─ profile/
│  │  ├─ admin/                # verification queue, reports, listings, users
│  │  └─ api/                  # see §1
│  ├─ components/ui/           # shadcn
│  ├─ components/              # feature components (RideCard, ListingCard, VerifiedBadge…)
│  ├─ lib/
│  │  ├─ supabase/{server,client,admin}.ts
│  │  ├─ ai/{models,prompts,tools,pending-actions,language}.ts
│  │  ├─ voice/uplift.ts       # STT/TTS adapter (only place that knows Uplift's API)
│  │  ├─ images/{to-webp,cloudinary}.ts
│  │  ├─ places/resolve.ts     # alias/trigram place matching
│  │  ├─ verification/{schema,decide}.ts
│  │  └─ money.ts, dates.ts, ratelimit.ts
│  └─ types/database.ts        # generated
└─ .env.example
```

## 3. Auth and gating

1. Sign-in: email → 6-digit code (Supabase `signInWithOtp` / `verifyOtp`). Optional Google. Use `@supabase/ssr` cookies; refresh session in `middleware.ts`.
2. After first sign-in, a `profiles` row is created (trigger on `auth.users`) with `verification_status = 'unverified'`.
3. `middleware.ts` routing:
   - Not signed in → `/sign-in` (except public routes)
   - Signed in, status `unverified | rejected | needs_reupload` → `/verify`
   - Status `pending` → `/verify/status` (read-only "under review")
   - Status `approved` → app shell
   - Status `expired` → `/verify` with "re-verify your card" message
   - `/admin/*` requires `role in ('university_admin','platform_admin')`
4. **Middleware is convenience; RLS is security.** Every table policy also requires `is_verified()` and matching `university_id`.

## 4. Key flows

### 4.1 Student verification
`/verify` (upload) → client converts to WebP → `POST /api/verification/card` → Gemini extracts structured fields → server stores image in Cloudinary (authenticated) + `student_verifications` row (status `pending`, extracted fields, per-field confidence) → client shows extracted fields for correction → `POST /api/verification/confirm` saves the student's corrected values and runs the decision rules (`VERIFICATION.md`) → status `pending` (manual review) or `approved` → notification. Full spec in `VERIFICATION.md`.

### 4.2 Join a ride (UI)
Ride detail → "Request seat" → server action → RPC `book_ride(ride_id, 'ui')` (atomic: lock ride row, check seats/verification/duplicates, insert booking) → conversation auto-created (context = ride) → notification to organizer → "Ride added to My rides".

### 4.3 Student Assistant (text)
`POST /api/agent` (messages, session id) → build tools bound to the signed-in user → `streamText` (Gemini) with step limit → read tools run immediately; write tools create a **pending action** and return a summary → UI shows a confirm card → Confirm button calls `POST /api/agent/confirm` (or the model calls `confirm_pending_action` per the voice policy). Spec in `AGENT_VOICE.md`.

### 4.4 Voice
Push-to-talk → `MediaRecorder` audio → `POST /api/voice` → Uplift STT → same agent function as text → reply text → Uplift TTS → audio + transcript returned. Spec in `AGENT_VOICE.md`.

### 4.5 Messaging
Conversations are always **contextual** (listing, ride, bike rental, roommate post, service, community). Created automatically on "Message seller", "Request seat", etc. Realtime via Supabase channel subscription on `messages` filtered by `conversation_id`. RLS: only participants can read/write.

### 4.6 Notifications
Rows in `notifications` with a `deeplink` (e.g. `/commute/rides/<id>`). Tapping opens the target screen directly (no home detour). Web push (OneSignal) is phase 2.

### 4.7 Background jobs
- `pg_cron` runs SQL jobs (see `DATABASE.md` §8): expire pending agent actions, expire verifications, create reminders, close past rides/events, mark stale requests.
- For work needing external calls (push, Cloudinary deletion), a cron job enqueues into `pgmq` or calls `/api/jobs/<name>` via `pg_net` with `Authorization: Bearer $JOBS_SHARED_SECRET`. Handlers must be **idempotent**.

## 5. Search
- Structured search per module using Postgres filters + `pg_trgm` / full-text.
- Global search/assistant box: if the text looks natural-language, send to the agent (`search_*` tools infer the pillar); otherwise run a quick keyword search across rides, bikes, listings, roommate posts, services, events.
- Place names resolve through `places` (aliases + trigram), never raw string compare.

## 6. Error, loading, empty states
Each list/detail page has skeleton loading, empty state with a clear next action ("Offer a ride"), and an error state with retry. Server actions return typed `{ ok, error }` results; do not throw to the UI for expected failures (seat full, already booked, unverified).

## 7. Security model summary
- University isolation + verification in RLS (`current_university_id()`, `is_verified()`).
- Service-role key only in server-only modules, only for: admin actions, jobs, verification image handling.
- Agent tools run with the user's JWT (user-scoped Supabase client), so RLS applies to the agent too.
- Rate limit `/api/agent`, `/api/voice`, `/api/verification/card`, `/api/uploads/sign`.
- Report flow on every entity (user, listing, message, community, event, ride, service) → `reports` table → admin queue.
- Privacy: other students see name, avatar, program/batch (optional), and a verified badge only.

## 8. Observability
- PostHog events: `verification_started/completed`, `ride_created/joined`, `listing_created/viewed`, `bike_requested`, `assistant_query`, `assistant_action_confirmed`, `voice_used`.
- Sentry for errors. Langfuse (optional) for agent traces.
- `agent_tool_calls` table for audit of every tool call (tool, args summary, status, latency) — no sensitive payloads.

## 9. Environments
`local` (Supabase CLI) → `preview` (Vercel preview + Supabase branch/dev project) → `production`. Never test against production data.
