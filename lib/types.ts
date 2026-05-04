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
  short_roast: string;
  pieces: AuraPiece[];
  how_perceived: string;
  rare_traits: string[];
}

export interface AuraError {
  error: 'no_fit_detected';
  message: string;
}
