import { notFound, redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { MatchRoom } from '@/components/arena/match-room';

interface Props {
  params: Promise<{ matchId: string }>;
  searchParams: Promise<{ role?: string; name?: string }>;
}

export default async function MatchPage({ params, searchParams }: Props) {
  const { matchId } = await params;
  const { role, name } = await searchParams;

  if (!role || !name || (role !== 'player1' && role !== 'player2')) {
    redirect('/arena');
  }

  const service = createServiceClient();
  const { data: match } = await service
    .from('arena_matches')
    .select('*')
    .eq('id', matchId)
    .single();

  if (!match) notFound();

  const opponentName = role === 'player1' ? match.player2_name : match.player1_name;

  return (
    <MatchRoom
      matchId={matchId}
      role={role as 'player1' | 'player2'}
      myName={decodeURIComponent(name)}
      opponentName={opponentName}
    />
  );
}
