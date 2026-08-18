import { RawIndicatorSnapshot, ScoreBreakdown, MarketRegime, ConfidenceBreakdown } from "./interfaces";
import { clamp } from "./normalization";

export function computeConfidence(
  input: RawIndicatorSnapshot,
  normalized: Record<string, number>,
  scores: Omit<ScoreBreakdown, "compositeScore">,
  regime: MarketRegime
): ConfidenceBreakdown {
  // Agreement score: standard deviation of sub-scores from the mean
  const scoreValues = [scores.trendScore, scores.momentumScore, scores.volumeScore, scores.volatilityScore];
  const mean = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
  const variance = scoreValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scoreValues.length;
  const stdDev = Math.sqrt(variance);
  
  // High variance = low agreement. Let's say max stdDev is around 50 (if two are 0, two are 100).
  const agreementScore = clamp(100 - (stdDev * 2), 0, 100);
  
  let conflictPenalty = 0;
  if (normalized.supertrendScore === 100 && normalized.ema50Score === 0) conflictPenalty += 10;
  if (normalized.supertrendScore === 0 && normalized.ema50Score === 100) conflictPenalty += 10;
  
  let missingDataPenalty = 0;
  if (input.adx14 === undefined) missingDataPenalty += 5;
  if (input.volume === 0) missingDataPenalty += 15;
  
  const regimeClarityBonus = (input.bbWidth > 0.05 && regime === "Trending") ? 10 : 0;
  
  const confidence = clamp(
    agreementScore - conflictPenalty - missingDataPenalty + regimeClarityBonus,
    0,
    100
  );
  
  return {
    confidence: Math.round(confidence),
    agreementScore: Math.round(agreementScore),
    conflictPenalty,
    missingDataPenalty,
    regimeClarityBonus
  };
}
