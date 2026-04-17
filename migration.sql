-- ─────────────────────────────────────────────────────────────────────────────
-- migration.sql
-- Run this ONCE in your Supabase project's SQL Editor.
-- Supabase Dashboard → SQL Editor → New Query → paste → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Enable UUID generation ────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── vault_scenarios ───────────────────────────────────────────────────────────
-- Stores the 3 named scenario slots per anonymous session.
create table if not exists vault_scenarios (
  id            uuid        primary key default gen_random_uuid(),
  session_id    text        not null,
  slot_id       text        not null check (slot_id in ('utama', 'optimis', 'konservatif')),
  name          text,
  scenario      jsonb,
  engine_result jsonb,
  saved_at      timestamptz not null default now(),

  -- One row per (session, slot) — upsert target
  constraint vault_scenarios_session_slot_unique unique (session_id, slot_id)
);

-- Index for fast session lookups
create index if not exists idx_vault_session_id on vault_scenarios (session_id);

-- ── screening_profiles ────────────────────────────────────────────────────────
-- Stores the completed screening profile per anonymous session.
-- One row per session — upsert replaces on re-screening.
create table if not exists screening_profiles (
  id          uuid        primary key default gen_random_uuid(),
  session_id  text        not null unique,
  profile     jsonb       not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_screening_session_id on screening_profiles (session_id);

-- Auto-update updated_at on profile changes
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger screening_profiles_updated_at
  before update on screening_profiles
  for each row execute function update_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Anonymous users can only read/write their own session rows.
-- session_id is the anonymous user's UUID from Supabase Auth.

alter table vault_scenarios    enable row level security;
alter table screening_profiles enable row level security;

-- vault_scenarios: anon user can select/insert/update/delete their own rows
create policy "vault: own session only"
  on vault_scenarios
  for all
  using      (session_id = auth.uid()::text)
  with check (session_id = auth.uid()::text);

-- screening_profiles: same
create policy "screening: own session only"
  on screening_profiles
  for all
  using      (session_id = auth.uid()::text)
  with check (session_id = auth.uid()::text);

-- ── Verify ────────────────────────────────────────────────────────────────────
-- After running, you should see both tables in Table Editor.
-- Run this to confirm:
-- select table_name from information_schema.tables where table_schema = 'public';
