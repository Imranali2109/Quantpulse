import { RawIndicatorSnapshot } from "./interfaces";
import { INDICATOR_REGISTRY } from "./indicator-registry";

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function normalizeIndicators(raw: RawIndicatorSnapshot): Record<string, number> {
  const normalized: Record<string, number> = {};
  
  for (const ind of INDICATOR_REGISTRY) {
    let val = 50;
    switch(ind.id) {
      case "ema20": val = raw.price >= raw.ema20 ? 100 : 0; break;
      case "ema50": val = raw.price >= raw.ema50 ? 100 : 0; break;
      case "ema200": val = raw.price >= raw.ema200 ? 100 : 0; break;
      case "supertrend": val = raw.supertrend === "Bullish" ? 100 : 0; break;
      case "adx14": val = raw.adx14 !== undefined ? clamp(raw.adx14, 0, 100) : 50; break;
      case "rsi14": val = clamp(raw.rsi14, 0, 100); break;
      case "macdHistogram": val = sigmoid(raw.macdHistogram * 10) * 100; break;
      case "cci20": val = clamp((raw.cci20 + 100) / 2, 0, 100); break;
      case "williamsR14": val = clamp(raw.williamsR14 + 100, 0, 100); break;
      case "vwap": val = raw.price >= raw.vwap ? 100 : 0; break;
      case "obv": val = 50; break; // Simplified for now
      case "relVolume": val = clamp(raw.relVolume * 50, 0, 100); break;
      case "atr14": val = clamp(raw.atr14, 0, 100); break;
      case "historicalVolPct": val = clamp(100 - raw.historicalVolPct, 0, 100); break;
      case "bbWidth": val = clamp(raw.bbWidth * 100, 0, 100); break;
    }
    normalized[ind.id] = val;
  }
  
  // Maintain backward compatibility for other modules during refactoring
  normalized.rsiScore = normalized.rsi14;
  normalized.ema20Score = normalized.ema20;
  normalized.ema50Score = normalized.ema50;
  normalized.ema200Score = normalized.ema200;
  normalized.supertrendScore = normalized.supertrend;
  normalized.macdScore = normalized.macdHistogram;
  normalized.cciScore = normalized.cci20;
  normalized.williamsRScore = normalized.williamsR14;
  normalized.vwapScore = normalized.vwap;
  normalized.obvScore = normalized.obv;
  normalized.relVolumeScore = normalized.relVolume;
  normalized.historicalVolScore = normalized.historicalVolPct;
  normalized.bbWidthScore = normalized.bbWidth;
  normalized.atrScore = normalized.atr14;
  normalized.adxScore = normalized.adx14;

  return normalized;
}
