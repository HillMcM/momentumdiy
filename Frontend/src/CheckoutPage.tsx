import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './components/CheckoutForm';
import { STRIPE_CONFIG } from './lib/stripe';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);

export default function CheckoutPage() {
  const { plan, interval } = useParams<{ plan: string; interval: string }>();

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

  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Create subscription on page load
    createSubscription();
  }, [plan, interval]);

  const createSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(window as any).supabase?.auth?.session?.access_token}`,
        },
        body: JSON.stringify({
          plan,
          interval,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      setClientSecret(data.data.clientSecret);
    } catch (err) {
      console.error('Error creating subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#EF8E81',
        colorBackground: '#1B1628',
        colorText: '#FFF1E7',
        colorDanger: '#df1b41',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '2px',
        borderRadius: '6px',
      },
      rules: {
        '.Input': {
          boxShadow: '0 0 0 1px #2A243E',
        },
        '.Input:focus': {
          boxShadow: '0 0 0 2px #EF8E81',
        },
      },
    },
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
            <div className="text-red-400 text-xl mb-4">❌ Checkout Error</div>
            <div className="text-gray-400 mb-6">{error}</div>
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

  return (
    <div className="min-h-screen bg-[#0F0A1A] py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-[#2A243E]/60 overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-[#2A243E]/60">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Start Your 30-Day Free Trial
              </h1>
              <p className="text-gray-400">
                No credit card required • Cancel anytime
              </p>
            </div>

            {/* Plan Details */}
            <div className="mt-8 bg-[#2A243E]/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white capitalize">
                    {plan === 'monthly' && 'Monthly Access'}
                    {plan === 'annual' && 'Annual Access'}
                    {plan === 'spark' && 'Spark Membership'}
                    {plan === 'growth' && 'Growth Membership'}
                    {plan === 'lead' && 'Lead Membership'}
                  </h3>
                  <p className="text-gray-400">
                    {plan === 'monthly' && 'Full MomentumDIY access'}
                    {plan === 'annual' && 'Full MomentumDIY access (save 20%)'}
                    {plan === 'spark' && 'MomentumDIY + 1hr marketing consultation'}
                    {plan === 'growth' && 'MomentumDIY + 5hrs marketing consultation'}
                    {plan === 'lead' && 'MomentumDIY + 10hrs marketing consultation'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#EF8E81]">
                    {plan === 'monthly' && '$14.99'}
                    {plan === 'annual' && '$143.88'}
                    {plan === 'spark' && (interval === 'monthly' ? '$100' : '$1,100')}
                    {plan === 'growth' && (interval === 'monthly' ? '$600' : '$6,600')}
                    {plan === 'lead' && (interval === 'monthly' ? '$1,400' : '$15,400')}
                  </div>
                  <div className="text-sm text-gray-400">
                    {plan === 'monthly' ? 'per month' : plan === 'annual' ? 'per year' : `per ${interval}`}
                  </div>
                </div>
              </div>

              {/* Trial Notice */}
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center text-green-400">
                  <span className="mr-2">🎉</span>
                  <span className="font-medium">30-Day Free Trial</span>
                </div>
                <p className="text-sm text-green-300 mt-1">
                  You'll only be charged after your trial ends. Cancel anytime.
                </p>
              </div>
            </div>
          </div>

          {/* Stripe Elements */}
          {clientSecret && (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
