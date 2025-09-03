import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from './lib/stripe';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);

export default function CheckoutPage() {
  const { plan, interval } = useParams<{ plan: string; interval: string }>();
  const navigate = useNavigate();

  // Validate plan and interval parameters
  const validPlans = ['monthly', 'annual', 'spark', 'growth', 'lead'];
  const validIntervals = ['monthly', 'yearly'];

  if (!plan || !interval || !validPlans.includes(plan) || !validIntervals.includes(interval)) {
    return (
      <div className="min-h-screen bg-[#0F0A1A] flex items-center justify-center">
        <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-red-500/30 p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-4">❌ Invalid Plan</div>
            <div className="text-gray-400 mb-6">The selected plan or billing interval is not valid.</div>
            <button
              onClick={() => window.history.back()}
              className="bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Plan details mapping
  const planDetails = {
    monthly: { name: 'MomentumDIY Monthly', price: '$29', description: 'Perfect for getting started' },
    annual: { name: 'MomentumDIY Annual', price: '$290', description: 'Save $58 with annual billing' },
    spark: { name: 'Spark Membership', price: '$49', description: 'Essential tools for growth' },
    growth: { name: 'Growth Membership', price: '$99', description: 'Advanced features for scaling' },
    lead: { name: 'Lead Membership', price: '$199', description: 'Complete marketing solution' }
  };

  const currentPlan = planDetails[plan as keyof typeof planDetails];

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError('');

      // Create Stripe Checkout Session
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://momentumdiy-backend.onrender.com/api'}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          interval,
          successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0A1A] flex items-center justify-center p-4">
      <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-[#EF8E81]/30 p-8 max-w-md w-full">
        <div className="text-center">
          {/* Plan Details */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#FFF1E7] mb-2">
              {currentPlan.name}
            </h1>
            <div className="text-4xl font-bold text-[#EF8E81] mb-2">
              {currentPlan.price}
              <span className="text-lg text-gray-400">/{interval === 'yearly' ? 'year' : 'month'}</span>
            </div>
            <p className="text-gray-400 text-sm">
              {currentPlan.description}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-[#EF8E81] hover:bg-[#E67A6E] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-medium transition-colors mb-4"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              `Pay ${currentPlan.price} - Continue to Checkout`
            )}
          </button>

          {/* Security Notice */}
          <div className="text-xs text-gray-500 mb-4">
            🔒 Secure payment powered by Stripe
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate('/pricing')}
            className="text-gray-400 hover:text-gray-300 text-sm underline"
          >
            ← Back to Pricing
          </button>
        </div>
      </div>
    </div>
  );
}