-- Run this in your Supabase SQL editor
-- If you ran the old schema, drop the old tables first:
-- DROP TABLE IF EXISTS public.scans CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  credits int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Scans table (leaderboard + history)
create table public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  archetype_name text not null,
  archetype_tag text not null,
  aura_score int not null,
  tier text not null,
  encoded_result text not null,
  created_at timestamptz not null default now()
);

alter table public.scans enable row level security;

create policy "Anyone can view scans"
  on public.scans for select
  using (true);

create policy "Service role can insert scans"
  on public.scans for insert
  with check (true);

-- Battles table (1v1 mode)
create table public.battles (
  id text primary key,
  initiator_encoded text not null,
  initiator_archetype text not null,
  initiator_score integer not null,
  initiator_tier text not null,
  opponent_encoded text,
  opponent_archetype text,
  opponent_score integer,
  opponent_tier text,
  winner text check (winner in ('initiator', 'opponent', 'tie')),
  status text not null default 'waiting' check (status in ('waiting', 'complete')),
  created_at timestamptz not null default now()
);

alter table public.battles enable row level security;

create policy "battles are publicly readable"
  on public.battles for select
  using (true);

create policy "battles can be inserted by anyone"
  on public.battles for insert
  with check (true);

create policy "battles can be updated by anyone"
  on public.battles for update
  using (true);
