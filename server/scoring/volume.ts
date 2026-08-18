import { RawIndicatorSnapshot, CategoryResult } from "./interfaces";

export function computeVolumeScore(input: RawIndicatorSnapshot, normalized: Record<string, number>): CategoryResult {
  const score = 
    normalized.obv * 0.35 +
    normalized.vwap * 0.35 +
    normalized.relVolume * 0.30;
    
  const evidence: string[] = [];
  const conflicts: string[] = [];

  if (normalized.vwap >= 70) evidence.push("Above VWAP");
  else if (normalized.vwap <= 30) conflicts.push("Below VWAP");

  if (normalized.relVolume > 75) {
    if (input.close > input.open) evidence.push("High Volume Up-Day");
    else conflicts.push("High Volume Down-Day");
  }

  return {
    category: "Volume",
    score,
    evidence,
    conflicts
  };
}
