import { RawIndicatorSnapshot, CategoryResult } from "./interfaces";

export function computeMomentumScore(input: RawIndicatorSnapshot, normalized: Record<string, number>): CategoryResult {
  const score = 
    normalized.rsi14 * 0.35 +
    normalized.macdHistogram * 0.35 +
    normalized.cci20 * 0.20 +
    normalized.williamsR14 * 0.10;
  
  const evidence: string[] = [];
  const conflicts: string[] = [];

  if (normalized.macdHistogram > 50) evidence.push("MACD Positive");
  else if (normalized.macdHistogram < 50) conflicts.push("MACD Negative");

  if (normalized.rsi14 > 70) conflicts.push("RSI Overbought");
  else if (normalized.rsi14 < 30) evidence.push("RSI Oversold");

  return {
    category: "Momentum",
    score,
    evidence,
    conflicts
  };
}
