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

export interface GlowUpSwap {
  replace: string;
  with: string;
  why: string;
  impact: string;
}

export interface GlowUpAddition {
  add: string;
  why: string;
  impact: string;
}

export interface GlowUpRemove {
  item: string;
  why: string;
  impact: string;
}

export interface GlowUpResult {
  current_score: number;
  potential_score: number;
  verdict_line: string;
  swaps: GlowUpSwap[];
  additions: GlowUpAddition[];
  remove: GlowUpRemove[];
  one_thing: string;
}

export interface InspoMatchResult {
  aligned: string[];
  missing: string[];
  additions: Array<{ add: string; why: string }>;
  vibe_gap: string;
}

export type UserTier = 'free' | 'credits' | 'mogplus';
