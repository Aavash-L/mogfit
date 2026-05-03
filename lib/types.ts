export interface AuraPiece {
  name: string;
  verdict: string;
  delta: number;
  type: 'good' | 'bad';
}

export interface AuraResult {
  archetype_name: string;
  archetype_tag: string;
  aura_score: number;
  tier: 'LOW' | 'MID' | 'HIGH' | 'ELITE';
  tier_percentile: string;
  pieces: AuraPiece[];
}

export interface AuraError {
  error: 'no_fit_detected';
  message: string;
}
