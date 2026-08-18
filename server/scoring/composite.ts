import { ScoreBreakdown } from "./interfaces";
import { WeightProfile } from "./weights";

export function computeCompositeScore(
  scores: Omit<ScoreBreakdown, "compositeScore">,
  weights: WeightProfile
): number {
  const composite = 
    scores.trendScore * weights.trendWeight +
    scores.momentumScore * weights.momentumWeight +
    scores.volumeScore * weights.volumeWeight +
    scores.volatilityScore * weights.volatilityWeight;
    
  return Math.round(composite);
}
