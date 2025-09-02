import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

interface SubscriptionDetails {
  subscription_status: string;
  subscription_plan?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  last_payment_date?: string;
  next_payment_date?: string;
}

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    loadSubscriptionDetails();
  }, []);

  const loadSubscriptionDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/profile');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load subscription details');
      }

      setSubscription(data.data);
    } catch (err) {
      console.error('Error loading subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your current billing period.')) {
      return;
    }

    try {
      setCancelLoading(true);
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      // Reload subscription details
      await loadSubscriptionDetails();
      alert('Subscription canceled successfully. You will continue to have access until the end of your current billing period.');
    } catch (err) {
      console.error('Error canceling subscription:', err);
      alert(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trial':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'active':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'canceled':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'expired':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'trial':
        return 'Free Trial';
      case 'active':
        return 'Active';
      case 'canceled':
        return 'Canceled';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0A1A] flex items-center justify-center">
        <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-[#2A243E]/60 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-600 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-600 rounded w-64 mb-8"></div>
            <div className="space-y-3">
              <div className="h-12 bg-gray-600 rounded"></div>
              <div className="h-12 bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F0A1A] flex items-center justify-center">
        <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-red-500/30 p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-4">❌ Error Loading Subscription</div>
            <div className="text-gray-400 mb-6">{error}</div>
            <button
              onClick={() => navigate('/app')}
              className="bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0A1A] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Subscription Management</h1>
            <p className="text-gray-400">Manage your subscription and billing information</p>
          </div>

          {subscription && (
            <>
              {/* Current Plan Card */}
              <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-[#2A243E]/60 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Current Plan</h2>
                    <p className="text-gray-400">
                      {subscription.subscription_plan
                        ? `${subscription.subscription_plan.charAt(0).toUpperCase() + subscription.subscription_plan.slice(1)} Plan`
                        : 'No active plan'
                      }
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor(subscription.subscription_status)}`}>
                    {getStatusText(subscription.subscription_status)}
                  </div>
                </div>

                {/* Plan Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {subscription.trial_end_date && subscription.subscription_status === 'trial' && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center text-green-400 mb-2">
                        <span className="mr-2">🎉</span>
                        <span className="font-medium">Free Trial Active</span>
                      </div>
                      <p className="text-sm text-green-300">
                        Trial ends: {new Date(subscription.trial_end_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {subscription.next_payment_date && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center text-blue-400 mb-2">
                        <span className="mr-2">💳</span>
                        <span className="font-medium">Next Billing</span>
                      </div>
                      <p className="text-sm text-blue-300">
                        {new Date(subscription.next_payment_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {subscription.last_payment_date && (
                    <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4">
                      <div className="flex items-center text-gray-400 mb-2">
                        <span className="mr-2">✅</span>
                        <span className="font-medium">Last Payment</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        {new Date(subscription.last_payment_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {subscription.subscription_end_date && subscription.subscription_status === 'canceled' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <div className="flex items-center text-yellow-400 mb-2">
                        <span className="mr-2">⏰</span>
                        <span className="font-medium">Access Until</span>
                      </div>
                      <p className="text-sm text-yellow-300">
                        {new Date(subscription.subscription_end_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-4">
                  {subscription.subscription_status === 'trial' && (
                    <button
                      onClick={() => navigate('/checkout/premium/monthly')}
                      className="bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Upgrade Now
                    </button>
                  )}

                  {(subscription.subscription_status === 'active' || subscription.subscription_status === 'trial') && (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      {cancelLoading ? 'Canceling...' : 'Cancel Subscription'}
                    </button>
                  )}

                  <button
                    onClick={() => navigate('/app')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>

              {/* Plan Comparison */}
              <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-[#2A243E]/60 p-8">
                <h3 className="text-xl font-bold text-white mb-6">Available Plans</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Monthly Plan */}
                  <div className="border border-[#2A243E]/60 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-2">Monthly Access</h4>
                    <div className="text-2xl font-bold text-[#EF8E81] mb-4">
                      $14.99<span className="text-sm text-gray-400">/month</span>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-400 mb-6">
                      <li>✅ Full MomentumDIY access</li>
                      <li>✅ 12-week marketing curriculum</li>
                      <li>✅ AI marketing assistant</li>
                      <li>✅ Task tracking & management</li>
                    </ul>
                    {subscription.subscription_plan !== 'monthly' && (
                      <button
                        onClick={() => navigate('/checkout/monthly/monthly')}
                        className="w-full bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Select Monthly
                      </button>
                    )}
                  </div>

                  {/* Annual Plan */}
                  <div className="border border-[#2A243E]/60 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-2">Annual Access</h4>
                    <div className="text-2xl font-bold text-[#EF8E81] mb-4">
                      $143.88<span className="text-sm text-gray-400">/year</span>
                    </div>
                    <div className="text-sm text-green-400 mb-4">Save 20% vs monthly</div>
                    <ul className="space-y-2 text-sm text-gray-400 mb-6">
                      <li>✅ Everything in Monthly</li>
                      <li>✅ Best value option</li>
                      <li>✅ Priority support</li>
                      <li>✅ Early access to features</li>
                    </ul>
                    {subscription.subscription_plan !== 'annual' && (
                      <button
                        onClick={() => navigate('/checkout/annual/yearly')}
                        className="w-full bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Select Annual
                      </button>
                    )}
                  </div>

                  {/* Spark Membership */}
                  <div className="border border-[#2A243E]/60 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-2">Spark Membership</h4>
                    <div className="text-2xl font-bold text-[#EF8E81] mb-4">
                      $100<span className="text-sm text-gray-400">/month</span>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-400 mb-6">
                      <li>✅ Full MomentumDIY access</li>
                      <li>✅ 1 hour marketing consultation</li>
                      <li>✅ Personalized strategy session</li>
                      <li>✅ Direct access to me</li>
                    </ul>
                    {subscription.subscription_plan !== 'spark' && (
                      <button
                        onClick={() => navigate('/checkout/spark/monthly')}
                        className="w-full bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Select Spark
                      </button>
                    )}
                  </div>

                  {/* Growth Membership */}
                  <div className="border border-[#2A243E]/60 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-2">Growth Membership</h4>
                    <div className="text-2xl font-bold text-[#EF8E81] mb-4">
                      $600<span className="text-sm text-gray-400">/month</span>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-400 mb-6">
                      <li>✅ Full MomentumDIY access</li>
                      <li>✅ 5 hours marketing consultation</li>
                      <li>✅ Strategy development</li>
                      <li>✅ Implementation support</li>
                    </ul>
                    {subscription.subscription_plan !== 'growth' && (
                      <button
                        onClick={() => navigate('/checkout/growth/monthly')}
                        className="w-full bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Select Growth
                      </button>
                    )}
                  </div>

                  {/* Lead Membership */}
                  <div className="border border-[#2A243E]/60 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-2">Lead Membership</h4>
                    <div className="text-2xl font-bold text-[#EF8E81] mb-4">
                      $1,400<span className="text-sm text-gray-400">/month</span>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-400 mb-6">
                      <li>✅ Full MomentumDIY access</li>
                      <li>✅ 10 hours marketing consultation</li>
                      <li>✅ Complete marketing strategy</li>
                      <li>✅ Ongoing implementation support</li>
                    </ul>
                    {subscription.subscription_plan !== 'lead' && (
                      <button
                        onClick={() => navigate('/checkout/lead/monthly')}
                        className="w-full bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Select Lead
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
