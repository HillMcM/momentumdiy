import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/useAuth';
import { API_URL } from './config/environment';
import { supabase } from './lib/supabase';

interface EligibilityResponse {
  success: boolean;
  eligible: boolean;
  reason?: string;
}

export default function AffiliateProgramPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      checkEligibility();
    }
  }, [user]);

  const checkEligibility = async () => {
    if (!user) return;

    setChecking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`${API_URL}/api/affiliate/eligibility`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();
      setEligibility(data);
    } catch (err) {
      console.error('Error checking eligibility:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleOptIn = async () => {
    if (!user) {
      navigate('/auth?redirect=/app/affiliate/program');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`${API_URL}/api/affiliate/opt-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to join program');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/app/affiliate/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error joining program:', err);
      setError('Failed to join affiliate program');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B1628] via-[#231C37] to-[#1B1628]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Earn with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EF8E81] to-[#D4AF37]">MomentumDIY</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Share MomentumDIY with your network and earn 20% recurring commissions for 12 months on every referral.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-white mb-2">20% Commission</h3>
            <p className="text-gray-400">
              Earn 20% recurring revenue from every paid subscription for 12 months
            </p>
          </div>

          <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-white mb-2">Easy to Promote</h3>
            <p className="text-gray-400">
              Get a unique referral link and share it anywhere - social media, email, or your website
            </p>
          </div>

          <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-white mb-2">Fast Payouts</h3>
            <p className="text-gray-400">
              Receive monthly payouts directly to your bank account via Stripe (minimum $10)
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-[#2A243E] rounded-xl p-8 border border-[#3A344E] mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">How It Works</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">Join the Program</h4>
                <p className="text-gray-400">
                  Sign up and get your unique referral code. Must be subscribed for 30+ days.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">Share Your Link</h4>
                <p className="text-gray-400">
                  Share your referral link with friends, colleagues, or your audience. We track clicks for 90 days.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">Earn Commission</h4>
                <p className="text-gray-400">
                  When someone signs up and makes their first payment, you earn 20% of their subscription for 12 months.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] flex items-center justify-center text-white font-bold">
                4
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">Get Paid</h4>
                <p className="text-gray-400">
                  Once you reach $10, request a payout and receive funds directly to your bank account monthly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility and CTA */}
        <div className="bg-[#2A243E] rounded-xl p-8 border border-[#3A344E] text-center">
          {!user ? (
            <>
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Earning?</h3>
              <p className="text-gray-400 mb-6">
                Sign in to join the affiliate program and start earning commissions.
              </p>
              <button
                onClick={() => navigate('/auth?redirect=/app/affiliate/program')}
                className="px-8 py-3 bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Sign In to Join
              </button>
            </>
          ) : checking ? (
            <div className="text-gray-400">Checking eligibility...</div>
          ) : success ? (
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-white mb-2">Welcome to the Program!</h3>
              <p className="text-gray-400 mb-4">Redirecting to your dashboard...</p>
            </div>
          ) : eligibility?.eligible ? (
            <>
              <h3 className="text-2xl font-bold text-white mb-4">You're Eligible!</h3>
              <p className="text-gray-400 mb-6">
                You meet all requirements to join the affiliate program. Start earning today!
              </p>
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg p-4 mb-4">
                  {error}
                </div>
              )}
              <button
                onClick={handleOptIn}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join Affiliate Program'}
              </button>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-white mb-4">Not Eligible Yet</h3>
              <p className="text-gray-400 mb-6">
                {eligibility?.reason || 'You need to meet the eligibility requirements to join the program.'}
              </p>
              <div className="text-sm text-gray-500">
                Requirements: Active subscription for 30+ days
              </div>
            </>
          )}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-4 max-w-3xl mx-auto">
            <details className="bg-[#2A243E] rounded-lg border border-[#3A344E] p-6 cursor-pointer">
              <summary className="text-lg font-semibold text-white">How long do commissions last?</summary>
              <p className="text-gray-400 mt-3">
                You earn 20% commission for 12 months from when your referral makes their first payment.
              </p>
            </details>

            <details className="bg-[#2A243E] rounded-lg border border-[#3A344E] p-6 cursor-pointer">
              <summary className="text-lg font-semibold text-white">When do I get paid?</summary>
              <p className="text-gray-400 mt-3">
                Payouts are processed monthly. You can request a payout anytime your balance reaches $10 or more.
              </p>
            </details>

            <details className="bg-[#2A243E] rounded-lg border border-[#3A344E] p-6 cursor-pointer">
              <summary className="text-lg font-semibold text-white">How does the 90-day tracking work?</summary>
              <p className="text-gray-400 mt-3">
                When someone clicks your referral link, we track them for 90 days. If they sign up within that time, you get credit for the referral.
              </p>
            </details>

            <details className="bg-[#2A243E] rounded-lg border border-[#3A344E] p-6 cursor-pointer">
              <summary className="text-lg font-semibold text-white">Can I promote on social media?</summary>
              <p className="text-gray-400 mt-3">
                Absolutely! Share your referral link on social media, in blog posts, emails, or anywhere else you like.
              </p>
            </details>

            <details className="bg-[#2A243E] rounded-lg border border-[#3A344E] p-6 cursor-pointer">
              <summary className="text-lg font-semibold text-white">What if a referral cancels?</summary>
              <p className="text-gray-400 mt-3">
                If a referral cancels their subscription, you stop earning commissions for that user. However, you keep all commissions earned up to that point.
              </p>
            </details>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            By joining the affiliate program, you agree to our{' '}
            <a href="/terms" className="text-[#EF8E81] hover:underline">Terms of Service</a>{' '}
            and <span className="text-gray-400">Affiliate Program Terms</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
