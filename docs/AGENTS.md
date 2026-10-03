# AGENTS.md — CampuStitch

Rules for any AI coding agent working in this repository. Read this file fully before every task.

## What this project is

CampuStitch is a **mobile-first, verified, university-only web app** (Next.js PWA) for student life outside formal academics. Initial market: Pakistani universities, first campus UET Lahore. Students verify with a student-card photo, then use four areas:

| Tab label | Internal pillar | What it covers |
|---|---|---|
| Commute | Move | Rickshaw cost sharing, rides, bike rental |
| Market | Trade | Buy/sell/rent, shared ownership, graduation sale |
| Hostel | Live | Roommates, services, hostel marketplace, lost & found |
| Community | Connect | Societies, clubs, events, student help |

Plus a **Student Assistant** (agentic AI, text + Urdu voice) available everywhere.

## Read these first (in `docs/`)

1. `PRD.md` — product requirements (given by the owner)
2. `USER_JOURNEYS.md` — flows and UX rules (given by the owner)
3. `TECH_STACK.md` — exact libraries, services, env vars
4. `ARCHITECTURE.md` — structure, request flows, security model
5. `DATABASE.md` — schema, RLS, SQL functions, scheduled jobs
6. `VERIFICATION.md` — student-card verification spec
7. `AGENT_VOICE.md` — Student Assistant tools, confirmation policy, voice pipeline
8. `DESIGN_GUIDE.md` — tokens, components, screen list
9. `BUILD_PLAN.md` — phases and acceptance criteria. **Work one phase at a time.**

If two docs conflict: `AGENTS.md` > `DATABASE.md`/`VERIFICATION.md`/`AGENT_VOICE.md` > `ARCHITECTURE.md` > `TECH_STACK.md` > `PRD.md`. Flag the conflict to the owner instead of guessing.

## Principles (non-negotiable)

- **We do not custom-build what a prebuilt service does.** Use Supabase Auth, Supabase Realtime, Supabase Storage rules, Cloudinary, pg_cron/pgmq, shadcn/ui. Do not write our own auth, chat server, queue, or image pipeline.
- **Mobile first.** Design at 390px width, then scale up. Desktop shows the same app in a centered column (max 480px) until the owner asks for a desktop layout.
- **Discover → Decide → Act.** Fewest taps. No extra intermediate pages.
- **Practical UI.** No gradients, glassmorphism, neon, robot/chatbot graphics, floating blobs, decorative dashboards. See `DESIGN_GUIDE.md`.
- **AI is a tool, not decoration.** The agent calls typed server functions only. It never touches the database directly and never runs SQL.
- **Trust first.** Show verification badges everywhere relevant; never expose student ID, card image, or private data to other students.

## Hard security rules

1. The Supabase **service-role key is server-only**. Never import `lib/supabase/admin.ts` from a client component or expose the key via `NEXT_PUBLIC_*`.
2. Every table has **RLS enabled**. No table ships without policies. Default policy shape: same university AND verified (see `DATABASE.md`).
3. Agent tools receive the **user identity from the session**, never from model-generated arguments.
4. Consequential actions (booking, renting, purchasing, publishing, messaging, joining, accepting offers) follow the confirmation policy in `AGENT_VOICE.md`. Never execute them silently.
5. Student-card images are **private** (Cloudinary `authenticated` delivery), shown only to admins through short-lived signed URLs, and **deleted after a decision**.
6. Validate all input with **Zod** on the server, even if the client validated it.
7. Secrets only in env vars. Never commit `.env*`. Keep `.env.example` current.
8. Never log card images, full student IDs, OTP codes, or tokens.

## Coding conventions

- TypeScript strict. No `any` unless commented why.
- Next.js App Router. Server Components by default; `"use client"` only where needed (forms, mic, realtime).
- Data access: `supabase-js` with generated types (`supabase gen types typescript`). Migrations live in `supabase/migrations` and are the only way schema changes.
- Mutations that must be atomic (booking a seat, shared-item sale split) are **Postgres functions (RPC)**, not multi-step client code.
- Money is stored as **integer PKR** (no floats). Display as `Rs. 1,800`.
- Dates stored as `timestamptz` (UTC); displayed in `Asia/Karachi`.
- Components: shadcn/ui + Tailwind. Icons: `lucide-react` (stroke icons, never emoji).
- Accessibility: real `<button>`/`<a>`/`<input>` + `<label>`, touch targets ≥ 44px, text contrast ≥ 4.5:1.
- Library APIs change (especially the Vercel AI SDK, Supabase SSR helpers, Next.js). **Before writing code against a library, check its current docs for the installed version.** Do not rely on memory.
- File names: kebab-case for files, PascalCase for components, camelCase for functions.

## Workflow for every task

1. Restate the task and the relevant doc sections in 3–5 bullets.
2. List files you will create/change. Keep changes small and focused.
3. Implement. Write or update tests for business logic (booking, split calculation, verification decision rules, agent tools).
4. Run: `pnpm lint`, `pnpm typecheck`, `pnpm test`. Fix failures.
5. For schema changes: add a migration, regenerate types, add/adjust RLS tests.
6. Summarize what changed and anything the owner must do manually (API keys, dashboard settings).

## Definition of done

- Works at 390×844 and at desktop width.
- Loading, empty, and error states exist.
- RLS verified: a user from another university or an unverified user cannot read/write the data.
- No console errors; lint + typecheck + tests pass.
- Matches `DESIGN_GUIDE.md` and the acceptance criteria of the current phase in `BUILD_PLAN.md`.

## Do NOT

- Do not add features outside the current phase.
- Do not add payments, maps, or social-feed features (non-goals for MVP).
- Do not add a second auth system, ORM, or state library without asking.
- Do not make up API endpoints for Uplift AI — read `https://docs.upliftai.org` and implement exactly what it documents, behind the adapter in `lib/voice/uplift.ts`.
- Do not store sensitive data (card images, IDs, tokens) in `localStorage`.
