import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './config/environment';

export default function AffiliatePartnerApplicationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    companyName: '',
    industry: '',
    website: '',
    reasonForApplying: '',
    expectedReferralsPerMonth: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/affiliate/partner/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to submit application');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B1628] via-[#231C37] to-[#1B1628] flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-[#2A243E] rounded-xl p-8 border border-[#3A344E] text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-white mb-4">Application Submitted!</h1>
          <p className="text-gray-300 mb-6">
            Thank you for your interest in becoming an affiliate partner. We'll review your application 
            and get back to you within 2-3 business days.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B1628] via-[#231C37] to-[#1B1628] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6 text-center">
            Become an <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EF8E81] to-[#D4AF37]">Affiliate Partner</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto text-center">
            Are you a marketing professional, agency, or consultant? Partner with MomentumDIY and earn 
            20% recurring commissions for 12 months on every referral.
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
                <h4 className="text-lg font-semibold text-white mb-1">Apply & Get Approved</h4>
                <p className="text-gray-400">
                  Submit your application below. We'll review it and get back to you within 2-3 business days.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">Get Your Referral Link</h4>
                <p className="text-gray-400">
                  Once approved, you'll receive your unique referral code and dashboard access via email.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">Share Your Link</h4>
                <p className="text-gray-400">
                  Share your referral link with your clients and network. We track clicks for 90 days.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] flex items-center justify-center text-white font-bold">
                4
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
                5
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

        {/* FAQ Section */}
        <div className="mb-16">
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

            <details className="bg-[#2A243E] rounded-lg border border-[#3A344E] p-6 cursor-pointer">
              <summary className="text-lg font-semibold text-white">What's the difference between a regular affiliate and a partner affiliate?</summary>
              <p className="text-gray-400 mt-3">
                Partner affiliates are professionals (agencies, consultants, etc.) who refer their clients. Regular affiliates are app users who refer friends. Both earn the same 20% commission rate.
              </p>
            </details>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-[#2A243E] rounded-xl p-8 border border-[#3A344E] mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Apply?</h2>
            <p className="text-gray-300">
              Fill out the form below to apply for the affiliate partner program. We'll review your application and get back to you within 2-3 business days.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg p-4">
                {error}
              </div>
            )}

            <div>
              <label className="block text-white font-semibold mb-2">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-[#1B1628] border border-[#3A344E] rounded-lg text-white focus:outline-none focus:border-[#EF8E81]"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Full Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 bg-[#1B1628] border border-[#3A344E] rounded-lg text-white focus:outline-none focus:border-[#EF8E81]"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-3 bg-[#1B1628] border border-[#3A344E] rounded-lg text-white focus:outline-none focus:border-[#EF8E81]"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g., Marketing Agency, Business Consultant, etc."
                className="w-full px-4 py-3 bg-[#1B1628] border border-[#3A344E] rounded-lg text-white focus:outline-none focus:border-[#EF8E81]"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-3 bg-[#1B1628] border border-[#3A344E] rounded-lg text-white focus:outline-none focus:border-[#EF8E81]"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Why do you want to become an affiliate partner? *</label>
              <textarea
                required
                rows={4}
                value={formData.reasonForApplying}
                onChange={(e) => setFormData({ ...formData, reasonForApplying: e.target.value })}
                placeholder="Tell us about your business and why you think your clients would benefit from MomentumDIY..."
                className="w-full px-4 py-3 bg-[#1B1628] border border-[#3A344E] rounded-lg text-white focus:outline-none focus:border-[#EF8E81]"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Expected Referrals Per Month</label>
              <input
                type="number"
                min="0"
                value={formData.expectedReferralsPerMonth}
                onChange={(e) => setFormData({ ...formData, expectedReferralsPerMonth: e.target.value })}
                placeholder="e.g., 5, 10, 20"
                className="w-full px-4 py-3 bg-[#1B1628] border border-[#3A344E] rounded-lg text-white focus:outline-none focus:border-[#EF8E81]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>

        {/* Terms */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p className="text-center">
            By submitting this application, you agree to our{' '}
            <a href="/terms" className="text-[#EF8E81] hover:underline">Terms of Service</a>{' '}
            and{' '}
            <a href="/affiliate-terms" className="text-[#EF8E81] hover:underline">Affiliate Program Terms</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

