import { StreetSheet, AccuracyStats, ConvergenceResult, ConvergenceVerdict } from '../src/types';

export function computeConvergence(
  signal: { label: string; score: number },
  street: StreetSheet,
  reliability: AccuracyStats
): ConvergenceResult {
  // A small dead-zone around 0% implied upside avoids false precision.
  const UPSIDE_THRESHOLD = 3;
  // A minimum hit rate for the signal to be considered "moderate-high" reliability.
  const HIGH_RELIABILITY_THRESHOLD = 60;

  if (street.status === "unavailable" || street.firms.length < 2) {
    return {
      verdict: "INCONCLUSIVE",
      signalLabel: signal.label,
      signalScore: signal.score,
      streetSummary: "Insufficient analyst coverage to form a consensus view.",
      reliabilitySummary: summarizeReliability(reliability),
      explanation: "Not enough institutional coverage exists for this ticker to compare against your technical read. Treat the technical signal on its own merits.",
    };
  }

  const streetBullish = street.impliedUpsidePct > UPSIDE_THRESHOLD;
  const streetBearish = street.impliedUpsidePct < -UPSIDE_THRESHOLD;
  
  // Strong/Weak variations map back to base direction
  const signalBullish = signal.label.includes("Bullish");
  const signalBearish = signal.label.includes("Bearish");

  const agree = (signalBullish && streetBullish) || (signalBearish && streetBearish);
  const disagree = (signalBullish && streetBearish) || (signalBearish && streetBullish);

  const verdict: ConvergenceVerdict = agree ? "CONVERGENT" : disagree ? "DIVERGENT" : "INCONCLUSIVE";

  const upsideSign = street.impliedUpsidePct > 0 ? "+" : "";
  const avgTargetStr = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(street.consensusTarget);
  const streetSummary = `${summarizeFirmCounts(street.firms)} — Avg Target ${avgTargetStr} (${upsideSign}${street.impliedUpsidePct.toFixed(1)}%)`;

  return {
    verdict,
    signalLabel: signal.label,
    signalScore: signal.score,
    streetSummary,
    reliabilitySummary: summarizeReliability(reliability),
    explanation: buildExplanation(verdict, signal, street, reliability, HIGH_RELIABILITY_THRESHOLD),
  };
}

function summarizeFirmCounts(firms: any[]): string {
  let buy = 0, hold = 0, sell = 0;
  for (const f of firms) {
    const r = f.rating.toLowerCase();
    if (r.includes('buy') || r.includes('outperform') || r.includes('overweight')) buy++;
    else if (r.includes('sell') || r.includes('underperform') || r.includes('underweight')) sell++;
    else hold++; // anything else is hold
  }
  return `${buy} Buy / ${hold} Hold / ${sell} Sell`;
}

function summarizeReliability(reliability: AccuracyStats): string {
  if (reliability.status !== "ok" || reliability.hitRate === null) {
    return "Insufficient data";
  }
  return `${reliability.hitRate.toFixed(1)}% correct, n=${reliability.sampleSize}`;
}

function buildExplanation(
  verdict: ConvergenceVerdict,
  signal: { label: string; score: number },
  street: StreetSheet,
  reliability: AccuracyStats,
  highRelThreshold: number
): string {
  if (verdict === "CONVERGENT") {
    const reliabilityDesc = reliability.status === "ok" && reliability.hitRate !== null
      ? `Historical reliability at this confidence level: ${reliability.hitRate > highRelThreshold ? "moderate-high" : "moderate"} (${reliability.hitRate.toFixed(0)}%, n=${reliability.sampleSize}).`
      : "Not enough resolved history yet to weight this further.";
    return `Technical signal and institutional consensus agree. ${reliabilityDesc}`;
  }
  if (verdict === "DIVERGENT") {
    return `Price action and Street positioning disagree. This is either an early move ahead of consensus, or a setup the Street already expects to fade. Proceed at reduced conviction; watch for the next rating action from covering firms.`;
  }
  return `No clear read either way — treat both the technical signal and Street data as weak evidence individually.`;
}
