import React, { useState, useEffect, useRef, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Search, X } from 'lucide-react';
import { securities, Security } from '../data/securities';
import { cn } from '../lib/utils';

interface SearchBarProps {
  onSelect: (ticker: string) => void;
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Security[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize Fuse index
  const fuse = useMemo(() => {
    return new Fuse(securities, {
      keys: [
        { name: 'ticker', weight: 1.0 },
        { name: 'name', weight: 0.95 },
        { name: 'aliases', weight: 0.90 },
        { name: 'exchange', weight: 0.60 },
        { name: 'sector', weight: 0.30 }
      ],
      threshold: 0.3, // Fuzzy tolerance
      ignoreLocation: true,
      includeScore: true
    });
  }, []);

  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      const searchResults = fuse.search(query);
      setResults(searchResults.slice(0, 8).map(r => r.item));
      setIsOpen(true);
      setSelectedIndex(0);
    }, 150); // 150ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, fuse]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex].ticker);
      } else if (query.trim()) {
        // Fallback for unknown tickers
        handleSelect(query.toUpperCase().trim());
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Command + K shortcut
  useEffect(() => {
    const handleCmdK = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleCmdK);
    return () => document.removeEventListener('keydown', handleCmdK);
  }, []);

  const handleSelect = (ticker: string) => {
    setQuery('');
    setIsOpen(false);
    onSelect(ticker);
    inputRef.current?.blur();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0 && results[selectedIndex]) {
      handleSelect(results[selectedIndex].ticker);
    } else if (query.trim()) {
      handleSelect(query.toUpperCase().trim());
    }
  };

  return (
    <div className="relative w-full max-w-[400px]">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          placeholder="SEARCH TICKER OR NAME..."
          className="w-full bg-paper border border-ink focus:ring-1 focus:ring-ink h-9 pl-9 pr-10 text-xs font-mono text-ink outline-none transition-none placeholder:text-ink-45 uppercase"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-70" />
        
        {query ? (
          <button 
            type="button"
            onClick={() => { setQuery(''); setIsOpen(false); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-70 hover:text-ink transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-45 text-[10px] font-mono">⌘K</div>
        )}
      </form>
      {isOpen && query.trim() && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 w-full mt-1 bg-paper border border-ink shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden z-50 flex flex-col max-h-[400px]"
        >
          {results.length > 0 ? (
            <div className="overflow-y-auto flex flex-col divide-y divide-rule/50">
              {results.map((result, index) => (
                <div
                  key={result.ticker}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(result.ticker);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "p-3 cursor-pointer transition-none flex items-center justify-between group",
                    selectedIndex === index ? "bg-paper-dim" : "hover:bg-paper-dim"
                  )}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-serif font-bold text-sm text-ink">{result.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 border border-ink font-mono text-ink">
                        {result.ticker}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-sans uppercase tracking-[0.05em] text-ink-70 font-bold">
                      <span className="flex items-center gap-1">
                        {result.exchange}
                      </span>
                      <span className="flex items-center gap-1 before:content-['/'] before:text-ink-45 before:mr-2">
                        {result.sector}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-ink-70 font-mono text-[11px] uppercase">
              [ NO MATCHING SECURITIES ]
            </div>
          )}
        </div>
      )}
    </div>
  );
}
