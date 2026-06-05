import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { apiService } from '../services/api';
import { logger } from '../utils/logger';

export interface OnboardingData {
  businessName: string;
  businessType: string;
  industry: string;
  businessStage: string;
  primaryGoal: string;
  biggestChallenge: string[];
  currentActivities: string[];
  timeAvailable: string;
  quizAnswers: Record<string, string>;
  recommendedTrack: string;
  selectedTrack: string;
  startDate: string;
  notificationPreferences: string[];
  checkInDay: string;
}

interface OnboardingContextType {
  onboardingData: OnboardingData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastUserIdRef = React.useRef<string | null>(null);

  const fetchOnboardingData = React.useCallback(async () => {
    if (!user) {
      setOnboardingData(null);
      setLoading(false);
      lastUserIdRef.current = null;
      return;
    }

    // Only fetch if user ID has changed to avoid duplicate calls
    if (user.id === lastUserIdRef.current) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getProfile();
      
      if (response.success && response.data) {
        const profile = response.data as any;
        if (profile.onboarding_completed && profile.onboarding_data) {
          setOnboardingData(profile.onboarding_data);
        } else {
          setOnboardingData(null);
        }
      } else {
        setOnboardingData(null);
      }
    } catch (err) {
      logger.error('Error fetching onboarding data', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setOnboardingData(null);
    } finally {
      setLoading(false);
      lastUserIdRef.current = user.id;
    }
  }, [user?.id]);

  useEffect(() => {
    fetchOnboardingData();
  }, [fetchOnboardingData]);

  const refetch = () => {
    fetchOnboardingData();
  };

  return (
    <OnboardingContext.Provider value={{ onboardingData, loading, error, refetch }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
