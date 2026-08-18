import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Plus } from 'lucide-react';
import WatchlistStrip from './components/WatchlistStrip';
import PriceChart from './components/PriceChart';
import { SearchBar } from './components/SearchBar';
import { LiveIdentityStrip } from './components/LiveIdentityStrip';
import { ConvictionPanel } from './components/ConvictionPanel';
import { SignalEvidence } from './components/SignalEvidence';
import { EngineTrace } from './components/EngineTrace';
import { QuoteData, QuoteLiteData, HistoricalData, IndicatorData, SignalData, NewsItem, ConvergenceResult, StreetSheet } from './types';
import { formatCurrency, formatNumber } from './lib/utils';
import clsx from 'clsx';
import { Pane } from './components/ui/pane';
import { Badge } from './components/ui/badge';
import { StreetSheetPanel } from './components/StreetSheetPanel';
import { useHeartbeat, useStaleness } from './lib/useHeartbeat';

function useData<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const fetchFn = useCallback(async (isSilentRefresh = false) => {
    if (!url) return;
    
    const controller = new AbortController();
    
    if (!isSilentRefresh) setLoading(true);
    else setIsRefreshing(true);
    
    setError(null);
    
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      
      setData(d);
      setLastUpdatedAt(Date.now());
    } catch (e: any) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      if (!isSilentRefresh) setLoading(false);
      setIsRefreshing(false);
    }
    
    return () => controller.abort();
  }, [url]);

  useEffect(() => {
    fetchFn(false);
  }, [fetchFn]);

  return { data, loading, isRefreshing, error, lastUpdatedAt, refresh: () => fetchFn(true) };
}

export default function App() {
  const [symbol, setSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1Y');
  
  // Fast tier (5s)
  const { data: quote, isRefreshing: quoteRefreshing, lastUpdatedAt: quoteLastUpdated, refresh: refreshQuote } = useData<QuoteLiteData>(`/api/quote-lite/${symbol}`);
  useHeartbeat(refreshQuote, 5000, !!symbol);
  const quoteStaleness = useStaleness(quoteLastUpdated, quoteRefreshing, 15000);

  // Mid tier (30s)
  const { data: analysisRes, isRefreshing: analysisRefreshing, lastUpdatedAt: analysisLastUpdated, refresh: refreshAnalysis } = useData<{indicators: IndicatorData, signal: SignalData}>(`/api/analysis/${symbol}`);
  useHeartbeat(refreshAnalysis, 30000, !!symbol);
  
  const analysis = analysisRes;
  const analysisStaleness = useStaleness(analysisLastUpdated, analysisRefreshing, 60000);

  // Slow tier (no polling needed, cached anyway, maybe we refresh every 60s to catch new news or street sheet)
  const { data: chart, loading: chartLoading, refresh: refreshChart } = useData<HistoricalData[]>(`/api/chart/${symbol}?timeframe=${timeframe}`);
  useHeartbeat(refreshChart, 60000, !!symbol);

  const { data: news, loading: newsLoading } = useData<NewsItem[]>(`/api/news/${symbol}`);
  const { data: accuracy, loading: accuracyLoading } = useData<{hitRate: number | null, sampleSize: number, status: string, windowDays: number}>(`/api/accuracy/${symbol}`);
  const { data: convergenceRes, loading: convergenceLoading } = useData<{convergence: ConvergenceResult, street: StreetSheet}>(`/api/analysis/${symbol}/convergence`);
  
  const convergence = convergenceRes?.convergence || null;
  const streetSheet = convergenceRes?.street || null;

  const handleSearch = (newSymbol: string) => {
    setSymbol(newSymbol.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-mono relative">
      <div className="grain pointer-events-none"></div>
      
      {/* 1. Top band — Live Identity Strip */}
      <div className="relative z-50 shadow-sm">
        <div className="h-14 border-b border-rule/30 px-6 flex items-center justify-between shrink-0 bg-paper">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-lg tracking-tight text-ink uppercase">QuantPulse</span>
          </div>
          <div className="w-72">
            <SearchBar onSelect={handleSearch} />
          </div>
        </div>
        <LiveIdentityStrip 
          quote={quote} 
          staleness={quoteStaleness} 
          regime={analysis?.signal?.regime}
        />
      </div>

      <main className="flex-1 overflow-hidden flex flex-col relative z-10">
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* 2. Left — Conviction Panel */}
          <div className="w-full md:w-[320px] shrink-0 overflow-y-auto hide-scrollbar">
            <ConvictionPanel 
              signal={analysis?.signal || null} 
              convergence={convergence} 
            />
          </div>

          {/* 3. Center — Price Chart */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-paper">
            <div className="flex-1 min-h-[300px]">
              <div className="flex justify-end px-4 py-2 border-b border-rule/30 space-x-1">
                {['1D', '1W', '1M', '3M', '6M', '1Y'].map(tf => (
                  <button 
                    key={tf} 
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 text-[10px] font-mono transition-colors ${timeframe === tf ? 'bg-ink text-paper' : 'text-ink-70 hover:bg-rule/30'}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <PriceChart 
                data={chart || []} 
              />
            </div>
          </div>

          {/* 4. Right — Signal Evidence Panel */}
          <div className="w-full md:w-[380px] shrink-0 overflow-y-auto hide-scrollbar border-l border-rule/30">
            <SignalEvidence 
              signal={analysis?.signal || null} 
              indicators={analysis?.indicators || null} 
            />
          </div>

        </div>

        
        {/* 6. Secondary Panels */}
        <div className="flex bg-paper border-t border-rule/30 p-6 gap-6 overflow-x-auto hide-scrollbar">
          {/* Accuracy */}
          <div className="min-w-[250px] shrink-0 border-r border-rule/30 pr-6">
            <div className="text-[10px] font-sans font-bold text-ink-45 uppercase tracking-[0.1em] mb-3">Model Accuracy</div>
            {accuracy && accuracy.status === 'ok' ? (
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-mono text-ink tracking-tight">{accuracy.hitRate}%</span>
                  <Badge variant={accuracy.hitRate! > 55 ? 'bull' : 'gray'}>
                    {accuracy.hitRate! > 55 ? 'Strong' : 'Weak'} Edge
                  </Badge>
                </div>
                <div className="text-[10px] font-mono text-ink-70 leading-relaxed border-t border-rule/30 pt-2">
                  Based on historical backtest over {accuracy.sampleSize} signals.
                </div>
              </div>
            ) : (
              <div>
                <span className="text-xl font-mono text-ink tracking-tight">Insufficient Data</span>
                <div className="text-[10px] font-mono text-ink-70 leading-relaxed border-t border-rule/30 pt-2 mt-2">
                  Found {accuracy?.sampleSize || 0} signals. Need 15+.
                </div>
              </div>
            )}
          </div>
          
          {/* Street Sheet */}
          <div className="min-w-[300px] shrink-0 border-r border-rule/30 pr-6">
            <StreetSheetPanel data={streetSheet} loading={convergenceLoading} error={null} />
          </div>

          {/* News */}
          <div className="min-w-[300px] shrink-0">
            <div className="text-[10px] font-sans font-bold text-ink-45 uppercase tracking-[0.1em] mb-3">Exhibits</div>
            {news && news.length > 0 ? (
              <div className="space-y-3">
                {news.slice(0, 3).map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noreferrer" className="block group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-sans font-bold text-ink-45 uppercase tracking-[0.1em]">{item.source}</span>
                      <span className="text-[9px] font-mono text-ink-45">{new Date(item.time).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-[11px] font-mono text-ink group-hover:underline underline-offset-2 decoration-ink-45 transition-all line-clamp-2 leading-snug">{item.headline}</h4>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-[11px] font-mono text-ink-45">No recent exhibits found.</div>
            )}
          </div>
        </div>

        {/* 5. Bottom band — Engine Trace */}

        <EngineTrace signal={analysis?.signal || null} />
      </main>

      <div className="w-full z-20 border-t border-rule/30"> 
         <WatchlistStrip onSelect={handleSearch} />
      </div>
    </div>
  );
}
