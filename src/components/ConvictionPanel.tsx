import React from 'react';
import clsx from 'clsx';
import { SignalData, ConvergenceResult } from '../types';
import { Badge } from './ui/badge';

interface ConvictionPanelProps {
  signal: SignalData | null;
  convergence: ConvergenceResult | null;
}

export function ConvictionPanel({ signal, convergence }: ConvictionPanelProps) {
  if (!signal) {
    return (
      <div className="h-full flex flex-col justify-center p-6 border-r border-rule/30 bg-paper/50">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-ink/10 w-24"></div>
          <div className="h-16 bg-ink/10 w-32"></div>
          <div className="h-8 bg-ink/10 w-full"></div>
        </div>
      </div>
    );
  }

  const isBullish = signal.label.includes("Bullish");
  const isBearish = signal.label.includes("Bearish");

  return (
    <div className="h-full flex flex-col p-6 border-r border-rule/30 bg-paper/50 justify-between">
      <div>
        <div className="text-[10px] font-sans font-bold text-ink-45 uppercase tracking-[0.1em] mb-4">Conviction Matrix</div>
        <div className="flex items-end gap-3 mb-2">
          <div className={clsx("text-6xl font-mono tracking-tighter leading-none", 
            isBullish ? "text-bull" : isBearish ? "text-bear" : "text-ink"
          )}>
            {signal.compositeScore}
          </div>
          <div className="text-sm font-mono text-ink-70 pb-1">/ 100</div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant={isBullish ? 'bull' : isBearish ? 'bear' : 'gray'} className="text-xs py-1">
            {signal.label}
          </Badge>
          <Badge variant="gray" className="text-xs py-1">
            {signal.confidence}% CONFIDENCE
          </Badge>
        </div>
      </div>

      {convergence && (
        <div className="mt-8 pt-6 border-t border-rule/30">
          <div className="text-[10px] font-sans font-bold text-ink-45 uppercase tracking-[0.1em] mb-3">Street Convergence</div>
          <div className="flex items-center gap-2 mb-2">
            <div className={clsx("w-2 h-2 rounded-full", 
              convergence.verdict === 'CONVERGENT' ? 'bg-bull' : 
              convergence.verdict === 'DIVERGENT' ? 'bg-bear' : 'bg-ink/30'
            )} />
            <span className="text-sm font-mono font-bold text-ink">{convergence.verdict}</span>
          </div>
          <p className="text-xs font-mono text-ink-70 leading-relaxed mb-3">
            {convergence.explanation}
          </p>
          <div className="text-[10px] font-mono text-ink-45 border-l-2 border-rule/50 pl-3">
            {convergence.streetSummary}
          </div>
        </div>
      )}
    </div>
  );
}
