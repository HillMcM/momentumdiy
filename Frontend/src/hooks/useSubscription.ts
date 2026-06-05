import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/useAuth';
import { apiService } from '../services/api';
import { logger } from '../utils/logger';

interface SubscriptionStatus {
  subscription_status: 'trial' | 'active' | 'expired' | 'cancelled';
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  subscription_plan?: string;
  daysRemaining?: number;
  hasAccess: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      setLastUserId(null);
      return;
    }

    // Only fetch subscription data if the user ID has actually changed
    // This prevents unnecessary re-fetches when Supabase refreshes the session on window focus
    if (user.id === lastUserId) {
      return;
    }

    const fetchSubscription = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiService.getProfile();
        
        if (response.success && response.data) {
          const profile = response.data as any;
          
          // Calculate days remaining for trial
          let daysRemaining = 0;
          if (profile.subscription_status === 'trial' && profile.trial_end_date) {
            const trialEnd = new Date(profile.trial_end_date);
            const now = new Date();
            const diffTime = trialEnd.getTime() - now.getTime();
            daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          }

          // Determine if user has access
          const hasAccess = profile.subscription_status === 'active' || 
                           (profile.subscription_status === 'trial' && daysRemaining > 0);

          setSubscription({
            subscription_status: profile.subscription_status,
            trial_start_date: profile.trial_start_date,
            trial_end_date: profile.trial_end_date,
            subscription_start_date: profile.subscription_start_date,
            subscription_end_date: profile.subscription_end_date,
            subscription_plan: profile.subscription_plan,
            daysRemaining: Math.max(0, daysRemaining),
            hasAccess
          });
        } else {
          setError('Failed to fetch subscription status');
        }
      } catch (err) {
        logger.error('Error fetching subscription', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
        setLastUserId(user.id); // Mark this user ID as processed
      }
    };

    // Call async function properly
    void fetchSubscription();
  }, [user?.id]); // Only depend on user.id, not lastUserId to avoid infinite loop

  return {
    subscription,
    loading,
    error,
    refetch: () => {
      if (user) {
        setLoading(true);
        // Re-trigger the effect
        setSubscription(null);
      }
    }
  };
}
