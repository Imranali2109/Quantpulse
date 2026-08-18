import { RawIndicatorSnapshot } from "./interfaces";

export type IndicatorCategory = "Trend" | "Momentum" | "Volume" | "Volatility";

export interface IndicatorDefinition {
  id: string;
  name: string;
  category: IndicatorCategory;
  description: string;
  isDirect: boolean;
  inputSource: string;
  outputFormat: "number" | "string";
  extractFromRaw: (raw: RawIndicatorSnapshot) => number | string | undefined;
}

export const INDICATOR_REGISTRY: IndicatorDefinition[] = [
  {
    id: "ema20",
    name: "EMA 20",
    category: "Trend",
    description: "20-period Exponential Moving Average",
    isDirect: false,
    inputSource: "closes",
    outputFormat: "number",
    extractFromRaw: (raw) => raw.ema20
  },
  {
    id: "ema50",
    name: "EMA 50",
    category: "Trend",
    description: "50-period Exponential Moving Average",
    isDirect: false,
    inputSource: "closes",
    outputFormat: "number",
    extractFromRaw: (raw) => raw.ema50
  },
  {
    id: "ema200",
    name: "EMA 200",
    category: "Trend",
    description: "200-period Exponential Moving Average",
    isDirect: false,
    inputSource: "closes",
    outputFormat: "number",
    extractFromRaw: (raw) => raw.ema200
  },
  {
    id: "supertrend",
    name: "Supertrend",
    category: "Trend",
    description: "Supertrend indicator for trend direction",
    isDirect: false,
    inputSource: "high,low,close,atr",
    outputFormat: "string",
    extractFromRaw: (raw) => raw.supertrend
  },
  {
    id: "adx14",
    name: "ADX 14",
    category: "Trend",
    description: "14-period Average Directional Index",
    isDirect: false,
    inputSource: "high,low,close",
    outputFormat: "number",
    extractFromRaw: (raw) => raw.adx14
  },
  {
    id: "rsi14",
    name: "RSI 14",
    category: "Momentum",
    description: "14-period Relative Strength Index",
    isDirect: false,
    inputSource: "closes",
    outputFormat: "number",
    extractFromRaw: (raw) => raw.rsi14
  },
  {
    id: "macdHistogram",
    name: "MACD Histogram",
    category: "Momentum",
    description: "MACD Histogram (12, 26, 9)",
    isDirect: false,
    inputSource: "closes",
    outputFormat: "number",
    extractFromRaw: (raw) => raw.macdHistogram
  },
  {
    id: "cci20",
    name: "CCI 20",
    category: "Momentum",
    description: "20-period Commodity Channel Index",
    isDirect: false,
    inputSource: "high,low,close",
    outputFormat: "number",
    extractFromRaw: (raw) => raw.cci20
  },
  {
    id: "williamsR14",
    name: "Williams %R 14",
    category: "Momentum",
    description: "14-period Williams %R",
    isDirect: false,
    inputSource: "high,low,close",
    outputFormat: "number",
    extractFromRaw: (raw) => raw.williamsR14
  },
  {
    id: "vwap",
    name: "VWAP",
    category: "Volume",
    description: "Volume Weighted Average Price",
    isDirect: false,
    inputSource: "high,low,close,volume",
    outputFormat: "number",
    extractFromRaw: (raw) => raw.vwap
  },
  {
    id: "obv",
    name: "OBV",
    category: "Volume",
    description: "On-Balance Volume",
    isDirect: false,
    inputSource: "close,volume",
    outputFormat: "number",
    extractFromRaw: (raw) => raw.obv
  },
  {
    id: "relVolume",
    name: "Relative Volume",
    category: "Volume",
    description: "Current volume / 20-period average volume",
    isDirect: false,
    inputSource: "volume",
    outputFormat: "number",
    extractFromRaw: (raw) => raw.relVolume
  },
  {
    id: "atr14",
    name: "ATR 14",
    category: "Volatility",
    description: "14-period Average True Range",
    isDirect: false,
    inputSource: "high,low,close",
    outputFormat: "number",
    extractFromRaw: (raw) => raw.atr14
  },
  {
    id: "historicalVolPct",
    name: "Historical Volatility %",
    category: "Volatility",
    description: "20-day historical volatility percentile",
    isDirect: false,
    inputSource: "closes",
    outputFormat: "number",
    extractFromRaw: (raw) => raw.historicalVolPct
  },
  {
    id: "bbWidth",
    name: "Bollinger Band Width",
    category: "Volatility",
    description: "Bollinger Band Width (20, 2)",
    isDirect: false,
    inputSource: "closes",
    outputFormat: "number",
    extractFromRaw: (raw) => raw.bbWidth
  }
];
