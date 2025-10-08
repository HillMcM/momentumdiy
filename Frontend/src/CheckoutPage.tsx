import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { STRIPE_CONFIG } from './lib/stripe';
import { apiService } from './services/api';
import { logger } from './utils/logger';

export default function CheckoutPage() {
  const { plan, interval } = useParams<{ plan: string; interval: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Debug logging
  logger.debug('CheckoutPage rendered', { plan, interval });
  logger.debug('Stripe products config', { productsCount: Object.keys(STRIPE_CONFIG.products).length });

  // Validate plan and interval parameters
  const validPlans = ['monthly', 'annual', 'spark', 'growth', 'lead'];
  const validIntervals = ['monthly', 'yearly'];

  // Get product information
  const product = plan && STRIPE_CONFIG.products[plan as keyof typeof STRIPE_CONFIG.products];
  logger.debug('Product found', { plan, hasProduct: !!product });

  if (!plan || !interval || !validPlans.includes(plan) || !validIntervals.includes(interval)) {
    return (
      <div className="min-h-screen bg-[#0F0A1A] flex items-center justify-center">
        <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-red-500/30 p-8 max-w-md">
          <h2 className="text-xl font-bold text-white mb-4">Invalid Plan</h2>
          <p className="text-gray-300 mb-4">The subscription plan you selected is not available.</p>
          <button
            onClick={() => navigate('/pricing')}
            className="w-full bg-[#EF8E81] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#E67A6E] transition-colors"
          >
            Return to Pricing
          </button>
        </div>
      </div>
    );
  }

  const handleCreateCheckout = async () => {
    if (!termsAccepted) {
      setError('Please accept the terms and conditions to continue.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      logger.info('Creating checkout session', { plan, interval });
      
      const response = await apiService.createCheckoutSession({
        plan,
        interval,
        successUrl: `${window.location.origin}/checkout/success`,
        cancelUrl: `${window.location.origin}/pricing`
      });

      logger.debug('Checkout session created', { success: response.success });

      // Handle both old and new response formats temporarily
      let sessionUrl = null;
      
      if (response.success && response.data?.sessionUrl) {
        // New format: {success: true, data: {sessionUrl: "..."}}
        sessionUrl = response.data.sessionUrl;
      } else if (response.success && (response as any).sessionId) {
        // Old format: {success: true, sessionId: "..."} - convert to session URL
        const sessionId = (response as any).sessionId;
        sessionUrl = `https://checkout.stripe.com/pay/${sessionId}`;
        logger.debug('Converting sessionId to sessionUrl', { hasSessionUrl: !!sessionUrl });
      }
      
      if (sessionUrl) {
        logger.info('Redirecting to Stripe checkout', { plan, interval });
        // Redirect to Stripe Checkout
        window.location.href = sessionUrl;
      } else {
        logger.error('Invalid checkout response format', { response });
        setError(`Failed to create checkout session. Response: ${JSON.stringify(response)}`);
      }
    } catch (error) {
      logger.error('Checkout creation failed', error, { plan, interval });
      setError(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    logger.warn('No product found for plan', { plan });
    return (
      <div className="min-h-screen bg-[#0F0A1A] flex items-center justify-center">
        <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-red-500/30 p-8 max-w-md">
          <h2 className="text-xl font-bold text-white mb-4">Product Not Found</h2>
          <p className="text-gray-300 mb-4">Unable to load product information for plan: {plan}</p>
          <p className="text-gray-400 text-sm mb-4">Available plans: {Object.keys(STRIPE_CONFIG.products).join(', ')}</p>
          <button
            onClick={() => navigate('/pricing')}
            className="w-full bg-[#EF8E81] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#E67A6E] transition-colors"
          >
            Return to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0A1A] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Complete Your Purchase</h1>
          <p className="text-gray-300 text-lg">You're just one step away from accessing MomentumDIY</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Summary */}
          <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

            {/* Product Details */}
            <div className="bg-[#2A2438] rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
              <p className="text-gray-300 mb-4">{product.description}</p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-300">
                  ${product.price}/{product.interval}
                </span>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <h4 className="text-white font-medium mb-3">What's Included:</h4>
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-600 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-white">Total</span>
                <span className="text-2xl font-bold text-[#EF8E81]">
                  ${product.price}/{product.interval}
                </span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Secure Checkout</h2>

            {/* Terms and Conditions */}
            <div className="mb-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 text-[#EF8E81] bg-gray-800 border-gray-600 rounded focus:ring-[#EF8E81]"
                />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-300">
                  I agree to the{' '}
                  <a href="/terms" className="text-[#EF8E81] hover:text-[#E67A6E] underline" target="_blank" rel="noopener noreferrer">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-[#EF8E81] hover:text-[#E67A6E] underline" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </a>
                  . I understand that this subscription will automatically renew and I can cancel at any time.
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Continue to Checkout Button */}
            <button
              onClick={handleCreateCheckout}
              disabled={loading || !termsAccepted}
              className="w-full bg-[#EF8E81] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-[#E67A6E] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Continue to Secure Checkout - $${product.price}/${product.interval}`
              )}
            </button>

            {/* Security Note */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center text-gray-400 text-sm">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secured by Stripe
              </div>
            </div>

            {/* Cancel Link */}
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/pricing')}
                className="text-gray-400 hover:text-white text-sm underline"
              >
                Return to Pricing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}