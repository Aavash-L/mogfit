-- Run this in your Supabase SQL editor

create table public.arena_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  display_name text not null,
  joined_at timestamptz not null default now()
);
alter table public.arena_queue enable row level security;
create policy "arena_queue_all" on public.arena_queue for all using (true) with check (true);

create table public.arena_matches (
  id text primary key,
  player1_id uuid not null,
  player1_name text not null,
  player2_id uuid not null,
  player2_name text not null,
  player1_score int,
  player1_archetype text,
  player2_score int,
  player2_archetype text,
  winner text check (winner in ('player1', 'player2', 'tie')),
  status text not null default 'connecting',
  created_at timestamptz not null default now()
);
alter table public.arena_matches enable row level security;
create policy "arena_matches_all" on public.arena_matches for all using (true) with check (true);
