import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { useAuth } from '../contexts/useAuth';
import PaywallModal from './PaywallModal';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function SubscriptionGuard({ children, fallback }: SubscriptionGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Check if auth is disabled for local development
  const isAuthDisabled = import.meta.env.VITE_DISABLE_AUTH === 'true' || import.meta.env.VITE_DISABLE_AUTH === 'TRUE';
  
  console.log('🔍 SubscriptionGuard - Environment check:');
  console.log('VITE_DISABLE_AUTH:', import.meta.env.VITE_DISABLE_AUTH);
  console.log('isAuthDisabled:', isAuthDisabled);

  // If auth is disabled, bypass all checks and show the app
  if (isAuthDisabled) {
    console.log('🔓 Auth bypass enabled for local development');
    console.log('🔓 Showing protected content:', children);
    return <>{children}</>;
  }

  useEffect(() => {
    if (!loading && subscription) {
      // Show paywall if user doesn't have access
      // Temporary bypass for admin email
      if (!subscription.hasAccess && user?.email !== 'info@hillaryedenmcmullen.com') {
        console.log('🔒 Subscription guard: User does not have access', { 
          hasAccess: subscription.hasAccess, 
          email: user?.email,
          subscription_status: subscription.subscription_status 
        });
        setShowPaywall(true);
      }
    }
  }, [subscription, loading, user]);

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F0A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF8E81] mx-auto mb-4"></div>
          <p className="text-[#FFF1E7]/60">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated after loading is complete, redirect to pricing page
  if (!user) {
    return <Navigate to="/pricing" replace />;
  }

  // Show loading state for subscription data
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

  // Show paywall if no access (except for admin email)
  if (subscription && !subscription.hasAccess && user?.email !== 'info@hillaryedenmcmullen.com') {
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
