import React from 'react';
import clsx from 'clsx';

export function Badge({ children, variant = 'gray', className }: { children: React.ReactNode, variant?: 'bull' | 'bear' | 'signal' | 'gray', className?: string }) {
  const variants = {
    bull: 'border-bull text-bull bg-bull-wash',
    bear: 'border-bear text-bear bg-bear-wash',
    signal: 'border-signal text-signal bg-paper',
    gray: 'border-ink-45 text-ink-70 bg-paper'
  };
  return (
    <span className={clsx("px-2 py-0.5 text-[10px] font-mono uppercase border border-l-2 border-l-dashed inline-block whitespace-nowrap", variants[variant], className)}>
      {children}
    </span>
  );
}
