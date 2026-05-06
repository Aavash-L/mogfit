-- Run this in your Supabase SQL editor

-- Add rank columns to profiles
alter table public.profiles add column if not exists elo int not null default 400;
alter table public.profiles add column if not exists arena_wins int not null default 0;
alter table public.profiles add column if not exists arena_losses int not null default 0;
alter table public.profiles add column if not exists arena_ties int not null default 0;

-- Add ELO change columns to arena_matches (set when match completes)
alter table public.arena_matches add column if not exists player1_elo_before int;
alter table public.arena_matches add column if not exists player2_elo_before int;
alter table public.arena_matches add column if not exists player1_elo_change int;
alter table public.arena_matches add column if not exists player2_elo_change int;
