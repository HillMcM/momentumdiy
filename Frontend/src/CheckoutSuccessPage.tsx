import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    // Verify the payment and create account
    verifyPaymentAndCreateAccount();
  }, [sessionId]);

  const verifyPaymentAndCreateAccount = async () => {
    try {
      // Call backend to verify payment and get customer details
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://momentumdiy-backend.onrender.com/api'}/stripe/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      const { customer, subscription } = await response.json();
      
      // Create Supabase account with customer email
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: customer.email,
        password: generateTemporaryPassword(),
        options: {
          data: {
            full_name: customer.name || '',
            stripe_customer_id: customer.id,
            subscription_id: subscription.id,
          }
        }
      });

      if (authError) {
        // If user already exists, sign them in
        if (authError.message.includes('already registered')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: customer.email,
            password: 'temporary_password', // This won't work, but we'll handle it
          });

          if (signInError) {
            // Send password reset email
            await supabase.auth.resetPasswordForEmail(customer.email, {
              redirectTo: `${window.location.origin}/auth?reset=true`,
            });
          }
        } else {
          throw authError;
        }
      }

      setSuccess(true);
    } catch (err) {
      console.error('Payment verification error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateTemporaryPassword = () => {
    return Math.random().toString(36).slice(-12) + '!';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0A1A] flex items-center justify-center">
        <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-[#EF8E81]/30 p-8 max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF8E81] mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-[#FFF1E7] mb-2">Processing Payment</h2>
            <p className="text-gray-400">Please wait while we verify your payment and set up your account...</p>
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
            <div className="text-red-400 text-xl mb-4">❌ Error</div>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => navigate('/pricing')}
              className="bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Pricing
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0F0A1A] flex items-center justify-center">
        <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-green-500/30 p-8 max-w-md">
          <div className="text-center">
            <div className="text-green-400 text-4xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-[#FFF1E7] mb-4">Payment Successful!</h2>
            <p className="text-gray-400 mb-6">
              Your subscription is now active. Check your email for login details and to set up your password.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
