-- Run in Supabase SQL Editor
-- Atomic matchmaking with heartbeat-based presence (filters out dead/closed-tab phantoms)

-- One-time cleanup of stale state
delete from public.arena_queue;
delete from public.arena_matches where status = 'connecting';

-- Heartbeat column
alter table public.arena_queue add column if not exists last_seen_at timestamptz not null default now();

-- ─── arena_match: POST entrypoint ──────────────────────────────────────────
create or replace function public.arena_match(p_user_id uuid, p_display_name text)
returns json language plpgsql security definer as $$
declare m_id text; opp_uid uuid; opp_name text; q_id uuid; q_at timestamptz;
begin
  perform pg_advisory_xact_lock(67234);

  -- Drop dead/stale entries (haven't pinged in 10s)
  delete from public.arena_queue where last_seen_at < now() - interval '10 seconds';

  -- Remove any existing entry for me
  delete from public.arena_queue where user_id = p_user_id;

  -- Find a LIVE opponent (heartbeat within 5s)
  select user_id, display_name into opp_uid, opp_name
  from public.arena_queue
  where user_id != p_user_id and last_seen_at > now() - interval '5 seconds'
  order by joined_at
  limit 1;

  if found then
    delete from public.arena_queue where user_id = opp_uid;
    m_id := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    insert into public.arena_matches (id, player1_id, player1_name, player2_id, player2_name, status)
      values (m_id, opp_uid, opp_name, p_user_id, p_display_name, 'connecting');
    return json_build_object('matchId', m_id, 'role', 'player2', 'opponentName', opp_name);
  end if;

  insert into public.arena_queue (user_id, display_name, last_seen_at)
    values (p_user_id, p_display_name, now())
    returning id, joined_at into q_id, q_at;
  return json_build_object('queueId', q_id, 'queuedAt', q_at, 'waiting', true);
end $$;

-- ─── arena_poll: GET entrypoint (also serves as heartbeat) ─────────────────
create or replace function public.arena_poll(p_user_id uuid, p_queue_id uuid, p_queued_at timestamptz)
returns json language plpgsql security definer as $$
declare m_id text; opp_uid uuid; opp_name text; me_name text;
begin
  perform pg_advisory_xact_lock(67234);

  -- Heartbeat — prove we're still alive
  update public.arena_queue set last_seen_at = now() where id = p_queue_id;

  -- Sweep dead entries
  delete from public.arena_queue where last_seen_at < now() - interval '10 seconds';

  -- Matched as player1?
  select id, player2_name into m_id, opp_name
  from public.arena_matches
  where player1_id = p_user_id and created_at >= p_queued_at
  order by created_at desc limit 1;
  if found then
    delete from public.arena_queue where id = p_queue_id;
    return json_build_object('matchId', m_id, 'role', 'player1', 'opponentName', opp_name);
  end if;

  -- Matched as player2?
  select id, player1_name into m_id, opp_name
  from public.arena_matches
  where player2_id = p_user_id and created_at >= p_queued_at
  order by created_at desc limit 1;
  if found then
    delete from public.arena_queue where id = p_queue_id;
    return json_build_object('matchId', m_id, 'role', 'player2', 'opponentName', opp_name);
  end if;

  -- Try to matchmake
  select display_name into me_name from public.arena_queue where id = p_queue_id;
  if not found then
    return json_build_object('waiting', true);
  end if;

  select user_id, display_name into opp_uid, opp_name
  from public.arena_queue
  where user_id != p_user_id and last_seen_at > now() - interval '5 seconds'
  order by joined_at
  limit 1;
  if not found then
    return json_build_object('waiting', true);
  end if;

  delete from public.arena_queue where user_id in (p_user_id, opp_uid);
  m_id := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
  insert into public.arena_matches (id, player1_id, player1_name, player2_id, player2_name, status)
    values (m_id, p_user_id, me_name, opp_uid, opp_name, 'connecting');
  return json_build_object('matchId', m_id, 'role', 'player1', 'opponentName', opp_name);
end $$;
