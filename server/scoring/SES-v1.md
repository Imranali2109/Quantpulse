# QuantPulse SES v1 Implementation Spec

## Purpose
This defines the first deterministic scoring system for QuantPulse (SES v1.0.0).

## 1) Core Data Flow
Raw market data -> indicator calculation -> raw indicator values -> normalization -> category subscores -> composite score -> confidence score -> evidence and conflicts -> final response

## 2) Engineering Rules
- Indicators are observations, not scores.
- Scores must be normalized before being combined.
- Weights live in `weights.ts`.
- Explanation never changes the score.
- Confidence is not the same as score.
- The same inputs always produce the same outputs.

## 3) Normalization
- All indicators are converted to a 0-100 scale.
- 0 means weakest possible reading, 100 means strongest.
- 50 means neutral.

## 4) Indicator Scoring Formulas
- **Trend**: Weighted composite of EMA20, EMA50, EMA200, Supertrend, ADX.
- **Momentum**: Weighted composite of RSI14, MACD histogram, CCI20, Williams %R.
- **Volume**: Weighted composite of OBV, VWAP, relative volume.
- **Volatility**: Weighted composite of ATR14, historical volatility, Bollinger bandwidth.

## 5) Composite Score Formula
- Combines Trend, Momentum, Volume, Volatility based on the active market regime's `WeightProfile`.
- Trending Regime: Higher weight on Trend.
- Ranging Regime: Higher weight on Momentum.

## 6) Confidence
- Measured based on the agreement among sub-scores (low variance = high confidence).
- Penalties applied for conflicting signals (e.g., Supertrend vs EMA50 mismatch).
- Penalties applied for missing data (e.g., ADX missing).
- Bonus applied for regime clarity.

## 7) Output Object
- Every analysis output is stamped with `modelVersion`, `formulaVersion`, and `weightProfile` to guarantee complete reproducibility and backtest reliability.
