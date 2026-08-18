import { RawIndicatorSnapshot, CategoryResult } from "./interfaces";

export function computeTrendScore(input: RawIndicatorSnapshot, normalized: Record<string, number>): CategoryResult {
  let score = 0;
  const evidence: string[] = [];
  const conflicts: string[] = [];
  
  if (normalized.adx14 !== undefined && normalized.adx14 !== 50) {
    score = 
      normalized.ema20 * 0.20 +
      normalized.ema50 * 0.30 +
      normalized.ema200 * 0.20 +
      normalized.supertrend * 0.20 +
      normalized.adx14 * 0.10;
  } else {
    // Redistribute the 0.10 ADX weight
    score = 
      normalized.ema20 * 0.25 +
      normalized.ema50 * 0.35 +
      normalized.ema200 * 0.20 +
      normalized.supertrend * 0.20;
  }

  if (normalized.ema50 >= 70) evidence.push("Above EMA50");
  else if (normalized.ema50 <= 30) conflicts.push("Below EMA50");
  
  if (normalized.supertrend >= 70) evidence.push("Supertrend Bullish");
  else if (normalized.supertrend <= 30) conflicts.push("Supertrend Bearish");

  return {
    category: "Trend",
    score,
    evidence,
    conflicts
  };
}
