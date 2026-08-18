import { EMA, MACD, RSI, BollingerBands, ADX, StochasticRSI, CCI, WilliamsR, OBV, VWAP, ATR } from 'technicalindicators';
import { IndicatorData, SignalData } from '../src/types';

function calculateStdDev(arr: number[]): number {
  const n = arr.length;
  if (n === 0) return 0;
  const mean = arr.reduce((a, b) => a + b) / n;
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  return Math.sqrt(variance);
}

function calculateZScore(current: number, arr: number[]): number {
  const stdDev = calculateStdDev(arr);
  if (stdDev === 0) return 0;
  const mean = arr.reduce((a, b) => a + b) / arr.length;
  return (current - mean) / stdDev;
}

export function computeIndicators(historical: any[]): IndicatorData {
  if (historical.length < 50) {
    throw new Error("Not enough data for indicators");
  }

  const closes = historical.map(d => d.close);
  const highs = historical.map(d => d.high);
  const lows = historical.map(d => d.low);
  const volumes = historical.map(d => d.volume);

  const ema20 = EMA.calculate({ period: 20, values: closes }).pop() || 0;
  const ema50 = EMA.calculate({ period: 50, values: closes }).pop() || 0;
  const ema200 = closes.length >= 200 ? (EMA.calculate({ period: 200, values: closes }).pop() || 0) : 0;
  
  const macdResult = MACD.calculate({ fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false, values: closes }).pop() || { MACD: 0, signal: 0, histogram: 0 };
  const rsi = RSI.calculate({ period: 14, values: closes }).pop() || 50;
  
  const bb = BollingerBands.calculate({ period: 20, stdDev: 2, values: closes }).pop() || { lower: 0, middle: 0, upper: 0 };
  
  const stochRsiData = StochasticRSI.calculate({ rsiPeriod: 14, stochasticPeriod: 14, kPeriod: 3, dPeriod: 3, values: closes }).pop() || { stochRSI: 50 };
  const stochRsi = stochRsiData.stochRSI || 50;

  const cci = CCI.calculate({ period: 20, high: highs, low: lows, close: closes }).pop() || 0;
  const williamsR = WilliamsR.calculate({ period: 14, high: highs, low: lows, close: closes }).pop() || -50;
  
  const obv = OBV.calculate({ close: closes, volume: volumes }).pop() || 0;
  const vwap = VWAP.calculate({ high: highs, low: lows, close: closes, volume: volumes }).pop() || 0;
  const atr = ATR.calculate({ period: 14, high: highs, low: lows, close: closes }).pop() || 0;
  const adxResult = ADX.calculate({ period: 14, high: highs, low: lows, close: closes }).pop();
  const adx = adxResult ? adxResult.adx : 50;

  // True Supertrend calculation
  let supertrend = 'Neutral';
  if (historical.length > 20) {
    const period = 10;
    const multiplier = 3;
    let basicUpperBand = (highs[highs.length-1] + lows[lows.length-1]) / 2 + multiplier * atr;
    let basicLowerBand = (highs[highs.length-1] + lows[lows.length-1]) / 2 - multiplier * atr;
    // Simplification for stateless run: normally Supertrend carries previous state.
    // As a better proxy than just EMA50, we use a basic ATR trailing stop logic.
    // But since we can't easily loop state here without writing a full indicator, we'll implement a miniature version:
    let finalUpper = 0, finalLower = 0, trend = 1;
    for(let i = historical.length - period; i < historical.length; i++) {
        const hl2 = (highs[i] + lows[i]) / 2;
        const curAtr = ATR.calculate({period: 10, high: highs.slice(0, i+1), low: lows.slice(0, i+1), close: closes.slice(0, i+1)}).pop() || 0;
        const bub = hl2 + multiplier * curAtr;
        const blb = hl2 - multiplier * curAtr;
        if(i === historical.length - period) { finalUpper = bub; finalLower = blb; }
        else {
            finalUpper = bub < finalUpper || closes[i-1] > finalUpper ? bub : finalUpper;
            finalLower = blb > finalLower || closes[i-1] < finalLower ? blb : finalLower;
        }
        if (closes[i] > finalUpper) trend = 1;
        else if (closes[i] < finalLower) trend = -1;
    }
    supertrend = trend === 1 ? 'Bullish' : 'Bearish';
  }

  // True relVolume: current volume / 20-day average volume
  let relVolume = 1.0;
  if (volumes.length >= 20) {
    const avgVol = volumes.slice(-20).reduce((a, b) => a + b) / 20;
    relVolume = avgVol > 0 ? volumes[volumes.length - 1] / avgVol : 1.0;
  }

  // True historicalVolPct: 20-day annualized vol percent rank over last 252 days (or available)
  let historicalVolPct = 50;
  if (closes.length >= 22) {
    const returns = [];
    for (let i = 1; i < closes.length; i++) {
      returns.push(closes[i] / closes[i-1] - 1);
    }
    const rollingVols = [];
    for (let i = 20; i <= returns.length; i++) {
      const window = returns.slice(i-20, i);
      rollingVols.push(calculateStdDev(window) * Math.sqrt(252));
    }
    if (rollingVols.length > 0) {
      const currentVol = rollingVols[rollingVols.length - 1];
      let rank = 0;
      for (const v of rollingVols) {
        if (currentVol >= v) rank++;
      }
      historicalVolPct = (rank / rollingVols.length) * 100;
    }
  }

  return {
    trend: {
      ema20,
      ema50,
      ema200,
      supertrend,
      adx
    },
    momentum: {
      rsi,
      stochRsi,
      macd: { MACD: macdResult.MACD || 0, signal: macdResult.signal || 0, histogram: macdResult.histogram || 0 },
      cci,
      williamsR
    },
    volatility: {
      bb: { lower: bb.lower || 0, middle: bb.middle || 0, upper: bb.upper || 0, width: bb.upper && bb.lower && bb.middle ? (bb.upper - bb.lower) / bb.middle : 0 },
      atr,
      historicalVolPct
    },
    volume: {
      obv,
      vwap,
      relVolume
    },
    _rawCloses: closes // Hidden field for signal z-scores
  } as IndicatorData & { _rawCloses: number[] };
}

export function computeSignal(indicators: IndicatorData & { _rawCloses?: number[] }, currentPrice: number): SignalData {
  let evidence: string[] = [];
  let conflicting: string[] = [];
  
  const closes = indicators._rawCloses || [];
  const rsiZ = closes.length > 20 ? calculateZScore(indicators.momentum.rsi, RSI.calculate({ period: 14, values: closes })) : 0;
  
  // Dynamic regime definition based on BB Width vs its own historical percentile (we use width > 0.05 as a fallback)
  const isTrending = indicators.volatility.bb.width > 0.05;
  const regime: 'Trending' | 'Ranging' = isTrending ? 'Trending' : 'Ranging';

  // Regime-Adjusted Weighting
  const wTrend = isTrending ? 0.5 : 0.2;
  const wMomentum = isTrending ? 0.3 : 0.5;
  const wVolume = 0.1;
  const wVolatility = 0.1;

  let trendScore = 50;
  if (currentPrice > indicators.trend.ema50) { trendScore += 20; evidence.push("Above EMA50"); }
  else { trendScore -= 20; conflicting.push("Below EMA50"); }
  
  if (indicators.trend.supertrend === 'Bullish') { trendScore += 20; evidence.push("Supertrend Bullish"); }
  else { trendScore -= 20; conflicting.push("Supertrend Bearish"); }

  let momentumScore = 50;
  if (isTrending) {
    if (indicators.momentum.rsi > 55) { momentumScore += 20; evidence.push("Trend RSI Support"); }
    else if (indicators.momentum.rsi < 45) { momentumScore -= 20; conflicting.push("Trend RSI Weak"); }
  } else {
    // Mean reverting uses z-score of RSI
    if (rsiZ < -1.5) { momentumScore += 30; evidence.push("Oversold (Z-Score)"); }
    else if (rsiZ > 1.5) { momentumScore -= 30; conflicting.push("Overbought (Z-Score)"); }
  }

  if (indicators.momentum.macd.histogram > 0) { momentumScore += 10; evidence.push("MACD Positive"); }
  else { momentumScore -= 10; conflicting.push("MACD Negative"); }

  let volatilityScore = 50;
  if (indicators.volatility.historicalVolPct < 20) { volatilityScore += 20; evidence.push("Low Hist. Volatility"); }
  else if (indicators.volatility.historicalVolPct > 80) { volatilityScore -= 20; conflicting.push("High Hist. Volatility"); }

  let volumeScore = 50;
  if (currentPrice > indicators.volume.vwap) { volumeScore += 15; evidence.push("Above VWAP"); }
  else { volumeScore -= 15; conflicting.push("Below VWAP"); }
  
  if (indicators.volume.relVolume > 1.5) {
    if (currentPrice > closes[closes.length - 2]) { volumeScore += 20; evidence.push("High Volume Up-Day"); }
    else { volumeScore -= 20; conflicting.push("High Volume Down-Day"); }
  }

  trendScore = Math.max(0, Math.min(100, trendScore));
  momentumScore = Math.max(0, Math.min(100, momentumScore));
  volatilityScore = Math.max(0, Math.min(100, volatilityScore));
  volumeScore = Math.max(0, Math.min(100, volumeScore));

  const compositeScore = Math.round((trendScore * wTrend) + (momentumScore * wMomentum) + (volumeScore * wVolume) + (volatilityScore * wVolatility));
  
  let label: SignalData['label'] = 'Neutral';
  if (compositeScore >= 70) label = 'Strong Bullish';
  else if (compositeScore >= 55) label = 'Bullish';
  else if (compositeScore <= 30) label = 'Strong Bearish';
  else if (compositeScore <= 45) label = 'Bearish';

  return {
    compositeScore,
    label,
    confidence: Math.abs(compositeScore - 50) > 20 ? 'High' : (Math.abs(compositeScore - 50) > 10 ? 'Moderate' : 'Low'),
    regime,
    breakdown: {
      trendScore,
      momentumScore,
      volatilityScore,
      volumeScore
    },
    evidence: evidence.slice(0, 5),
    conflicting: conflicting.slice(0, 5)
  };
}

import { RawIndicatorSnapshot } from "./scoring/interfaces";

export function buildRawSnapshot(historical: any[], indicators: IndicatorData): RawIndicatorSnapshot {
  const current = historical[historical.length - 1];
  return {
    price: current.close,
    open: current.open,
    close: current.close,
    high: current.high,
    low: current.low,
    volume: current.volume,
    ema20: indicators.trend.ema20,
    ema50: indicators.trend.ema50,
    ema200: indicators.trend.ema200,
    rsi14: indicators.momentum.rsi,
    macdHistogram: indicators.momentum.macd.histogram,
    macdLine: indicators.momentum.macd.MACD,
    macdSignal: indicators.momentum.macd.signal,
    cci20: indicators.momentum.cci,
    williamsR14: indicators.momentum.williamsR,
    atr14: indicators.volatility.atr,
    vwap: indicators.volume.vwap,
    obv: indicators.volume.obv,
    relVolume: indicators.volume.relVolume,
    bbWidth: indicators.volatility.bb.width,
    historicalVolPct: indicators.volatility.historicalVolPct,
    supertrend: indicators.trend.supertrend as "Bullish" | "Bearish",
    adx14: indicators.trend.adx,
  };
}
