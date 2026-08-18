export interface QuoteLiteData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  currency: string;
}

export interface QuoteData {
  ticker: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  marketCap: number;
  volume: number;
  avgVolume: number;
  high52: number;
  low52: number;
  pe: number;
  eps: number;
  dividendYield: number;
}

export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  currency: string;
}

export interface IndicatorData {
  trend: {
    ema20: number;
    ema50: number;
    ema200: number;
    supertrend: 'Bullish' | 'Bearish';
    adx?: number;
  };
  momentum: {
    rsi: number;
    stochRsi: number;
    macd: { MACD: number; signal: number; histogram: number };
    cci: number;
    williamsR: number;
  };
  volatility: {
    bb: { lower: number; middle: number; upper: number; width: number };
    atr: number;
    historicalVolPct: number;
  };
  volume: {
    obv: number;
    vwap: number;
    relVolume: number;
  };
}

export interface SignalData {
  compositeScore: number;
  label: 'Strong Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strong Bearish';
  confidence: 'High' | 'Moderate' | 'Low' | number | any;
  regime: 'Trending' | 'Ranging';
  breakdown: {
    trendScore: number;
    momentumScore: number;
    volatilityScore: number;
    volumeScore: number;
  };
  evidence: string[];
  conflicting: string[];
  modelVersion?: string;
  formulaVersion?: string;
}

export interface NewsItem {
  headline: string;
  source: string;
  time: string;
  link: string;
  sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
}

export interface StockData {
  quote: QuoteData;
  historical: HistoricalData[];
  indicators: IndicatorData;
  signal: SignalData;
  news: NewsItem[];

}

export interface WatchlistItem {
  ticker: string;
  added_at: string;
}

export interface MarketSnapshotItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface StreetFirmRating {
  firm: string;
  rating: "Buy" | "Hold" | "Sell" | "Outperform" | "Underperform" | string;
  targetPrice: number;
  asOfDate: string;
}

export interface StreetSheet {
  ticker: string;
  source: "trendlyne" | "benzinga";
  sourceUrl: string;
  fetchedAt: string;
  consensusRating: string;
  consensusTarget: number;
  currentPrice: number;
  impliedUpsidePct: number;
  firms: StreetFirmRating[];
  status: "ok" | "stale_cache" | "unavailable";
}

export interface AccuracyStats {
  ticker?: string;
  hitRate: number | null;
  sampleSize: number;
  status: "ok" | "insufficient_data";
  windowDays: number;
}

export type ConvergenceVerdict = "CONVERGENT" | "DIVERGENT" | "INCONCLUSIVE";

export interface ConvergenceResult {
  verdict: ConvergenceVerdict;
  signalLabel: string;
  signalScore: number;
  streetSummary: string;
  reliabilitySummary: string;
  explanation: string;
}
