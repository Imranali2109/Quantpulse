import { MarketRegime } from "./interfaces";

export interface WeightProfile {
  trendWeight: number;
  momentumWeight: number;
  volumeWeight: number;
  volatilityWeight: number;
}

export function getWeightsForRegime(regime: MarketRegime): WeightProfile {
  if (regime === "Trending") {
    return {
      trendWeight: 0.50,
      momentumWeight: 0.25,
      volumeWeight: 0.15,
      volatilityWeight: 0.10,
    };
  } else {
    return {
      trendWeight: 0.20,
      momentumWeight: 0.45,
      volumeWeight: 0.20,
      volatilityWeight: 0.15,
    };
  }
}
