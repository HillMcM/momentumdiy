import { useState, useEffect } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import PaywallModal from './PaywallModal';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function SubscriptionGuard({ children, fallback }: SubscriptionGuardProps) {
  const { subscription, loading } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (!loading && subscription) {
      // Show paywall if user doesn't have access
      if (!subscription.hasAccess) {
        setShowPaywall(true);
      }
    }
  }, [subscription, loading]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF8E81] mx-auto mb-4"></div>
          <p className="text-[#FFF1E7]/60">Loading your subscription status...</p>
        </div>
      </div>
    );
  }

  // Show paywall if no access
  if (subscription && !subscription.hasAccess) {
    return (
      <>
        {fallback || (
          <div className="min-h-screen bg-[#0F0A1A] flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-[#EF8E81]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#EF8E81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Access Required</h2>
              <p className="text-[#FFF1E7]/80 mb-6">
                Your free trial has ended. Subscribe to continue using MomentumDIY.
              </p>
              <button
                onClick={() => setShowPaywall(true)}
                className="bg-[#EF8E81] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#E67A6E] transition-colors"
              >
                View Subscription Options
              </button>
            </div>
          </div>
        )}
        
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          trialEndDate={subscription.trial_end_date}
          daysRemaining={subscription.daysRemaining}
        />
      </>
    );
  }

  // User has access, show the protected content
  return <>{children}</>;
}
