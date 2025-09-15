import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from './services/api';

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
      const response = await apiService.getProfile();

      if (!response.success) {
        throw new Error(response.error || 'Failed to load subscription details');
      }

      setSubscription(response.data as SubscriptionDetails);
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
    <div className="min-h-screen bg-gradient-to-br from-[#0F0A1A] via-[#1B1628] to-[#0F0A1A] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] rounded-2xl mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Subscription Management</h1>
            <p className="text-xl text-[#FFF1E7]/80 max-w-2xl mx-auto">Manage your subscription, billing, and access to MomentumDIY's powerful marketing tools</p>
          </div>

          {subscription && (
            <>
              {/* Current Plan Card */}
              <div className="bg-gradient-to-br from-[#1B1628]/90 to-[#2A2438]/90 backdrop-blur-sm rounded-3xl border border-[#EF8E81]/20 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Current Plan</h2>
                    <p className="text-[#FFF1E7]/80 text-lg">
                      {subscription.subscription_plan
                        ? `${subscription.subscription_plan.charAt(0).toUpperCase() + subscription.subscription_plan.slice(1)} Plan`
                        : 'No active plan'
                      }
                    </p>
                  </div>
                  <div className={`px-6 py-3 rounded-full border-2 text-sm font-semibold ${getStatusColor(subscription.subscription_status)}`}>
                    {getStatusText(subscription.subscription_status)}
                  </div>
                </div>

                {/* Plan Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {subscription.trial_end_date && subscription.subscription_status === 'trial' && (
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/40 rounded-xl p-6 shadow-lg">
                      <div className="flex items-center text-green-400 mb-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-xl">🎉</span>
                        </div>
                        <span className="font-semibold text-lg">Free Trial Active</span>
                      </div>
                      <p className="text-green-300 font-medium">
                        Trial ends: {new Date(subscription.trial_end_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {subscription.next_payment_date && (
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/40 rounded-xl p-6 shadow-lg">
                      <div className="flex items-center text-blue-400 mb-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-xl">💳</span>
                        </div>
                        <span className="font-semibold text-lg">Next Billing</span>
                      </div>
                      <p className="text-blue-300 font-medium">
                        {new Date(subscription.next_payment_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {subscription.last_payment_date && (
                    <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/10 border border-gray-500/40 rounded-xl p-6 shadow-lg">
                      <div className="flex items-center text-gray-400 mb-3">
                        <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-xl">✅</span>
                        </div>
                        <span className="font-semibold text-lg">Last Payment</span>
                      </div>
                      <p className="text-gray-300 font-medium">
                        {new Date(subscription.last_payment_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {subscription.subscription_end_date && subscription.subscription_status === 'canceled' && (
                    <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/40 rounded-xl p-6 shadow-lg">
                      <div className="flex items-center text-yellow-400 mb-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-xl">⏰</span>
                        </div>
                        <span className="font-semibold text-lg">Access Until</span>
                      </div>
                      <p className="text-yellow-300 font-medium">
                        {new Date(subscription.subscription_end_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  {subscription.subscription_status === 'trial' && (
                    <button
                      onClick={() => navigate('/checkout/premium/monthly')}
                      className="bg-gradient-to-r from-[#EF8E81] to-[#E67A6E] hover:from-[#E67A6E] hover:to-[#D46A5A] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Upgrade Now
                    </button>
                  )}

                  {(subscription.subscription_status === 'active' || subscription.subscription_status === 'trial') && (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none"
                    >
                      {cancelLoading ? 'Canceling...' : 'Cancel Subscription'}
                    </button>
                  )}

                  <button
                    onClick={() => navigate('/app')}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>

              {/* Plan Comparison */}
              <div className="bg-gradient-to-br from-[#1B1628]/90 to-[#2A2438]/90 backdrop-blur-sm rounded-3xl border border-[#EF8E81]/20 p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-white mb-4">Available Plans</h3>
                  <p className="text-[#FFF1E7]/80 text-lg">Choose the plan that best fits your business needs</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Monthly Plan */}
                  <div className="bg-gradient-to-br from-[#2A2438]/50 to-[#1B1628]/50 border border-[#EF8E81]/30 rounded-2xl p-8 hover:border-[#EF8E81]/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="text-center mb-6">
                      <h4 className="text-2xl font-bold text-white mb-4">Monthly Access</h4>
                      <div className="text-4xl font-bold text-[#EF8E81] mb-2">
                        $14.99<span className="text-lg text-[#FFF1E7]/60">/month</span>
                      </div>
                      <p className="text-[#FFF1E7]/80">Perfect for getting started</p>
                    </div>
                    <ul className="space-y-3 text-[#FFF1E7]/90 mb-8">
                      <li className="flex items-center">
                        <span className="text-[#EF8E81] mr-3">✅</span>
                        Full MomentumDIY access
                      </li>
                      <li className="flex items-center">
                        <span className="text-[#EF8E81] mr-3">✅</span>
                        12-week marketing curriculum
                      </li>
                      <li className="flex items-center">
                        <span className="text-[#EF8E81] mr-3">✅</span>
                        AI marketing assistant
                      </li>
                      <li className="flex items-center">
                        <span className="text-[#EF8E81] mr-3">✅</span>
                        Task tracking & management
                      </li>
                    </ul>
                    {subscription.subscription_plan !== 'monthly' && (
                      <button
                        onClick={() => navigate('/checkout/monthly/monthly')}
                        className="w-full bg-gradient-to-r from-[#EF8E81] to-[#E67A6E] hover:from-[#E67A6E] hover:to-[#D46A5A] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
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
