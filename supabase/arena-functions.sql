-- Run in Supabase SQL Editor
-- Atomic matchmaking via Postgres functions (race-free with advisory lock)

-- One-time cleanup of stale state
delete from public.arena_queue;

-- ─── arena_match: POST entrypoint (atomic match-or-queue) ──────────────────
create or replace function public.arena_match(p_user_id uuid, p_display_name text)
returns json language plpgsql security definer as $$
declare m_id text; opp_uid uuid; opp_name text; q_id uuid; q_at timestamptz;
begin
  perform pg_advisory_xact_lock(67234);

  delete from public.arena_queue where joined_at < now() - interval '60 seconds';
  delete from public.arena_queue where user_id = p_user_id;

  select user_id, display_name into opp_uid, opp_name
  from public.arena_queue
  where user_id != p_user_id
  order by joined_at
  limit 1;

  if found then
    delete from public.arena_queue where user_id = opp_uid;
    m_id := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    insert into public.arena_matches (id, player1_id, player1_name, player2_id, player2_name, status)
      values (m_id, opp_uid, opp_name, p_user_id, p_display_name, 'connecting');
    return json_build_object('matchId', m_id, 'role', 'player2', 'opponentName', opp_name);
  end if;

  insert into public.arena_queue (user_id, display_name)
    values (p_user_id, p_display_name)
    returning id, joined_at into q_id, q_at;
  return json_build_object('queueId', q_id, 'queuedAt', q_at, 'waiting', true);
end $$;

-- ─── arena_poll: GET entrypoint (check for match or matchmake) ─────────────
create or replace function public.arena_poll(p_user_id uuid, p_queue_id uuid, p_queued_at timestamptz)
returns json language plpgsql security definer as $$
declare m_id text; opp_uid uuid; opp_name text; me_name text;
begin
  perform pg_advisory_xact_lock(67234);

  -- Matched as player1? (only matches created AFTER we joined this session)
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

  -- Not matched yet — attempt matchmake
  select display_name into me_name from public.arena_queue where id = p_queue_id;
  if not found then
    return json_build_object('waiting', true);
  end if;

  select user_id, display_name into opp_uid, opp_name
  from public.arena_queue
  where user_id != p_user_id
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
