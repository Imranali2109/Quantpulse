import os

with open('server.ts', 'r') as f:
    server_code = f.read()

quote_lite = """
  app.get("/api/quote-lite/:ticker", async (req, res, next) => {
    try {
      const { ticker } = TickerSchema.parse(req.params);
      const data = await withCache(`quote_${ticker}`, 60, async () => {
        const quote = await withRetry(() => yahooFinance.quote(ticker));
        return {
          ticker,
          name: quote.longName || quote.shortName || ticker,
          exchange: quote.exchange || 'N/A',
          sector: (quote as any).sector || 'N/A',
          industry: (quote as any).industry || 'N/A',
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
          marketCap: quote.marketCap || 0,
          volume: quote.regularMarketVolume || 0,
          avgVolume: quote.averageDailyVolume3Month || 0,
          high52: quote.fiftyTwoWeekHigh || 0,
          low52: quote.fiftyTwoWeekLow || 0,
          pe: quote.trailingPE || quote.forwardPE || 0,
          eps: quote.epsTrailingTwelveMonths || 0,
          dividendYield: quote.trailingAnnualDividendYield || 0,
          currency: quote.currency || 'USD',
        };
      });
      res.json({
        ticker: data.ticker,
        name: data.name,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        volume: data.volume
      });
    } catch (e) { next(e); }
  });
"""

if "/api/quote-lite/:ticker" not in server_code:
    server_code = server_code.replace('app.get("/api/quote/:ticker", async (req, res, next) => {', quote_lite + '\n  app.get("/api/quote/:ticker", async (req, res, next) => {')

with open('server.ts', 'w') as f:
    f.write(server_code)

os.makedirs('src/lib', exist_ok=True)
with open('src/lib/useHeartbeat.ts', 'w') as f:
    f.write('''import { useEffect, useRef } from 'react';

export function useHeartbeat(callback: () => void, intervalMs: number, enabled = true) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;
    
    // Check visibility state so we don't poll in the background endlessly
    let intervalId: any;
    
    const tick = () => {
      if (document.visibilityState === 'visible') {
        savedCallback.current();
      }
    };
    
    // Fire immediately if visible
    if (document.visibilityState === 'visible') {
      // tick(); // don't fire immediately here, the main useEffect will do initial fetch, this is just a heartbeat. Or maybe we do.
      // wait, the problem asks for polling interval.
    }
    
    intervalId = setInterval(tick, intervalMs);
    
    return () => clearInterval(intervalId);
  }, [intervalMs, enabled]);
}

export type StalenessState = 'LIVE' | 'REFRESHING' | 'STALE';

export function useStaleness(lastUpdatedAt: number | null, isRefreshing: boolean, staleThresholdMs: number = 60000): StalenessState {
  if (isRefreshing) return 'REFRESHING';
  if (!lastUpdatedAt) return 'STALE';
  
  const now = Date.now();
  if (now - lastUpdatedAt > staleThresholdMs) return 'STALE';
  
  return 'LIVE';
}
''')
