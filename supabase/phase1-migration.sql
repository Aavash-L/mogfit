-- Phase 1 migration — run in Supabase SQL editor
-- Adds MOG+, daily roast, streak, glow-up tracking, referrals

-- MOG+ subscription columns
alter table public.profiles
  add column if not exists is_mogplus boolean not null default false,
  add column if not exists mogplus_expires_at timestamptz,
  add column if not exists mogplus_stripe_sub_id text;

-- Daily roast + streak
alter table public.profiles
  add column if not exists daily_roast_used_at timestamptz,
  add column if not exists scan_streak int not null default 0;

-- Free glow-up tracking
alter table public.profiles
  add column if not exists free_glowup_used boolean not null default false;

-- Referral system
alter table public.profiles
  add column if not exists referral_code text unique,
  add column if not exists referred_by uuid references public.profiles(id);

-- Index for fast referral code lookups
create index if not exists profiles_referral_code_idx on public.profiles(referral_code);

-- Allow service role to read/write all profile columns
-- (existing policies already cover this via service role key)

-- NOTE: The following Arena tables can be dropped once you confirm
-- no data needs to be kept. Run these manually when ready:
--
-- DROP TABLE IF EXISTS public.arena_queue CASCADE;
-- DROP TABLE IF EXISTS public.arena_matches CASCADE;
-- DROP TABLE IF EXISTS public.battles CASCADE;
--
-- DROP FUNCTION IF EXISTS arena_match(uuid, text);
-- DROP FUNCTION IF EXISTS arena_poll(uuid, uuid, timestamptz);
--
-- Arena ELO columns on profiles (safe to drop):
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS elo;
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS arena_wins;
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS arena_losses;
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS arena_ties;
