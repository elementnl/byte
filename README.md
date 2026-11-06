# Byte

Tiny personal nutrition log: protein + calories per day. Next.js + Supabase.

## Setup

1. Run `supabase/schema.sql` in the Supabase SQL editor.
2. Create your user in Supabase → Authentication → Users (there's no sign-up).
3. `cp .env.example .env` and fill in `SUPABASE_URL` + `SUPABASE_SECRET_KEY` (secret key, server-only).
4. `npm install && npm run dev`

## Layout

- `src/app/api` – all server logic (auth, day log, calendar, entries, settings)
- `src/server` – server-only helpers (Supabase clients, dates, validation)
- `src/app`, `src/components` – UI, which only renders what the API returns
- `src/proxy.ts` – auth gate for every page and API route
