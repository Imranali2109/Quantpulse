import React from 'react';
import { ConvergenceResult } from '../types';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';
import { ArrowRight, Info } from 'lucide-react';

export function ConvergenceHero({ data, loading, error }: { data?: ConvergenceResult, loading: boolean, error?: string | null }) {
  if (loading || !data) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[160px] border-b border-rule gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-45 animate-pulse">Running Convergence Model...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center min-h-[160px] border-b border-rule">
        <span className="font-mono text-xs text-bear">Failed to compute convergence</span>
      </div>
    );
  }

  const { verdict, signalLabel, streetSummary, reliabilitySummary, explanation } = data;

  const isConvergent = verdict === 'CONVERGENT';
  const isDivergent = verdict === 'DIVERGENT';
  const isInconclusive = verdict === 'INCONCLUSIVE';
  
  const isNoData = streetSummary.includes("Insufficient") || streetSummary.includes("unavailable");
  
  const badgeLabel = isConvergent ? "Convergence: Aligned" 
    : isDivergent ? "Convergence: Divergent" 
    : isNoData ? "Standalone Technical View"
    : "Convergence: Mixed";

  return (
    <div className="w-full flex flex-col pt-6 pb-8 border-b border-rule gap-6 relative overflow-hidden">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Badge variant={isConvergent ? 'bull' : isDivergent ? 'bear' : 'gray'} className="text-[11px] md:text-xs uppercase tracking-widest px-3 py-1">
            {badgeLabel}
          </Badge>
        </div>

        <p className="max-w-3xl font-serif text-lg md:text-xl leading-relaxed text-ink-70">
          {explanation}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-rule/30">
        <div className="flex flex-col gap-2">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-ink-45">Your Signal</h3>
          <p className="font-mono text-xs font-bold text-ink">{signalLabel}</p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-ink-45">Street Consensus</h3>
          <p className="font-mono text-xs font-bold text-ink">{streetSummary}</p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-ink-45">Historical Reliability</h3>
          <p className="font-mono text-xs font-bold text-ink">{reliabilitySummary}</p>
        </div>
      </div>
    </div>
  );
}
