import React from 'react';
import { SignalData } from '../types';

interface EngineTraceProps {
  signal: SignalData | null;
}

export function EngineTrace({ signal }: EngineTraceProps) {
  if (!signal) {
    return <div className="h-12 border-t border-rule/30 bg-paper px-6 flex items-center justify-between animate-pulse" />;
  }

  const stepClasses = "flex items-center gap-2 text-[10px] font-mono text-ink-70 whitespace-nowrap";
  const arrowClasses = "text-ink-30 mx-2";

  return (
    <div className="h-auto md:h-10 border-t border-rule/30 bg-paper px-4 md:px-6 flex items-center overflow-x-auto hide-scrollbar">
      <div className="flex items-center w-max">
        <div className="text-[9px] font-sans font-bold text-ink-45 uppercase tracking-[0.1em] mr-4 shrink-0">Engine Trace</div>
        
        <div className={stepClasses}>
          <span className="text-ink">1.</span> Indicators Normalization
        </div>
        
        <span className={arrowClasses}>→</span>
        
        <div className={stepClasses}>
          <span className="text-ink">2.</span> Regime: <span className="text-ink font-bold">{signal.regime}</span>
        </div>

        <span className={arrowClasses}>→</span>
        
        <div className={stepClasses}>
          <span className="text-ink">3.</span> Category Weights Applied
        </div>

        <span className={arrowClasses}>→</span>
        
        <div className={stepClasses}>
          <span className="text-ink">4.</span> Composite Score: <span className="text-ink font-bold">{signal.compositeScore}</span>
        </div>

        <span className={arrowClasses}>→</span>
        
        <div className={stepClasses}>
          <span className="text-ink">5.</span> Evidence Generated ({signal.evidence.length} pro, {signal.conflicting.length} con)
        </div>

        <div className="ml-auto pl-8 flex items-center gap-4 shrink-0">
          <div className="text-[9px] font-mono text-ink-45">Model: {signal.modelVersion || 'v1.0.0'}</div>
          <div className="text-[9px] font-mono text-ink-45">Formula: {signal.formulaVersion || 'v1'}</div>
        </div>
      </div>
    </div>
  );
}
