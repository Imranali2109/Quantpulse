import React from 'react';
import clsx from 'clsx';
import { SignalData, IndicatorData } from '../types';

interface SignalEvidenceProps {
  signal: SignalData | null;
  indicators: IndicatorData | null;
}

export function SignalEvidence({ signal, indicators }: SignalEvidenceProps) {
  if (!signal || !indicators) {
    return (
      <div className="h-full p-6 border-l border-rule/30 bg-paper/50">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-ink/10 w-32"></div>
          <div className="h-12 bg-ink/5 w-full"></div>
          <div className="h-12 bg-ink/5 w-full"></div>
        </div>
      </div>
    );
  }

  const sections = [
    { name: 'Trend', score: signal.breakdown.trendScore },
    { name: 'Momentum', score: signal.breakdown.momentumScore },
    { name: 'Volume', score: signal.breakdown.volumeScore },
    { name: 'Volatility', score: signal.breakdown.volatilityScore },
  ];

  return (
    <div className="h-full p-6 border-l border-rule/30 bg-paper/50 flex flex-col">
      <div className="text-[10px] font-sans font-bold text-ink-45 uppercase tracking-[0.1em] mb-4">Signal Evidence</div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-ink border-b border-rule/30 pb-1">Primary Drivers</h4>
          {signal.evidence.length > 0 ? (
            <ul className="space-y-2">
              {signal.evidence.map((ev, i) => (
                <li key={i} className="text-xs font-mono text-ink flex items-start gap-2">
                  <span className="text-bull mt-0.5">+</span>
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs font-mono text-ink-45">No primary directional evidence.</div>
          )}
        </div>

        {signal.conflicting && signal.conflicting.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-ink border-b border-rule/30 pb-1">Conflicting Factors</h4>
            <ul className="space-y-2">
              {signal.conflicting.map((cf, i) => (
                <li key={i} className="text-xs font-mono text-ink-70 flex items-start gap-2">
                  <span className="text-bear mt-0.5">-</span>
                  <span>{cf}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-mono font-bold text-ink border-b border-rule/30 pb-1">Category Weighting</h4>
          <div className="space-y-2">
            {sections.map(sec => (
              <div key={sec.name} className="flex items-center justify-between">
                <span className="text-xs font-mono text-ink-70">{sec.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1 bg-rule/30 overflow-hidden">
                    <div 
                      className={clsx("h-full", sec.score > 60 ? "bg-bull" : sec.score < 40 ? "bg-bear" : "bg-ink/30")} 
                      style={{ width: `${Math.max(5, sec.score)}%` }} 
                    />
                  </div>
                  <span className="text-[10px] font-mono text-ink w-6 text-right">{Math.round(sec.score)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
