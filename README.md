# Hotel Booking

A single-hotel booking site: a CMS for managing room types and rooms, and a public
frontend where guests browse room types and pay online to book.

## Structure

- `supabase/migrations/0001_init.sql` — full database schema (tables, RLS policies,
  helper functions) to run in your Supabase project.
- `cms/` — Next.js + TypeScript admin app. Login-gated. Manage room types, rooms,
  and bookings.
- `frontend/` — Next.js + TypeScript public site. Guests browse room types and book
  with Midtrans Snap (supports GoPay, OVO, DANA, QRIS, bank transfer/VA, and cards).

## How booking works

- The hotel has one or more **room types** (e.g. Deluxe, Suite), each with many
  physical **rooms**.
- Guests book a **room type** for a date range (not a specific room). Availability
  is computed by the `get_available_rooms(room_type_id, check_in, check_out)`
  SQL function: active rooms of that type, minus rooms already booked
  (pending/confirmed) for overlapping dates.
- A booking is created as `pending`, a Midtrans Snap transaction is created, and
  the guest is redirected to Midtrans's hosted payment page to pay with whichever
  method they choose. Midtrans's notification webhook flips the booking to
  `confirmed` once payment actually settles — bank transfer/VA and some e-wallet
  methods don't confirm instantly, so a booking can sit `pending` for a while
  after the guest reaches the "payment received" page.
- All prices are in **IDR** (Indonesian Rupiah), since Midtrans only settles in IDR.

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run `supabase/migrations/0001_init.sql`.
3. Create your first CMS user: **Authentication → Users → Add user** (email +
   password). A matching row in `profiles` is created automatically by a trigger,
   which grants that user access to the CMS.
4. Note down, from **Project Settings → API**:
   - Project URL
   - `anon` public key
   - `service_role` key (frontend only, keep secret)

## 2. Configure the CMS

```bash
cd cms
cp .env.local.example .env.local   # fill in Supabase URL + anon key
npm install
npm run dev
```

Visit `http://localhost:3000`, sign in with the user you created, and add your
room types and rooms.

## 3. Configure the frontend

```bash
cd frontend
cp .env.local.example .env.local   # fill in Supabase + Midtrans values
npm install
npm run dev -- -p 3001   # run on a different port than the CMS (which defaults to 3000)
```

Env vars needed (see `.env.local.example`):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public reads.
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, used to create bookings/payments and
  to update booking status from the Midtrans notification webhook. Never exposed
  to the browser.
- `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY` — from your Midtrans dashboard
  (Settings → Access Keys). Use the `SB-...` sandbox keys while testing.
- `MIDTRANS_IS_PRODUCTION` — `false` for sandbox, `true` once you switch to
  production keys.
- `NEXT_PUBLIC_SITE_URL` — used to build the post-payment redirect URL.

### Midtrans account & sandbox

1. Sign up at [midtrans.com](https://midtrans.com) (the sandbox/simulator is free,
   no business verification needed to start testing).
2. Grab your **Server Key** and **Client Key** from Settings → Access Keys
   (sandbox mode) and put them in `.env.local`.
3. In Settings → Configuration, enable the payment methods you want to accept
   (GoPay, bank transfer/VA, QRIS, etc.) — Snap only shows enabled methods.

### Midtrans notification webhook

Midtrans calls your webhook server-to-server whenever a payment's status
changes — it can't reach `localhost` directly, so for local testing you need a
public tunnel (e.g. [ngrok](https://ngrok.com)):

```bash
ngrok http 3001
```

Then in the Midtrans dashboard (Settings → Configuration → Payment Notification
URL), set it to `https://<your-ngrok-subdomain>/api/midtrans/webhook`.

In production, point that same setting at
`https://your-frontend-domain/api/midtrans/webhook`. Unlike Stripe, there's no
separate webhook signing secret to configure — each notification is verified
using a SHA-512 hash of `order_id + status_code + gross_amount + your server key`
(see `frontend/src/app/api/midtrans/webhook/route.ts`).

## Notes on typing

Both apps use hand-written domain types in `src/types/database.ts` rather than
`supabase gen types`. The installed `@supabase/supabase-js` (2.112.x) has a
compiler edge case where a hand-written generic `Database` type passed to
`createClient<Database>()` resolves to `never` for every table. Both apps use the
Supabase clients **untyped** instead, casting query results to the domain types at
each call site. If you later run `supabase gen types typescript` against your
live project, you can reintroduce a generated `Database` type — just verify it
against `createClient<Database>().from(...).select('*')` in a scratch file first.
