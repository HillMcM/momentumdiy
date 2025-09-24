import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getActiveGoal } from '../services/marketingService';
import type { MarketingGoal, MarketingModule } from '../types';

interface MarketingContextType {
  activeGoal: MarketingGoal | null;
  currentModule: MarketingModule | null;
  isLoading: boolean;
  error: string | null;
  setActiveGoal: (goal: MarketingGoal | null) => void;
  setCurrentModule: (module: MarketingModule | null) => void;
  setError: (error: string | null) => void;
  refreshMarketingData: () => Promise<void>;
  updateActiveGoal: (updatedGoal: MarketingGoal) => void;
  onTaskStatusChange?: (taskId: string, isCompleted: boolean) => void;
}

const MarketingContext = createContext<MarketingContextType | undefined>(undefined);

export function useMarketing() {
  const context = useContext(MarketingContext);
  if (context === undefined) {
    throw new Error('useMarketing must be used within a MarketingProvider');
  }
  return context;
}

interface MarketingProviderProps {
  children: ReactNode;
  onTaskStatusChange?: (taskId: string, isCompleted: boolean) => void;
}

export function MarketingProvider({ children, onTaskStatusChange }: MarketingProviderProps) {
  const [activeGoal, setActiveGoal] = useState<MarketingGoal | null>(null);
  const [currentModule, setCurrentModule] = useState<MarketingModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshMarketingData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Refreshing marketing data...');
      console.log('🔍 Using getActiveGoal function...');
      const response = await getActiveGoal();
      console.log('📡 Marketing data response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Setting active goal:', response.data);
        console.log('🔓 Modules unlock status:', response.data.modules.map(m => `Week ${m.weekNumber}: unlocked=${m.isUnlocked}`));
        console.log('📊 Total modules:', response.data.modules.length);
        console.log('📋 Module titles:', response.data.modules.map(m => m.title));
        setActiveGoal(response.data);
        // Set current module based on active goal
        const current = response.data.modules.find(module => module.weekNumber === response.data?.currentWeek);
        setCurrentModule(current || null);
      } else {
        console.error('❌ Failed to load marketing goal:', response);
        setError('Failed to load marketing goal');
      }
    } catch (err) {
      console.error('❌ Marketing context error:', err);
      setError('Error loading marketing data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshMarketingData();
  }, []);

  const updateActiveGoal = (updatedGoal: MarketingGoal) => {
    setActiveGoal(updatedGoal);
    // Update current module if needed
    const current = updatedGoal.modules.find(module => module.weekNumber === updatedGoal.currentWeek);
    setCurrentModule(current || null);
  };

  const value: MarketingContextType = {
    activeGoal,
    currentModule,
    isLoading,
    error,
    setActiveGoal,
    setCurrentModule,
    setError,
    refreshMarketingData,
    updateActiveGoal,
    onTaskStatusChange
  };

  return (
    <MarketingContext.Provider value={value}>
      {children}
    </MarketingContext.Provider>
  );
}
