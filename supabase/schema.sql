-- Byte schema. Safe to re-run.
-- The app talks to these tables only from the server with the secret key.
-- RLS is enabled with no policies, so publishable/anon keys can't read or write anything.

create table if not exists public.byte_settings (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  calorie_goal integer check (calorie_goal > 0),
  protein_goal integer check (protein_goal > 0),
  theme        text not null default 'light' check (theme in ('light', 'dark')),
  updated_at   timestamptz not null default now()
);

create table if not exists public.byte_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  date       date not null,
  name       text not null check (char_length(name) between 1 and 100),
  protein    numeric(6, 1) not null check (protein >= 0),
  calories   integer not null check (calories >= 0),
  created_at timestamptz not null default now()
);

create index if not exists byte_entries_user_date_idx on public.byte_entries (user_id, date);

alter table public.byte_settings enable row level security;
alter table public.byte_entries enable row level security;
