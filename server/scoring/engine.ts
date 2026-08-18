import { RawIndicatorSnapshot, SESOutput, MarketRegime, ScoreBreakdown } from "./interfaces";
import { MODEL_VERSION, FORMULA_VERSION, BASE_WEIGHT_PROFILE } from "./constants";
import { normalizeIndicators } from "./normalization";
import { computeTrendScore } from "./trend";
import { computeMomentumScore } from "./momentum";
import { computeVolumeScore } from "./volume";
import { computeVolatilityScore } from "./volatility";
import { getWeightsForRegime } from "./weights";
import { computeCompositeScore } from "./composite";
import { computeConfidence } from "./confidence";
import { buildExplanation } from "./explanation";

function detectMarketRegime(input: RawIndicatorSnapshot, normalized: Record<string, number>): MarketRegime {
  return input.bbWidth > 0.05 ? "Trending" : "Ranging";
}

function getLabel(compositeScore: number): SESOutput["label"] {
  if (compositeScore >= 70) return "Strong Bullish";
  if (compositeScore >= 55) return "Bullish";
  if (compositeScore <= 30) return "Strong Bearish";
  if (compositeScore <= 45) return "Bearish";
  return "Neutral";
}

export function runScoringEngine(input: RawIndicatorSnapshot): SESOutput {
  const normalized = normalizeIndicators(input);
  
  const trendResult = computeTrendScore(input, normalized);
  const momentumResult = computeMomentumScore(input, normalized);
  const volumeResult = computeVolumeScore(input, normalized);
  const volatilityResult = computeVolatilityScore(input, normalized);

  const marketRegime = detectMarketRegime(input, normalized);
  const weights = getWeightsForRegime(marketRegime);
  
  const baseScores = { 
    trendScore: trendResult.score, 
    momentumScore: momentumResult.score, 
    volumeScore: volumeResult.score, 
    volatilityScore: volatilityResult.score 
  };
  const compositeScore = computeCompositeScore(baseScores, weights);
  
  const scores: ScoreBreakdown = { ...baseScores, compositeScore };
  const confidence = computeConfidence(input, normalized, baseScores, marketRegime);
  
  const allEvidence = [
    ...trendResult.evidence,
    ...momentumResult.evidence,
    ...volumeResult.evidence,
    ...volatilityResult.evidence
  ];
  
  const allConflicts = [
    ...trendResult.conflicts,
    ...momentumResult.conflicts,
    ...volumeResult.conflicts,
    ...volatilityResult.conflicts
  ];

  const { evidence, conflicts } = buildExplanation(allEvidence, allConflicts);
  const label = getLabel(compositeScore);

  return {
    modelVersion: MODEL_VERSION,
    formulaVersion: FORMULA_VERSION,
    weightProfile: BASE_WEIGHT_PROFILE,
    marketRegime,
    raw: input,
    normalized,
    scores,
    confidence,
    evidence,
    conflicts,
    label
  };
}
