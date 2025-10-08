import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/useAuth';
import { API_URL } from './config/environment';
import { supabase } from './lib/supabase';

interface AffiliateDashboardData {
  affiliate: {
    id: string;
    referral_code: string;
    status: string;
    total_referrals: number;
    total_earnings: number;
    total_paid_out: number;
    pending_balance: number;
    connect_onboarding_complete: boolean;
    stripe_connect_account_id: string | null;
  };
  referrals: Array<{
    id: string;
    referred_user_id: string;
    referral_code_used: string;
    signed_up_at: string;
    first_payment_at: string | null;
    status: string;
    total_commission_earned: number;
    profiles: {
      business_name: string;
      contact_email: string;
    };
  }>;
  earnings: Array<{
    id: string;
    amount: number;
    subscription_amount: number;
    commission_month: number;
    earned_at: string;
    stripe_invoice_id: string;
  }>;
  payouts: Array<{
    id: string;
    amount: number;
    status: string;
    requested_at: string;
    processed_at: string | null;
    stripe_transfer_id: string | null;
  }>;
  stats: {
    conversionRate: number;
    activeReferrals: number;
    canRequestPayout: boolean;
    minPayout: number;
  };
}

export default function AffiliateDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AffiliateDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  const loadDashboard = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`${API_URL}/api/affiliate/dashboard`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        if (result.error === 'Affiliate account not found') {
          // Redirect to program page if user hasn't joined yet
          navigate('/app/affiliate/program');
          return;
        }
        setError(result.error || 'Failed to load dashboard');
        return;
      }

      setData(result.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getReferralUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?ref=${data?.affiliate.referral_code}`;
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(getReferralUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnectOnboarding = async () => {
    setConnectLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Not authenticated');
        return;
      }

      const currentUrl = window.location.origin;
      const response = await fetch(`${API_URL}/api/affiliate/connect/onboard`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${currentUrl}/app/affiliate/dashboard?onboarding=complete`,
          refreshUrl: `${currentUrl}/app/affiliate/dashboard?onboarding=refresh`,
        }),
      });

      const result = await response.json();

      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        alert('Failed to start onboarding: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error starting Connect onboarding:', err);
      alert('Failed to start onboarding');
    } finally {
      setConnectLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (!data?.stats.canRequestPayout) {
      return;
    }

    if (!data.affiliate.connect_onboarding_complete) {
      alert('Please complete Stripe Connect onboarding first');
      return;
    }

    setRequestingPayout(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`${API_URL}/api/affiliate/payout/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        alert('Payout requested successfully! It will be processed in the next monthly cycle.');
        loadDashboard(); // Reload to show updated balance
      } else {
        alert('Failed to request payout: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error requesting payout:', err);
      alert('Failed to request payout');
    } finally {
      setRequestingPayout(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B1628] via-[#231C37] to-[#1B1628] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B1628] via-[#231C37] to-[#1B1628] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error || 'Failed to load dashboard'}</div>
          <button
            onClick={() => navigate('/app/affiliate/program')}
            className="px-6 py-2 bg-[#2A243E] text-white rounded-lg hover:bg-[#3A344E]"
          >
            Join Affiliate Program
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B1628] via-[#231C37] to-[#1B1628] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Affiliate Dashboard</h1>
          <p className="text-gray-400">Track your referrals and earnings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
            <div className="text-sm text-gray-400 mb-1">Pending Balance</div>
            <div className="text-3xl font-bold text-white">{formatCurrency(data.affiliate.pending_balance)}</div>
          </div>

          <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
            <div className="text-sm text-gray-400 mb-1">Total Earnings</div>
            <div className="text-3xl font-bold text-white">{formatCurrency(data.affiliate.total_earnings)}</div>
          </div>

          <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
            <div className="text-sm text-gray-400 mb-1">Active Referrals</div>
            <div className="text-3xl font-bold text-white">{data.stats.activeReferrals}</div>
          </div>

          <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
            <div className="text-sm text-gray-400 mb-1">Conversion Rate</div>
            <div className="text-3xl font-bold text-white">{data.stats.conversionRate}%</div>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E] mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Your Referral Link</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={getReferralUrl()}
              readOnly
              className="flex-1 bg-[#1B1628] text-white px-4 py-3 rounded-lg border border-[#3A344E] focus:outline-none focus:border-[#EF8E81]"
            />
            <button
              onClick={copyReferralLink}
              className="px-6 py-3 bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <div className="mt-3 text-sm text-gray-400">
            Your code: <span className="font-mono text-white">{data.affiliate.referral_code}</span>
          </div>
        </div>

        {/* Payout Section */}
        <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E] mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Payouts</h2>
          
          {!data.affiliate.connect_onboarding_complete ? (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <div className="text-yellow-400 font-semibold mb-1">Complete Stripe Onboarding</div>
                  <p className="text-gray-400 text-sm mb-3">
                    To receive payouts, you need to complete Stripe Connect onboarding. This lets us transfer funds directly to your bank account.
                  </p>
                  <button
                    onClick={handleConnectOnboarding}
                    disabled={connectLoading}
                    className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                  >
                    {connectLoading ? 'Loading...' : 'Complete Onboarding'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-green-400">
                <div className="text-xl">✓</div>
                <div className="font-semibold">Stripe Connected</div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-400">Available Balance</div>
              <div className="text-2xl font-bold text-white">{formatCurrency(data.affiliate.pending_balance)}</div>
              <div className="text-xs text-gray-500">Minimum: ${data.stats.minPayout}</div>
            </div>
            <button
              onClick={handleRequestPayout}
              disabled={!data.stats.canRequestPayout || requestingPayout || !data.affiliate.connect_onboarding_complete}
              className="px-6 py-3 bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {requestingPayout ? 'Processing...' : 'Request Payout'}
            </button>
          </div>

          {/* Payout History */}
          {data.payouts.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">Payout History</h3>
              <div className="space-y-2">
                {data.payouts.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between bg-[#1B1628] p-3 rounded-lg">
                    <div>
                      <div className="text-white font-semibold">{formatCurrency(payout.amount)}</div>
                      <div className="text-xs text-gray-400">{formatDate(payout.requested_at)}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      payout.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      payout.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      payout.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {payout.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Referrals Table */}
        <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E] mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Your Referrals</h2>
          
          {data.referrals.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No referrals yet. Share your link to start earning!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#3A344E]">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">User</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Signed Up</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Commission Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {data.referrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-[#3A344E]/50">
                      <td className="py-3 px-4">
                        <div className="text-white">{referral.profiles?.business_name || 'Unknown'}</div>
                        <div className="text-xs text-gray-400">{referral.profiles?.contact_email}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{formatDate(referral.signed_up_at)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          referral.status === 'converted' ? 'bg-green-500/20 text-green-400' :
                          referral.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {referral.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-white font-semibold">
                        {formatCurrency(referral.total_commission_earned)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Earnings History */}
        <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
          <h2 className="text-xl font-bold text-white mb-4">Recent Earnings</h2>
          
          {data.earnings.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No earnings yet. Earnings will appear here once your referrals make payments.
            </div>
          ) : (
            <div className="space-y-2">
              {data.earnings.slice(0, 10).map((earning) => (
                <div key={earning.id} className="flex items-center justify-between bg-[#1B1628] p-3 rounded-lg">
                  <div>
                    <div className="text-white font-semibold">{formatCurrency(earning.amount)}</div>
                    <div className="text-xs text-gray-400">
                      {formatDate(earning.earned_at)} • Month {earning.commission_month}/12
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-sm">Subscription: {formatCurrency(earning.subscription_amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
