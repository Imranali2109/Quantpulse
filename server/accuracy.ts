import db from './db';
import YahooFinance from 'yahoo-finance2';
import { withCache } from './cache';
import { withRetry } from './utils';

const yahooFinance = new YahooFinance();

// 10 trading days represents roughly two calendar weeks. We picked this window because
// it's long enough to capture meaningful price action following a technical signal, 
// but short enough to isolate the effect before unrelated market events take over.
const FORWARD_WINDOW_DAYS = 10;

interface BacktestRow {
  ticker: string;
  date: string;
  label: "Bullish" | "Bearish" | "Neutral";
  priceAtSignal: number;
  forwardPrice: number | null;
  realizedReturnPct: number | null;
  correct: boolean | null;
}

function tradingDaysBetween(startDateStr: string, endDate: Date): number {
  const start = new Date(startDateStr);
  let days = 0;
  let curr = new Date(start);
  while (curr < endDate) {
    curr.setDate(curr.getDate() + 1);
    const dayOfWeek = curr.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // naive trading days (skipping weekends)
      days++;
    }
  }
  return days;
}

async function resolveForwardReturn(row: BacktestRow): Promise<BacktestRow> {
  const today = new Date();
  const daysSinceSignal = tradingDaysBetween(row.date, today);
  if (daysSinceSignal < FORWARD_WINDOW_DAYS) return row; // not resolvable yet

  try {
    const d = new Date(row.date);
    d.setDate(d.getDate() - 5); // start a bit before to ensure we get the sequence
    const historical = await withCache(`accuracy_chart_${row.ticker}_${row.date}`, 86400, async () => {
      const res = await withRetry(() => yahooFinance.chart(row.ticker, { period1: d, interval: '1d' }));
      return res.quotes;
    });

    // Find the price N trading days after the signal date
    // (We find the index of the signal date, then go forward FORWARD_WINDOW_DAYS)
    const signalDateStr = row.date.split('T')[0];
    const indexAtSignal = historical.findIndex(q => q.date.toISOString().startsWith(signalDateStr));
    
    if (indexAtSignal === -1) return row;
    
    const targetIndex = indexAtSignal + FORWARD_WINDOW_DAYS;
    if (targetIndex >= historical.length) return row; // data gap

    const forwardPrice = historical[targetIndex].close;
    if (forwardPrice === null) return row;

    const realizedReturnPct = ((forwardPrice - row.priceAtSignal) / row.priceAtSignal) * 100;
    let correct = false;
    
    if (row.label === "Bullish") {
      correct = realizedReturnPct > 0;
    } else if (row.label === "Bearish") {
      correct = realizedReturnPct < 0;
    } else {
      correct = Math.abs(realizedReturnPct) < 2; // Neutral is correct if flat
    }

    return { ...row, forwardPrice, realizedReturnPct, correct };
  } catch (err) {
    console.error(`Failed to resolve forward return for ${row.ticker}:`, err);
    return row;
  }
}

export async function getAccuracyStats(ticker?: string) {
  // Pull from DB
  let rows: any[];
  if (ticker) {
    rows = db.prepare('SELECT ticker, date, label, priceAtSignal FROM signal_history WHERE ticker = ?').all(ticker);
  } else {
    rows = db.prepare('SELECT ticker, date, label, priceAtSignal FROM signal_history').all();
  }
  
  if (rows.length === 0) {
    return { status: "insufficient_data" as const, sampleSize: 0, windowDays: FORWARD_WINDOW_DAYS, hitRate: null };
  }

  // Map to BacktestRow and resolve
  const backtestRows: BacktestRow[] = rows.map(r => ({
    ticker: r.ticker,
    date: r.date,
    label: r.label as any,
    priceAtSignal: r.priceAtSignal || 0, // Fallback if missing
    forwardPrice: null,
    realizedReturnPct: null,
    correct: null
  })).filter(r => r.priceAtSignal > 0);

  const resolvedRowsPromises = backtestRows.map(resolveForwardReturn);
  const resolved = await Promise.all(resolvedRowsPromises);
  
  const fullyResolved = resolved.filter(r => r.correct !== null);

  const sampleSize = fullyResolved.length;
  if (sampleSize < 15) {
    return { status: "insufficient_data" as const, sampleSize, windowDays: FORWARD_WINDOW_DAYS, hitRate: null };
  }

  const hitRate = (fullyResolved.filter(r => r.correct).length / sampleSize) * 100;
  
  return {
    status: "ok" as const,
    hitRate: parseFloat(hitRate.toFixed(1)),
    sampleSize,
    windowDays: FORWARD_WINDOW_DAYS
  };
}
