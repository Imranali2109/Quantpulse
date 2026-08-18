import { useEffect, useRef } from 'react';

export function useHeartbeat(callback: () => void, intervalMs: number, enabled = true) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;
    
    // Check visibility state so we don't poll in the background endlessly
    let intervalId: any;
    
    const tick = () => {
      if (document.visibilityState === 'visible') {
        savedCallback.current();
      }
    };
    
    // Fire immediately if visible
    if (document.visibilityState === 'visible') {
      // tick(); // don't fire immediately here, the main useEffect will do initial fetch, this is just a heartbeat. Or maybe we do.
      // wait, the problem asks for polling interval.
    }
    
    intervalId = setInterval(tick, intervalMs);
    
    return () => clearInterval(intervalId);
  }, [intervalMs, enabled]);
}

export type StalenessState = 'LIVE' | 'REFRESHING' | 'STALE';

export function useStaleness(lastUpdatedAt: number | null, isRefreshing: boolean, staleThresholdMs: number = 60000): StalenessState {
  if (isRefreshing) return 'REFRESHING';
  if (!lastUpdatedAt) return 'STALE';
  
  const now = Date.now();
  if (now - lastUpdatedAt > staleThresholdMs) return 'STALE';
  
  return 'LIVE';
}
