import React, { createContext, useContext } from 'react';
import type { MarketingGoal } from '../types';

interface MarketingTrackContextValue {
  activeGoal: MarketingGoal | null;
  trackSlug?: string;
}

export const MarketingTrackContext = createContext<MarketingTrackContextValue | null>(null);

interface MarketingTrackProviderProps {
  children: React.ReactNode;
  activeGoal: MarketingGoal | null;
  trackSlug?: string;
}

export function MarketingTrackProvider({ children, activeGoal, trackSlug }: MarketingTrackProviderProps) {
  return (
    <MarketingTrackContext.Provider value={{ activeGoal, trackSlug }}>
      {children}
    </MarketingTrackContext.Provider>
  );
}

export function useMarketingTrackContext() {
  const context = useContext(MarketingTrackContext);
  if (!context) {
    throw new Error('useMarketingTrackContext must be used within a MarketingTrackProvider');
  }
  return context;
}
