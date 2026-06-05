import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { useNotificationHelpers } from '../hooks/useNotificationHelpers';

/**
 * Banner component that displays trial countdown and proactive warnings.
 * Shows at the top of the app when user is on trial.
 */
export default function TrialCountdownBanner() {
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const { showWarning } = useNotificationHelpers();
  const [dismissed, setDismissed] = useState(false);
  const [hasShownWarning, setHasShownWarning] = useState(false);

  // Don't show if not on trial or dismissed
  if (!subscription || subscription.subscription_status !== 'trial' || dismissed) {
    return null;
  }

  const daysRemaining = subscription.daysRemaining || 0;
  const trialEndDate = subscription.trial_end_date;

  // Show proactive warnings at specific intervals
  useEffect(() => {
    if (daysRemaining > 0 && daysRemaining <= 3 && !hasShownWarning) {
      setHasShownWarning(true);
      const warningMessages = {
        1: 'Your trial ends tomorrow! Subscribe now to continue your marketing journey.',
        2: 'Only 2 days left in your trial. Don\'t lose your progress!',
        3: '3 days remaining in your trial. Upgrade to keep all your work.'
      };
      const message = warningMessages[daysRemaining as keyof typeof warningMessages] || 
        `Your trial ends in ${daysRemaining} days. Subscribe to continue.`;
      
      showWarning('Trial Ending Soon', message, {
        label: 'View Plans',
        onClick: () => navigate('/app/manage-subscription')
      });
    }
  }, [daysRemaining, hasShownWarning, navigate, showWarning]);

  // Determine urgency level
  const getUrgencyLevel = () => {
    if (daysRemaining <= 1) return 'critical';
    if (daysRemaining <= 3) return 'high';
    if (daysRemaining <= 7) return 'medium';
    return 'low';
  };

  const urgency = getUrgencyLevel();
  const urgencyColors = {
    critical: 'bg-red-500/20 border-red-500/40 text-red-300',
    high: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    medium: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
    low: 'bg-blue-500/20 border-blue-500/40 text-blue-300'
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`${urgencyColors[urgency]} border-b px-4 py-3`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {urgency === 'critical' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {urgency === 'high' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {(urgency === 'medium' || urgency === 'low') && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium">
              {urgency === 'critical' && '⚠️ Your trial ends today!'}
              {urgency === 'high' && `⏰ Only ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left in your trial`}
              {urgency === 'medium' && `${daysRemaining} days remaining in your free trial`}
              {urgency === 'low' && `${daysRemaining} days left in your free trial`}
            </p>
            {trialEndDate && (
              <p className="text-sm opacity-80 mt-0.5">
                Trial ends on {formatDate(trialEndDate)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => navigate('/app/manage-subscription')}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
          >
            {urgency === 'critical' ? 'Subscribe Now' : 'Upgrade Now'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/70 hover:text-white transition-colors p-1"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
