import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/app/subscription/success`,
      },
    });

    if (error) {
      setMessage(error.message || 'An unexpected error occurred.');
      setIsLoading(false);
    } else {
      // Payment succeeded - redirect will happen automatically
      setMessage('Payment processing...');
    }
  };

  const paymentElementOptions = {
    layout: 'tabs' as const,
  };

  return (
    <form onSubmit={handleSubmit} className="p-8">
      <div className="space-y-6">
        {/* Payment Method Section */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
          <div className="bg-[#2A243E]/30 rounded-lg p-4">
            <PaymentElement
              id="payment-element"
              options={paymentElementOptions}
              className="min-h-[200px]"
            />
          </div>
        </div>

        {/* Billing Information Note */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-blue-400 mr-3 mt-0.5">ℹ️</span>
            <div>
              <h4 className="text-blue-400 font-medium mb-1">Billing Information</h4>
              <p className="text-sm text-blue-300">
                Your card will not be charged during the 30-day trial period.
                Billing will start automatically after the trial ends.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {message && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center text-red-400">
              <span className="mr-2">⚠️</span>
              <span>{message}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/app')}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || isLoading}
            className="flex-1 bg-[#EF8E81] hover:bg-[#E67A6E] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              'Start Free Trial'
            )}
          </button>
        </div>

        {/* Terms */}
        <div className="text-center text-sm text-gray-400">
          By subscribing, you agree to our{' '}
          <a href="/terms" className="text-[#EF8E81] hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-[#EF8E81] hover:underline">
            Privacy Policy
          </a>
        </div>
      </div>
    </form>
  );
}
