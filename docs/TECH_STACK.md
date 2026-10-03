# TECH_STACK.md — CampuStitch

Decision principle: **buy/use prebuilt, don't custom-build.** One vendor per job, as few vendors as possible.

## 1. Stack at a glance

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js** (App Router) + **TypeScript** | Web-first, installable **PWA**, mobile-first UI |
| UI | **Tailwind CSS** + **shadcn/ui** + **lucide-react** | Tokens in `DESIGN_GUIDE.md`; font **Figtree** (next/font) |
| Forms/validation | **react-hook-form** + **Zod** | Same Zod schemas on server |
| Database | **PostgreSQL on Supabase** | Migrations via Supabase CLI |
| Data access | **supabase-js** + generated types | RLS enforced; no second ORM |
| Auth | **Supabase Auth** | Email **code (OTP)**  |
| Authorization | **Postgres RLS** + `profiles.verification_status` | Unverified users see only the verification flow |
| Realtime/chat | **Supabase Realtime** | `messages` table, contextual conversations |
| Background jobs | **pg_cron** (schedules) + **pgmq** (queues, retries) + **pg_net** (HTTP calls) | Heavy work runs in Next.js route handlers, not inside Postgres |
| Images | **Cloudinary** | Client converts to **WebP** before upload; signed uploads; `authenticated` type for card photos |
| Card recognition | **Gemini API** via **Vercel AI SDK** | Structured output with Zod schema |
| Student Assistant | **Vercel AI SDK** (`ai`, `@ai-sdk/google`) + **Gemini** | Typed tools, streaming |
| Urdu voice | **Uplift AI** (Scribe STT + TTS) | Push-to-talk, behind `lib/voice/uplift.ts` adapter |
| Email (auth mails) | **Resend** via Supabase custom SMTP | Supabase's default SMTP is heavily rate-limited — set custom SMTP before real users |
| Hosting | **Vercel** (app) + **Supabase** (backend) | |
| Analytics | **PostHog** | Funnels for PRD metrics |
| Errors | **Sentry** | |
| LLM observability | **Langfuse** (optional, phase 4+) | Trace tool calls |
| Rate limiting | **Upstash Ratelimit** (optional) | Protect `/api/agent`, `/api/voice`, `/api/verification/card` |
| Tests | **Vitest** (unit), **Playwright** (a few e2e) | |
| Package manager | **pnpm** | |

## 2. Why these choices (short)

- **Supabase** gives Postgres + Auth + Realtime + Storage-rules + cron in one place, so we do not integrate five vendors. RLS is how we enforce "closed, verified university community" at the database level.
- **Vercel AI SDK**: model-agnostic (Gemini now, swap later), typed tools with Zod, streaming for chat. One framework for card OCR and the agent.
- **Cloudinary**: resizing/optimization/CDN without writing an image pipeline. Private `authenticated` delivery for student cards.
- **Uplift AI**: Urdu-specific STT and TTS. Treat as replaceable behind an adapter.

## 3. Images: WebP and Cloudinary rules

- **Client-side before upload**: resize + convert to WebP using canvas (`canvas.toBlob('image/webp', q)`) or a small lib (`browser-image-compression`).
  - Listing / bike / lost-found photos: max **1080px** long edge, WebP quality **0.8**.
  - Student card: max **1600px** long edge, WebP quality **0.85** (do not go lower — OCR needs legibility). Test OCR accuracy on real cards before locking these numbers.
  - **Fallback:** some browsers cannot encode WebP from canvas. If `toBlob('image/webp')` returns another type, upload the JPEG as-is; Cloudinary handles delivery.
- **Delivery**: always use Cloudinary transformations `f_auto,q_auto,w_<size>` for display (WebP/AVIF automatically). Never serve originals in lists.
- **Uploads**
  - Listing/bike/lost-found photos: **signed direct upload** from the browser. The server route `/api/uploads/sign` returns signature + params (user must be verified; folder is `campustitch/{university_slug}/{kind}`; limit file size/format; limit count per user per day).
  - Student card: client sends the file to **`POST /api/verification/card`** (not directly to Cloudinary). The server sends bytes to Gemini and uploads to Cloudinary as `type: "authenticated"`. See `VERIFICATION.md`.
- **Deletion**: when a listing is removed, delete its Cloudinary assets via Admin API from a job. Card images are deleted after the verification decision (`invalidate: true`).
- **Free-plan limits** change; check the current Cloudinary plan before launch. Cloudinary meters in "credits" (storage + transformations + bandwidth), so keep transformations consistent to reuse the CDN cache.

## 4. Packages (install, then check current docs for each)

```
next react react-dom typescript tailwindcss
shadcn/ui (CLI) lucide-react class-variance-authority clsx tailwind-merge
@supabase/supabase-js @supabase/ssr
zod react-hook-form @hookform/resolvers
ai @ai-sdk/google
cloudinary next-cloudinary(optional) browser-image-compression
posthog-js posthog-node @sentry/nextjs
@upstash/ratelimit @upstash/redis (optional)
vitest @playwright/test eslint prettier
serwist (or next-pwa alternative) for PWA
```

## 5. Environment variables (`.env.example`)

```
# App
NEXT_PUBLIC_APP_URL=
APP_TIMEZONE=Asia/Karachi

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=            # server only
JOBS_SHARED_SECRET=                   # pg_net -> /api/jobs/* auth

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=                # server only
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# Gemini
GOOGLE_GENERATIVE_AI_API_KEY=
GEMINI_MODEL_AGENT=                   # a fast "flash"-tier model; check current names
GEMINI_MODEL_OCR=                     # same or stronger vision model

# Uplift AI
UPLIFT_API_KEY=
UPLIFT_STT_MODEL=                     # e.g. scribe / scribe-mini (check docs)
UPLIFT_TTS_VOICE_ID=                  # pick from Uplift voices

# Observability / limits
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
SENTRY_DSN=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
```

Model names, Uplift endpoints, and SDK method names change over time. Keep model IDs in env vars, and verify API details in each vendor's current docs.

## 6. Accounts the owner must create

1. Supabase project (enable extensions: `pg_cron`, `pgmq`, `pg_net`, `pg_trgm`, `pgcrypto`)
2. Vercel project (connect repo)
3. Cloudinary account
4. Google AI Studio API key (Gemini)
5. Uplift AI API key (`https://upliftai.org/app/studio`, docs at `https://docs.upliftai.org`)
6. Resend account (custom SMTP for Supabase Auth emails)
7. PostHog, Sentry (free tiers)

## 7. Known risks to plan around

- **Supabase free projects pause after inactivity** — upgrade the plan before real users.
- **Supabase default email sender is rate-limited** — configure Resend SMTP early; email OTP is the only login method.
- **Uplift STT works on speech segments**, not true streaming — expect latency; use push-to-talk.
- **Spoken Urdu is transcribed in Urdu script**, not Roman Urdu; the agent must handle Urdu script, Roman Urdu, and English (and mixes).
- **WebP encoding support differs per browser** — implement the fallback above.

## 8. Explicitly deferred (do not build in MVP)

Payments (students pay each other in cash/JazzCash/Easypaisa; the app never holds money), maps (use a `places` table with named stops), native mobile apps, WhatsApp notifications, multi-university UI beyond data separation, reputation/reviews.
