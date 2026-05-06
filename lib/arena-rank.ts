export interface RankTier {
  name: string;
  label: string;
  min: number;
  max: number;
  color: string;
  glow: string;
  borderColor: string;
}

export const RANK_TIERS: RankTier[] = [
  { name: 'CHUD',     label: 'the aura is absent',         min: 0,    max: 399,       color: '#EF4444', glow: 'rgba(239,68,68,0.2)',     borderColor: 'rgba(239,68,68,0.2)'     },
  { name: 'BASIC',    label: 'baseline energy',             min: 400,  max: 599,       color: '#8A8680', glow: 'rgba(138,134,128,0.15)',  borderColor: 'rgba(138,134,128,0.15)'  },
  { name: 'FRESH',    label: 'showing potential',           min: 600,  max: 749,       color: '#4ADE80', glow: 'rgba(74,222,128,0.2)',    borderColor: 'rgba(74,222,128,0.2)'    },
  { name: 'MOGGER',   label: 'consistently winning',        min: 750,  max: 899,       color: '#A78BFA', glow: 'rgba(167,139,250,0.22)',  borderColor: 'rgba(167,139,250,0.22)'  },
  { name: 'ELITE',    label: 'rare specimen',               min: 900,  max: 999,       color: '#FF6B00', glow: 'rgba(255,107,0,0.25)',    borderColor: 'rgba(255,107,0,0.25)'    },
  { name: 'MOG GOD',  label: 'untouchable',                 min: 1000, max: Infinity,  color: '#F5F1EA', glow: 'rgba(245,241,234,0.3)',   borderColor: 'rgba(245,241,234,0.3)'   },
];

export function getRank(elo: number): RankTier {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (elo >= RANK_TIERS[i].min) return RANK_TIERS[i];
  }
  return RANK_TIERS[0];
}

export function getRankProgress(elo: number): { progress: number; eloInTier: number; eloNeeded: number; nextRank: RankTier | null } {
  const currentIndex = RANK_TIERS.findIndex(r => r === getRank(elo));
  if (currentIndex === RANK_TIERS.length - 1) {
    return { progress: 100, eloInTier: elo - RANK_TIERS[currentIndex].min, eloNeeded: 0, nextRank: null };
  }
  const current = RANK_TIERS[currentIndex];
  const next = RANK_TIERS[currentIndex + 1];
  const eloInTier = elo - current.min;
  const tierRange = next.min - current.min;
  return {
    progress: Math.min((eloInTier / tierRange) * 100, 100),
    eloInTier,
    eloNeeded: next.min - elo,
    nextRank: next,
  };
}

export function calcEloChange(winner: 'player1' | 'player2' | 'tie'): { player1: number; player2: number } {
  if (winner === 'tie') return { player1: 3, player2: 3 };
  return {
    player1: winner === 'player1' ? 25 : -18,
    player2: winner === 'player2' ? 25 : -18,
  };
}
