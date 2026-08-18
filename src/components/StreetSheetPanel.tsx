import React from 'react';
import { StreetSheet } from '../types';
import { Pane } from './ui/pane';
import { Badge } from './ui/badge';
import { ExternalLink } from 'lucide-react';

export function StreetSheetPanel({ data, loading, error }: { data?: StreetSheet, loading: boolean, error?: string | null }) {
  if (loading) {
    return (
      <Pane fig="FIG. 07" title="The Street Sheet" loading={true}>
        <div className="h-32" />
      </Pane>
    );
  }

  if (error || !data) {
    return (
      <Pane fig="FIG. 07" title="The Street Sheet">
        <div className="py-4 text-sm text-ink-45 font-mono">Failed to load street sheet.</div>
      </Pane>
    );
  }

  if (data.status === 'unavailable' || data.firms.length === 0) {
    return (
      <Pane fig="FIG. 07" title="The Street Sheet">
        <div className="flex flex-col gap-2 py-2">
          <h4 className="font-serif text-lg text-ink">Insufficient Coverage</h4>
          <p className="text-xs font-mono text-ink-45">No recent analyst ratings found for {data.ticker}.</p>
        </div>
      </Pane>
    );
  }

  const isBullish = data.impliedUpsidePct > 0;

  return (
    <Pane fig="FIG. 07" title="The Street Sheet">
      <div className="flex flex-col gap-6">
        <div className="flex items-baseline justify-between border-b border-rule/30 pb-4">
          <div className="flex flex-col gap-1">
             <span className="text-3xl font-serif tracking-tight text-ink">
               ${data.consensusTarget.toFixed(2)}
             </span>
             <span className="text-[10px] font-mono text-ink-45 uppercase tracking-widest">Consensus Target</span>
          </div>
          
          <Badge variant={isBullish ? 'bull' : 'bear'} className="px-3 py-1">
             {isBullish ? '+' : ''}{data.impliedUpsidePct.toFixed(1)}% Upside
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-4 font-mono text-[9px] uppercase tracking-widest text-ink-45 border-b border-rule/30 pb-2">
            <span className="col-span-2">Firm</span>
            <span className="text-right">Rating</span>
            <span className="text-right">Target</span>
          </div>
          
          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
            {data.firms.map((firm, i) => (
              <div key={i} className="grid grid-cols-4 font-mono text-xs items-center py-1 border-b border-rule/10 last:border-0">
                <span className="col-span-2 truncate text-ink-70 pr-2">{firm.firm}</span>
                <span className="text-right truncate">{firm.rating}</span>
                <span className="text-right text-ink">${firm.targetPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        
        {data.sourceUrl && (
          <div className="pt-2 flex justify-between items-center text-[10px] font-mono text-ink-45">
            <span>Source: {data.source}</span>
            <a href={data.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center hover:text-ink transition-colors">
               View <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        )}
      </div>
    </Pane>
  );
}
