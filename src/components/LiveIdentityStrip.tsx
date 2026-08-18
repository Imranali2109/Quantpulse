import React from 'react';
import clsx from 'clsx';
import { QuoteLiteData } from '../types';
import { formatCurrency, formatNumber } from '../lib/utils';
import { StalenessState } from '../lib/useHeartbeat';

interface LiveIdentityStripProps {
  quote: QuoteLiteData | null;
  staleness: StalenessState;
  regime: 'Trending' | 'Ranging' | undefined;
}

export function LiveIdentityStrip({ quote, staleness, regime }: LiveIdentityStripProps) {
  if (!quote) {
    return <div className="h-16 border-b border-rule/30 flex items-center px-4 md:px-6 bg-paper animate-pulse" />;
  }

  const isUp = quote.change >= 0;
  
  let statusColor = "text-ink-45";
  let statusText = "STALE";
  let statusDot = "○";
  
  if (staleness === 'LIVE') {
    statusColor = "text-bull";
    statusText = "LIVE";
    statusDot = "●";
  } else if (staleness === 'REFRESHING') {
    statusColor = "text-ink";
    statusText = "REFRESHING";
    statusDot = "◐";
  }

  return (
    <div className="h-auto md:h-16 border-b border-rule/30 flex flex-col md:flex-row md:items-center justify-between px-4 md:px-6 py-3 md:py-0 bg-paper">
      <div className="flex items-center gap-4">
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-mono font-bold tracking-tight text-ink">{quote.ticker}</h1>
          <span className="text-sm font-sans text-ink-70 truncate max-w-[150px] md:max-w-[300px]">{quote.name}</span>
        </div>
        <div className="hidden md:flex items-center gap-3 ml-4 pl-4 border-l border-rule/30">
          <div className="text-2xl font-mono text-ink tracking-tight">
            {formatCurrency(quote.price, quote.currency)}
          </div>
          <div className={clsx("text-sm font-mono flex items-center gap-1", isUp ? "text-bull" : "text-bear")}>
            <span>{isUp ? '+' : ''}{quote.change.toFixed(2)}</span>
            <span>({isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 md:mt-0 pt-3 md:pt-0 border-t border-rule/30 md:border-0 justify-between md:justify-end w-full md:w-auto">
        <div className="md:hidden flex items-baseline gap-3">
          <div className="text-lg font-mono text-ink">{formatCurrency(quote.price, quote.currency)}</div>
          <div className={clsx("text-xs font-mono", isUp ? "text-bull" : "text-bear")}>
            {isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="text-[9px] font-sans font-bold text-ink-45 uppercase tracking-[0.1em]">Volume</span>
            <span className="text-xs font-mono text-ink">{formatNumber(quote.volume)}</span>
          </div>
          {regime && (
            <div className="flex flex-col text-right pl-4 border-l border-rule/30">
              <span className="text-[9px] font-sans font-bold text-ink-45 uppercase tracking-[0.1em]">Regime</span>
              <span className="text-xs font-mono text-ink uppercase">{regime}</span>
            </div>
          )}
          <div className={clsx("flex items-center gap-1.5 text-[10px] font-mono pl-4 border-l border-rule/30", statusColor)}>
            <span className={clsx(staleness === 'LIVE' ? "animate-pulse" : "")}>{statusDot}</span>
            <span>{statusText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
