import React from 'react';
import clsx from 'clsx';

export function Pane({ title, fig, children, loading, error, className }: { title: string, fig: string, children: React.ReactNode, loading?: boolean, error?: string | null, className?: string }) {
  return (
    <div className={clsx("flex flex-col relative border-t border-rule pt-4 pb-6", className)}>
      <div className="flex items-center justify-between shrink-0 mb-4">
        <h3 className="text-[11px] font-sans font-bold text-ink-70 uppercase tracking-[0.16em]">
          {fig} &mdash; {title}
        </h3>
        {loading && <span className="font-mono text-[10px] uppercase animate-pulse flex items-center gap-1 text-ink-70">[ PROCESSING<span className="w-1.5 h-3 bg-ink-70 inline-block" /> ]</span>}
      </div>
      <div className="flex-1 relative">
        {error ? (
          <div className="text-bear text-sm flex items-center justify-center h-full font-mono">
            [ ERROR: {error} ]
          </div>
        ) : loading && !children ? (
          <div className="flex items-center justify-center h-full opacity-50 min-h-[120px]">
            <span className="font-mono text-[10px] uppercase animate-pulse flex items-center gap-1 text-ink-70">[ PROCESSING<span className="w-1.5 h-3 bg-ink-70 inline-block" /> ]</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
