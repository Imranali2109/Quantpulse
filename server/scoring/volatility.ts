import { RawIndicatorSnapshot, CategoryResult } from "./interfaces";

export function computeVolatilityScore(input: RawIndicatorSnapshot, normalized: Record<string, number>): CategoryResult {
  const score = 
    normalized.atr14 * 0.30 +
    normalized.historicalVolPct * 0.40 +
    normalized.bbWidth * 0.30;
    
  const evidence: string[] = [];
  const conflicts: string[] = [];

  if (normalized.historicalVolPct >= 70) evidence.push("Low Hist. Volatility");
  else if (normalized.historicalVolPct <= 30) conflicts.push("High Hist. Volatility");

  return {
    category: "Volatility",
    score,
    evidence,
    conflicts
  };
}
