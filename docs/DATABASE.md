# DATABASE.md — CampuStitch (PostgreSQL on Supabase)

All schema changes go through `supabase/migrations`. RLS is enabled on every table. Money = integer PKR. Timestamps = `timestamptz`.

## 1. Extensions
`pgcrypto`, `pg_trgm`, `pg_cron`, `pgmq`, `pg_net`

## 2. Enums

```sql
create type user_role as enum ('student','club_organizer','university_admin','platform_admin');
create type verification_status as enum ('unverified','pending','approved','rejected','needs_reupload','expired');
create type vehicle_type as enum ('rickshaw','bike','car');
create type ride_status as enum ('open','full','cancelled','completed');
create type join_mode as enum ('instant','approval');
create type booking_status as enum ('requested','confirmed','rejected','cancelled');
create type booking_source as enum ('ui','agent_text','agent_voice');
create type rental_status as enum ('requested','approved','rejected','cancelled','completed');
create type listing_type as enum ('sale','rent');
create type listing_status as enum ('active','reserved','sold','removed');
create type item_condition as enum ('new','like_new','good','fair');
create type listing_category as enum ('electronics','books','hostel','furniture','accessories','clothing','other');
create type context_type as enum ('listing','ride','bike_rental','roommate','service','community','event','direct');
create type pending_status as enum ('pending','confirmed','cancelled','expired');
```

## 3. Core tables

### Identity and tenancy
| Table | Key columns |
|---|---|
| `universities` | `id`, `name`, `slug` (unique), `card_rules jsonb` (id regex, validity-date field hints), `created_at` |
| `profiles` | `id uuid pk = auth.users.id`, `university_id`, `full_name`, `avatar_url`, `program`, `department`, `batch`, `bio`, `interests text[]`, `role user_role default 'student'`, `verification_status default 'unverified'`, `verified_at`, `verification_expires_at`, `created_at` |
| `student_verifications` | see `VERIFICATION.md` |
| `blocked_student_ids` | `university_id`, `student_id_hash`, `reason`, `created_by`, `created_at` — unique (`university_id`,`student_id_hash`) |
| `places` | `id`, `university_id`, `name`, `aliases text[]` (Urdu script + Roman spellings), `kind` (area/stop/campus_gate/hostel), `lat`, `lng` — trigram index on `name` and on `array_to_string(aliases,' ')` |

### Commute (Move)
| Table | Key columns |
|---|---|
| `rides` | `id`, `university_id`, `organizer_id`, `vehicle vehicle_type`, `origin_place_id`, `destination_place_id`, `pickup_note`, `departs_at`, `seats_total int`, `price_per_person int`, `total_fare int null` (rickshaw), `join_mode default 'instant'`, `notes`, `status ride_status default 'open'`, `created_at` |
| `ride_bookings` | `id`, `ride_id`, `passenger_id`, `status`, `source booking_source`, `created_at` — partial unique (`ride_id`,`passenger_id`) where status in ('requested','confirmed') |
| `bikes` | `id`, `university_id`, `owner_id`, `model`, `description`, `images jsonb`, `location_text`, `price_per_day int`, `deposit int`, `condition item_condition`, `rules text`, `active bool` |
| `bike_rentals` | `id`, `bike_id`, `renter_id`, `starts_at`, `ends_at`, `price int`, `deposit int`, `status rental_status`, `source booking_source`, `created_at` — exclusion constraint prevents overlapping **approved** rentals for the same bike (`btree_gist`, `tstzrange(starts_at, ends_at)`) |

Rickshaw cost split is **computed**, not stored: `ceil(total_fare / confirmed_passengers)`; show "Rs. 200 ÷ 4 = Rs. 50".

### Market (Trade)
| Table | Key columns |
|---|---|
| `listings` | `id`, `university_id`, `seller_id`, `type listing_type`, `title`, `category`, `price int`, `condition`, `location_text`, `description`, `images jsonb` (array of `{public_id,url,w,h}`), `status`, `graduation_sale_id null`, `shared_item_id null`, `created_at` |
| `offers` | `id`, `listing_id`, `buyer_id`, `amount int`, `status` (pending/accepted/rejected/withdrawn), `created_at` |
| `graduation_sales` | `id`, `university_id`, `seller_id`, `title`, `status` (draft/published/closed) |
| `shared_items` | `id`, `university_id`, `name`, `purchase_price int`, `images jsonb`, `status` (active/sold) |
| `shared_item_owners` | `shared_item_id`, `user_id`, `share_bps int` (basis points; all owners sum to 10000), `contribution int` |
| `shared_item_sales` | `id`, `shared_item_id`, `sale_price int`, `sold_at`, `recorded_by` |
| `shared_item_sale_shares` | `sale_id`, `user_id`, `amount int` |

### Hostel (Live)
| Table | Key columns |
|---|---|
| `roommate_posts` | `id`, `university_id`, `author_id`, `kind` (offering_room/seeking_room/replacement), `area_or_hostel`, `budget_min`, `budget_max`, `available_from date`, `description`, `preferences jsonb`, `status` |
| `services` | `id`, `university_id`, `provider_id`, `category` (laundry/printing/bike_repair/laptop_repair/tailoring/transport/food/moving/other), `title`, `description`, `price_note`, `area`, `active bool` |
| `lost_found` | `id`, `university_id`, `author_id`, `kind` (lost/found), `title`, `description`, `location_text`, `images jsonb`, `status` (open/resolved) |

### Community (Connect)
| Table | Key columns |
|---|---|
| `communities` | `id`, `university_id`, `name`, `kind` (society/club/department/batch/hostel/interest), `description`, `is_official bool` ("University community" badge), `created_by` |
| `community_members` | `community_id`, `user_id`, `role` (member/organizer), `joined_at` |
| `events` | `id`, `university_id`, `community_id`, `title`, `description`, `starts_at`, `ends_at`, `venue`, `capacity int null` |
| `event_registrations` | `event_id`, `user_id`, `created_at` — unique pair |
| `help_requests` | `id`, `university_id`, `author_id`, `body`, `status` (open/resolved), `created_at` |

### Messaging, notifications, safety
| Table | Key columns |
|---|---|
| `conversations` | `id`, `university_id`, `context context_type`, `context_id uuid`, `created_at` — unique (`context`,`context_id`, participant pair) |
| `conversation_participants` | `conversation_id`, `user_id`, `last_read_at` |
| `messages` | `id`, `conversation_id`, `sender_id`, `body`, `created_at` |
| `notifications` | `id`, `user_id`, `type`, `title`, `body`, `deeplink`, `read_at`, `created_at` |
| `reports` | `id`, `reporter_id`, `target_type`, `target_id`, `reason`, `details`, `status` (open/actioned/dismissed), `handled_by`, `created_at` |
| `audit_log` | `id`, `actor_id`, `action`, `entity`, `entity_id`, `meta jsonb`, `created_at` |

### Agent
| Table | Key columns |
|---|---|
| `agent_pending_actions` | `id`, `user_id`, `session_id`, `kind` (book_ride, request_bike, join_community, register_event, create_listing, send_message, make_offer…), `payload jsonb`, `summary text`, `status pending_status`, `confirm_channel` (ui/voice), `expires_at` (now + 10 min), `executed_at`, `result jsonb`, `created_at` |
| `agent_tool_calls` | `id`, `user_id`, `session_id`, `tool`, `args_summary jsonb`, `status`, `latency_ms`, `created_at` |

## 4. Helper functions and RLS pattern

```sql
create function public.current_university_id() returns uuid
language sql stable security definer set search_path = public as $$
  select university_id from profiles where id = auth.uid()
$$;

create function public.is_verified() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select verification_status = 'approved' from profiles where id = auth.uid()), false)
$$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('university_admin','platform_admin') from profiles where id = auth.uid()), false)
$$;
```

Standard policy shape for tenant tables (example `listings`):

```sql
alter table listings enable row level security;

create policy listings_read on listings for select
  using (is_verified() and university_id = current_university_id() and status <> 'removed');

create policy listings_insert on listings for insert
  with check (is_verified() and university_id = current_university_id() and seller_id = auth.uid());

create policy listings_update_own on listings for update
  using (seller_id = auth.uid()) with check (seller_id = auth.uid());

create policy listings_admin on listings for all using (is_admin() and university_id = current_university_id());
```

Rules:
- `profiles`: a user can read/update **their own** row (but not `role`, `verification_status`, `verified_at`, `verification_expires_at` — enforce with a trigger or column privileges). Other verified students in the same university see only public columns via a **view** `public_profiles` (id, full_name, avatar_url, program, batch, is_verified).
- `student_verifications`: user can insert/read **own** rows; admins read/update; image public IDs never exposed to other users.
- `messages` / `conversation_participants`: only participants.
- `reports`: insert by any verified student; read/update by admins only.
- `agent_pending_actions`: user reads own; inserts/updates only through server code using the user's client.
- Write RLS tests: (a) other-university user, (b) unverified user, (c) unauthenticated, (d) the owner.

## 5. Atomic functions (RPC) — implement exactly these

### `book_ride(p_ride_id uuid, p_source booking_source default 'ui')`
`security definer`, uses `auth.uid()`. Steps in one transaction:
1. Require `is_verified()`.
2. `select ... from rides where id = p_ride_id for update`.
3. Require same university, status `open`, `departs_at > now()`, caller ≠ organizer.
4. Reject if caller already has an active booking.
5. Count confirmed bookings; if `>= seats_total` → error `RIDE_FULL`.
6. Insert booking: `confirmed` if `join_mode = 'instant'`, else `requested`.
7. If seats are now full, set ride `full`.
8. Insert notification for organizer (deeplink to the ride) and ensure a `conversations` row (context `ride`).
9. Return the booking row.
Errors use stable codes (`RIDE_FULL`, `ALREADY_BOOKED`, `NOT_VERIFIED`, `RIDE_CLOSED`) so the UI/agent can explain them.

### `cancel_booking(p_booking_id uuid)` — passenger or organizer; reopens ride if it was full.

### `request_bike(p_bike_id uuid, p_start timestamptz, p_end timestamptz, p_source booking_source)`
Validates availability (no overlapping approved rental), computes price = `price_per_day` (MVP: per-day pricing; show "8 AM–4 PM" as a same-day rental), inserts `requested`, notifies owner, creates conversation (context `bike_rental`). Owner approval is a separate `respond_bike_rental(p_rental_id, p_approve bool)`.

### `record_shared_item_sale(p_item_id uuid, p_sale_price int)`
Any owner can call. Validates owners' `share_bps` sum to 10000. For each owner compute `floor(p_sale_price * share_bps / 10000)`; **give the remainder (rupees) to the owner with the largest share** (ties → earliest `user_id`). Insert `shared_item_sales` + `shared_item_sale_shares`, set item `sold`, notify all owners. Example: Rs. 2,000 with four 25% owners → Rs. 500 each. Unit-test odd splits (e.g. Rs. 1,001 among 3 owners).

### `confirm_pending_action(p_action_id uuid, p_channel text)`
Server-side executor used by both the Confirm button and the agent tool. Loads the action (must belong to `auth.uid()`, status `pending`, not expired), dispatches by `kind` to the RPCs above, stores `result`, sets `confirmed`. Idempotent: confirming an already confirmed action returns the stored result.

## 6. Search helpers
- `resolve_place(p_text text, p_university uuid)` → best `places` match using `similarity()` on name and aliases (normalize: lowercase, strip diacritics/punctuation, collapse spaces); return top 3 with scores. Seed aliases for each place in both scripts (e.g. a place may appear as "Khurrianwala", "Khurrialwala" and its Urdu-script spelling).
- GIN trigram indexes on listing `title`, ride `pickup_note`, service `title`.

## 7. Seed data (`seed.sql`)
- One university: UET Lahore (slug `uet-lahore`) with `card_rules` placeholder.
- Places: campus gates, hostel blocks (A, B…), common areas, e.g. Khurrianwala (with alias spellings). The owner will add the real list.
- Communities: a few official societies (e.g. CS Society) with `is_official = true`.
- **No fake users in production seed.** Fake data only in a separate `seed.dev.sql`.

## 8. Scheduled jobs (pg_cron)

| Job | Schedule | Action |
|---|---|---|
| `expire_pending_actions` | every minute | set `agent_pending_actions.status='expired'` where `expires_at < now()` and pending |
| `complete_past_rides` | every 15 min | rides with `departs_at < now() - interval '3 hours'` → `completed` |
| `ride_reminders` | every 10 min | insert notifications for confirmed passengers 60 min before departure (dedupe key) |
| `event_reminders` | hourly | insert notifications 24h before events for registrants |
| `expire_verifications` | daily 02:00 PKT | `verification_expires_at < now()` → status `expired`, notify |
| `stale_requests` | hourly | pending ride/bike requests older than 24h → cancelled + notify |
| `purge_old_notifications` | weekly | delete read notifications older than 60 days |
| `delete_card_images` | every 10 min | call `/api/jobs/delete-card-images` via `pg_net` for decided verifications whose `image_deleted_at is null` |

Jobs must be idempotent and use dedupe keys (unique constraint on `(user_id, type, ref_id)` for reminder notifications). Note cron runs in UTC; Pakistan is UTC+05:00.

## 9. Indexes (minimum)
`rides(university_id, status, departs_at)`, `rides(origin_place_id, destination_place_id, departs_at)`, `ride_bookings(ride_id)`, `listings(university_id, status, category, created_at desc)`, `messages(conversation_id, created_at)`, `notifications(user_id, read_at, created_at desc)`, `events(university_id, starts_at)`, `student_verifications(user_id)`, partial unique on active student IDs (see `VERIFICATION.md`).

## 10. Types
After every migration: `supabase gen types typescript --local > src/types/database.ts`.
