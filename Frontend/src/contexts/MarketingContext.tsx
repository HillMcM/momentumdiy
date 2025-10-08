import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { getActiveGoal, updateMarketingGoalPhases } from '../services/marketingService';
import type { MarketingGoal, MarketingModule } from '../types';
import { useWindowFocus } from '../hooks/useWindowFocus';
import { useNotificationHelpers } from '../hooks/useNotificationHelpers';

interface MarketingContextType {
  activeGoal: MarketingGoal | null;
  currentModule: MarketingModule | null;
  isLoading: boolean;
  error: string | null;
  setActiveGoal: (goal: MarketingGoal | null) => void;
  setCurrentModule: (module: MarketingModule | null) => void;
  setError: (error: string | null) => void;
  refreshMarketingData: () => Promise<void>;
  refreshActiveGoal: () => Promise<void>;
  updateActiveGoal: (updatedGoal: MarketingGoal) => void;
  updatePhases: (phases: any[]) => Promise<boolean>;
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
  const { isFocused, hasBeenFocused } = useWindowFocus();
  const { showWeekUnlocked, showTrackCompleted } = useNotificationHelpers();
  const lastRefreshRef = useRef<number>(0);
  const prevFocusedRef = useRef<boolean>(true);
  const prevWeekRef = useRef<number | null>(null);
  const REFRESH_COOLDOWN = 10 * 60 * 1000; // 10 minutes cooldown between refreshes

  // Debug: Track MarketingProvider renders
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  const refreshMarketingData = async (force = false) => {
    // Prevent excessive refreshes when window regains focus, but allow forced refreshes
    const now = Date.now();
    if (!force && now - lastRefreshRef.current < REFRESH_COOLDOWN) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      lastRefreshRef.current = now;
      
      const response = await getActiveGoal();
      
      if (response.success && response.data) {
        const newGoal = response.data;
        
        // Detect week advancement
        if (prevWeekRef.current !== null && newGoal.currentWeek > prevWeekRef.current) {
          logger.info('Week advanced', { fromWeek: prevWeekRef.current, toWeek: newGoal.currentWeek });
          showWeekUnlocked(newGoal.currentWeek);
        }
        
        // Detect track completion
        if (newGoal.progress >= 100 && activeGoal && activeGoal.progress < 100) {
          logger.info('Track completed', { trackTitle: newGoal.title });
          showTrackCompleted(newGoal.title);
        }
        
        // Update state
        prevWeekRef.current = newGoal.currentWeek;
        setActiveGoal(newGoal);
        
        // Set current module based on active goal
        const current = newGoal.modules.find(module => module.weekNumber === newGoal.currentWeek);
        setCurrentModule(current || null);
      } else {
        logger.error('Failed to load marketing goal', { error: response.error });
        setError('Failed to load marketing goal');
      }
    } catch (err) {
      logger.error('Marketing context error', err);
      setError('Error loading marketing data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshMarketingData();
  }, []);

  // Handle window focus changes - only refresh if window was unfocused for a while
  useEffect(() => {
    // Only run when window regains focus (transitions from false to true)
    if (isFocused && !prevFocusedRef.current && hasBeenFocused) {
      // Window regained focus, but only refresh if it's been a while
      const timeSinceLastRefresh = Date.now() - lastRefreshRef.current;
      if (timeSinceLastRefresh > REFRESH_COOLDOWN) {
        refreshMarketingData();
      }
    }
    
    // Update previous focus state
    prevFocusedRef.current = isFocused;
  }, [isFocused, hasBeenFocused]);

  const updateActiveGoal = (updatedGoal: MarketingGoal) => {
    setActiveGoal(updatedGoal);
    // Update current module if needed
    const current = updatedGoal.modules.find(module => module.weekNumber === updatedGoal.currentWeek);
    setCurrentModule(current || null);
  };

  const updatePhases = async (phases: any[]): Promise<boolean> => {
    if (!activeGoal) {
      logger.warn('No active goal to update phases for');
      return false;
    }

    try {
      const response = await updateMarketingGoalPhases(activeGoal.id, phases);
      
      if (response.success && response.data) {
        updateActiveGoal(response.data);
        return true;
      } else {
        logger.error('Failed to update phases', { error: response.error, goalId: activeGoal.id });
        setError(response.error || 'Failed to update phases');
        return false;
      }
    } catch (error) {
      logger.error('Error updating phases', error, { goalId: activeGoal.id });
      setError(error instanceof Error ? error.message : 'Failed to update phases');
      return false;
    }
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
    refreshActiveGoal: () => refreshMarketingData(true),
    updateActiveGoal,
    updatePhases,
    onTaskStatusChange
  };

  return (
    <MarketingContext.Provider value={value}>
      {children}
    </MarketingContext.Provider>
  );
}
