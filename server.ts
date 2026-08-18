import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import YahooFinance from 'yahoo-finance2';
import { GoogleGenAI } from '@google/genai';
import { computeIndicators, computeSignal, buildRawSnapshot } from './server/indicators';
import { runScoringEngine } from './server/scoring/engine';
import { withCache } from './server/cache';
import db, { getWatchlist, addWatchlist, removeWatchlist } from './server/db';
import { getAccuracyStats } from './server/accuracy';
import { getStreetSheet } from './server/street-sheet';
import { computeConvergence } from './server/convergence';
import { withRetry } from './server/utils';
import { z } from 'zod';

const yahooFinance = new YahooFinance();
// ai unused temporarily per descoping, left instantiated for future AI modules
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });

function detectMarket(ticker: string): "IN" | "US" {
  return ticker.endsWith('.NS') || ticker.endsWith('.BO') ? "IN" : "US";
}

function unwrapOr<T>(result: PromiseSettledResult<T>, fallback: T): T {
  if (result.status === 'fulfilled') return result.value;
  console.warn("Promise rejected, using fallback:", result.reason);
  return fallback;
}

const TickerSchema = z.object({ ticker: z.string().min(1).toUpperCase() });
const TimeframeSchema = z.object({ timeframe: z.enum(['1D', '1W', '1M', '3M', '6M', '1Y']).optional().default('1Y') });

class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

const rateLimits = new Map<string, { count: number, resetAt: number }>();
app.use('/api', (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const key = `${ip}:${req.path}`;
  const now = Date.now();
  const windowMs = 10000; // 10 seconds
  const maxRequests = 10; // max 10 requests per 10 seconds per endpoint
  const record = rateLimits.get(key);
  
  if (!record || now > record.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    record.count++;
    if (record.count > maxRequests) {
      return res.status(429).json({ error: 'Too many requests' });
    }
  }
  next();
});


  // Error handling middleware
  const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation Error", details: (err as any).errors });
    }
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  };

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  
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
        volume: data.volume,
        currency: data.currency
      });
    } catch (e) { next(e); }
  });

  app.get("/api/quote/:ticker", async (req, res, next) => {
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
      res.json(data);
    } catch (e) { next(e); }
  });

  app.get("/api/chart/:ticker", async (req, res, next) => {
    try {
      const { ticker } = TickerSchema.parse(req.params);
      const { timeframe } = TimeframeSchema.parse(req.query);
      
      const data = await withCache(`chart_${ticker}_${timeframe}`, 300, async () => {
        const queryOptions: any = {};
        const d = new Date();
        
        if (timeframe === '1D') { 
          d.setDate(d.getDate() - 2); 
          queryOptions.period1 = d; 
          queryOptions.interval = '5m'; 
        }
        else if (timeframe === '1W') { 
          d.setDate(d.getDate() - 8); 
          queryOptions.period1 = d; 
          queryOptions.interval = '15m'; 
        }
        else if (timeframe === '1M') { 
          d.setMonth(d.getMonth() - 1); d.setDate(d.getDate() - 1);
          queryOptions.period1 = d; 
          queryOptions.interval = '1d'; 
        }
        else if (timeframe === '3M') { 
          d.setMonth(d.getMonth() - 3); d.setDate(d.getDate() - 1);
          queryOptions.period1 = d; 
          queryOptions.interval = '1d'; 
        }
        else if (timeframe === '6M') { 
          d.setMonth(d.getMonth() - 6); d.setDate(d.getDate() - 1);
          queryOptions.period1 = d; 
          queryOptions.interval = '1d'; 
        }
        else { 
          d.setFullYear(d.getFullYear() - 1); d.setDate(d.getDate() - 1);
          queryOptions.period1 = d; 
          queryOptions.interval = '1d'; 
        }
        
        const result: any = await withRetry(() => yahooFinance.chart(ticker, queryOptions));
        return (result.quotes || []).map((h: any) => ({
          date: h.date.toISOString(),
          open: h.open,
          high: h.high,
          low: h.low,
          close: h.close,
          volume: h.volume
        }));
      });
      res.json(data);
    } catch (e) { next(e); }
  });

  async function getAnalysisData(ticker: string) {
    return await withCache(`analysis_${ticker}`, 300, async () => {
      let period1 = new Date();
      period1.setFullYear(period1.getFullYear() - 1);
      const chartRes = await withRetry(() => yahooFinance.chart(ticker, { period1, interval: '1d' }));
      
      const historical = chartRes.quotes.filter(q => q.close !== null).map(q => ({
        date: q.date.toISOString(),
        open: q.open || 0,
        high: q.high || 0,
        low: q.low || 0,
        close: q.close || 0,
        volume: q.volume || 0
      }));

      if (historical.length < 50) {
        throw new AppError(400, "Insufficient historical data for technical analysis");
      }

      const indicators = computeIndicators(historical);
      const currentPrice = historical[historical.length - 1].close;
      const rawSnapshot = buildRawSnapshot(historical, indicators);
      const sesOutput = runScoringEngine(rawSnapshot);
      delete (indicators as any)._rawCloses;

      // Map SESOutput to SignalData for UI compatibility
      const signal = {
        compositeScore: sesOutput.scores.compositeScore,
        label: sesOutput.label,
        confidence: sesOutput.confidence.confidence,
        regime: sesOutput.marketRegime,
        breakdown: {
          trendScore: sesOutput.scores.trendScore,
          momentumScore: sesOutput.scores.momentumScore,
          volatilityScore: sesOutput.scores.volatilityScore,
          volumeScore: sesOutput.scores.volumeScore,
        },
        evidence: sesOutput.evidence,
        conflicting: sesOutput.conflicts,
        modelVersion: sesOutput.modelVersion,
        formulaVersion: sesOutput.formulaVersion,
      };

      // Save to history DB (background)
      try {
        const signalDate = historical[historical.length - 1].date;
        const analysisId = `${ticker}-${signalDate}`;
        const stmt = db.prepare(`
          INSERT OR IGNORE INTO signal_history 
          (ticker, date, score, label, priceAtSignal, signal_text, analysis_id, model_version, formula_version, weight_profile, market_regime, composite_score, confidence_score, created_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `);
        stmt.run(
          ticker, signalDate, signal.compositeScore, signal.label, currentPrice, signal.label,
          analysisId, sesOutput.modelVersion, sesOutput.formulaVersion, sesOutput.weightProfile,
          sesOutput.marketRegime, sesOutput.scores.compositeScore, sesOutput.confidence.confidence
        );
      } catch (dbErr) {
        console.error("Failed to log signal history:", dbErr);
      }
      
      return { indicators, signal };
    });
  }

  app.get("/api/analysis/:ticker", async (req, res, next) => {
    try {
      const { ticker } = TickerSchema.parse(req.params);
      const data = await getAnalysisData(ticker);
      res.json(data);
    } catch (e) { next(e); }
  });

  app.get("/api/analysis/:ticker/convergence", async (req, res, next) => {
    try {
      const { ticker } = TickerSchema.parse(req.params);
      const market = detectMarket(ticker);
      
      const [analysisResult, streetResult, reliabilityResult] = await Promise.allSettled([
        getAnalysisData(ticker),
        getStreetSheet(ticker, market),
        getAccuracyStats(ticker)
      ]);

      const signalData = unwrapOr(analysisResult, null);
      const defaultSignal = { label: "Neutral", score: 50 };
      const signal = signalData ? { label: signalData.signal.label, score: signalData.signal.compositeScore } : defaultSignal;

      const defaultStreet = { 
        ticker, source: "benzinga" as const, sourceUrl: "", fetchedAt: new Date().toISOString(), 
        consensusRating: "N/A", consensusTarget: 0, currentPrice: 0, impliedUpsidePct: 0, 
        firms: [], status: "unavailable" as const 
      };
      const street = unwrapOr(streetResult, defaultStreet);

      const defaultReliability = { status: "insufficient_data" as const, sampleSize: 0, windowDays: 10, hitRate: null };
      const reliability = unwrapOr(reliabilityResult, defaultReliability);

      const result = computeConvergence(signal, street, reliability);
      res.json({ convergence: result, street });
    } catch (e) { next(e); }
  });

  app.get("/api/accuracy/:ticker", async (req, res, next) => {
    try {
      const { ticker } = TickerSchema.parse(req.params);
      const stats = await getAccuracyStats(ticker);
      res.json(stats);
    } catch (e) { next(e); }
  });

  app.get("/api/news/:ticker", async (req, res, next) => {
    try {
      const { ticker } = TickerSchema.parse(req.params);
      const data = await withCache(`news_${ticker}`, 600, async () => {
        const searchResult = await withRetry(() => yahooFinance.search(ticker, { newsCount: 8 }));
        return (searchResult.news || []).map(n => ({
          headline: n.title,
          source: n.publisher,
          time: n.providerPublishTime instanceof Date ? n.providerPublishTime.toISOString() : (n.providerPublishTime ? new Date(n.providerPublishTime * 1000).toISOString() : new Date().toISOString()),
          link: n.link,
        }));
      });
      res.json(data);
    } catch (e) { next(e); }
  });

  app.get("/api/watchlist", (req, res, next) => {
    try {
      res.json(getWatchlist());
    } catch (e) { next(e); }
  });

  app.post("/api/watchlist", (req, res, next) => {
    try {
      const { ticker } = TickerSchema.parse(req.body);
      addWatchlist(ticker);
      res.json({ success: true, ticker });
    } catch (e) { next(e); }
  });

  app.delete("/api/watchlist/:ticker", (req, res, next) => {
    try {
      const { ticker } = TickerSchema.parse(req.params);
      removeWatchlist(ticker);
      res.json({ success: true, ticker });
    } catch (e) { next(e); }
  });

  // Global market snapshot
  app.get("/api/market-snapshot", async (req, res, next) => {
    try {
      const data = await withCache('market_snapshot', 60, async () => {
        const symbols = ["^GSPC", "^IXIC", "^DJI"];
        const quotes = await Promise.all(symbols.map(sym => withRetry(() => yahooFinance.quote(sym)).catch(() => null)));
        return quotes.filter(q => q != null).map((q: any) => ({
          symbol: q.symbol,
          name: q.shortName || q.symbol,
          price: q.regularMarketPrice,
          change: q.regularMarketChange,
          changePercent: q.regularMarketChangePercent
        }));
      });
      res.json(data);
    } catch (e) { next(e); }
  });

  app.use(errorHandler);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
