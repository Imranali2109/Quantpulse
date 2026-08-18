export type MarketRegime = "Trending" | "Ranging";

export interface RawIndicatorSnapshot {
  price: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  ema20: number;
  ema50: number;
  ema200: number;
  rsi14: number;
  macdHistogram: number;
  macdLine: number;
  macdSignal: number;
  cci20: number;
  williamsR14: number;
  atr14: number;
  vwap: number;
  obv: number;
  relVolume: number;
  bbWidth: number;
  historicalVolPct: number;
  supertrend: "Bullish" | "Bearish";
  adx14?: number;
}

export interface IndicatorResult {
  id: string;
  value: number | string;
}

export interface NormalizedIndicatorResult {
  id: string;
  normalizedValue: number;
}

export interface CategoryResult {
  category: "Trend" | "Momentum" | "Volume" | "Volatility";
  score: number;
  evidence: string[];
  conflicts: string[];
}

export interface WeightProfile {
  trendWeight: number;
  momentumWeight: number;
  volumeWeight: number;
  volatilityWeight: number;
}

export interface ExplanationBlock {
  evidence: string[];
  conflicts: string[];
}

export interface ScoringContext {
  raw: RawIndicatorSnapshot;
  normalized: Record<string, number>;
  regime: MarketRegime;
}

export interface ScoreBreakdown {
  trendScore: number;
  momentumScore: number;
  volatilityScore: number;
  volumeScore: number;
  compositeScore: number;
}

export interface ExplanationEvidence {
  evidence: string[];
  conflicts: string[];
}

export interface ConfidenceBreakdown {
  confidence: number;
  agreementScore: number;
  conflictPenalty: number;
  missingDataPenalty: number;
  regimeClarityBonus: number;
}

export interface SESOutput {
  modelVersion: string;
  formulaVersion: string;
  weightProfile: string;
  marketRegime: MarketRegime;
  raw: RawIndicatorSnapshot;
  normalized: Record<string, number>;
  scores: ScoreBreakdown;
  confidence: ConfidenceBreakdown;
  evidence: string[];
  conflicts: string[];
  label: "Strong Bullish" | "Bullish" | "Neutral" | "Bearish" | "Strong Bearish";
}
