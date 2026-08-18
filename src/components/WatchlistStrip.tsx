import React, { useEffect, useState } from 'react';
import { WatchlistItem, QuoteData } from '../types';
import { formatCurrency } from '../lib/utils';
import { X, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function WatchlistStrip({ onSelect }: { onSelect: (ticker: string) => void }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const res = await fetch('/api/watchlist');
      const data = await res.json();
      setWatchlist(data);
      
      for (const item of data) {
        fetchQuote(item.ticker);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuote = async (ticker: string) => {
    try {
      const res = await fetch(`/api/quote/${ticker}`);
      if (res.ok) {
        const data = await res.json();
        setQuotes(prev => ({ ...prev, [ticker]: data }));
      }
    } catch (e) {
      // silent
    }
  };

  const remove = async (ticker: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/watchlist/${ticker}`, { method: 'DELETE' });
      setWatchlist(prev => prev.filter(i => i.ticker !== ticker));
      const newQuotes = { ...quotes };
      delete newQuotes[ticker];
      setQuotes(newQuotes);
    } catch (e) {}
  };

  if (loading) return null;

  return (
    <div className="h-10 flex items-center bg-paper border-t border-rule overflow-x-auto custom-scrollbar shrink-0 px-2 font-mono text-[11px] uppercase z-20 shadow-[0_-1px_4px_rgba(0,0,0,0.05)]">
      <span className="font-bold text-ink-70 px-3 tracking-widest shrink-0 border-r border-rule/50">TICKER TAPE</span>
      <div className="flex items-center min-w-max">
        {watchlist.map((item, i) => {
          const quote = quotes[item.ticker];
          const isUp = quote && quote.change >= 0;
          return (
            <div 
              key={item.ticker}
              onClick={() => onSelect(item.ticker)}
              className="flex items-center gap-3 px-4 py-1 cursor-pointer hover:bg-paper-dim transition-colors group border-r border-rule/30 last:border-0"
            >
              <span className="font-bold text-ink">{item.ticker}</span>
              {quote ? (
                <span className={clsx(isUp ? 'text-bull' : 'text-bear')}>
                  {formatCurrency(quote.price, quote.currency)} {isUp ? '▲' : '▼'}
                </span>
              ) : (
                <Loader2 className="w-3 h-3 animate-spin text-ink-45" />
              )}
              <button onClick={(e) => remove(item.ticker, e)} className="opacity-0 group-hover:opacity-100 hover:text-signal text-ink-45 transition-opacity">
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
        {watchlist.length === 0 && <span className="px-4 text-ink-45">[ EMPTY ]</span>}
      </div>
    </div>
  );
}
