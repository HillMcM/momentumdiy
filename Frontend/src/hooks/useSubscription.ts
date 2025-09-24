import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/useAuth';
import { apiService } from '../services/api';

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
    console.log('🔍 useSubscription effect triggered - user:', user?.id, 'lastUserId:', lastUserId);
    
    if (!user) {
      setSubscription(null);
      setLoading(false);
      setLastUserId(null);
      return;
    }

    // Only fetch subscription data if the user ID has actually changed
    // This prevents unnecessary re-fetches when Supabase refreshes the session on window focus
    if (user.id === lastUserId) {
      console.log('🚫 useSubscription: Skipping fetch - user ID unchanged');
      return;
    }

    console.log('✅ useSubscription: Fetching subscription data for new user');

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

          console.log('🔍 Subscription data:', {
            subscription_status: profile.subscription_status,
            daysRemaining,
            hasAccess,
            profile
          });

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
        console.error('Error fetching subscription:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
        setLastUserId(user.id); // Mark this user ID as processed
      }
    };

    fetchSubscription();
  }, [user, lastUserId]);

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
