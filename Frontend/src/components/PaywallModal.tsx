import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  trialEndDate?: string;
  daysRemaining?: number;
}

export default function PaywallModal({ isOpen, onClose, trialEndDate, daysRemaining }: PaywallModalProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async (plan: string, interval: string) => {
    setIsLoading(true);
    try {
      navigate(`/checkout/${plan}/${interval}`);
    } catch (error) {
      console.error('Error navigating to checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1B1628] border border-[#EF8E81]/30 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#EF8E81]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#EF8E81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Your Free Trial Has Ended</h2>
          <p className="text-[#FFF1E7]/80 text-lg">
            {trialEndDate && `Your trial ended on ${formatDate(trialEndDate)}.`}
            {daysRemaining && daysRemaining > 0 && `You have ${daysRemaining} days left in your trial.`}
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-[#2A2438] rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Continue Your Marketing Journey</h3>
          <div className="space-y-3">
            {[
              'Complete marketing strategy platform',
              'Task management and tracking',
              'Marketing content library',
              'Progress monitoring tools',
              'Monthly support sessions',
              'Unlimited projects and campaigns'
            ].map((benefit, index) => (
              <div key={index} className="flex items-center text-[#FFF1E7]/90">
                <svg className="w-5 h-5 text-[#EF8E81] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Options */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Monthly Plan */}
          <div className="bg-[#2A2438] rounded-xl p-6 border border-[#EF8E81]/20">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white mb-2">MomentumDIY Monthly</h4>
              <div className="text-3xl font-bold text-[#EF8E81] mb-4">$14.99<span className="text-lg text-[#FFF1E7]/60">/month</span></div>
              <button
                onClick={() => handleSubscribe('monthly', 'monthly')}
                disabled={isLoading}
                className="w-full bg-[#EF8E81] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#E67A6E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Loading...' : 'Subscribe Monthly'}
              </button>
            </div>
          </div>

          {/* Annual Plan */}
          <div className="bg-[#2A2438] rounded-xl p-6 border border-[#EF8E81]/20 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#EF8E81] text-white px-3 py-1 rounded-full text-sm font-medium">
                Best Value
              </span>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white mb-2">MomentumDIY Annual</h4>
              <div className="text-3xl font-bold text-[#EF8E81] mb-4">$143.88<span className="text-lg text-[#FFF1E7]/60">/year</span></div>
              <div className="text-sm text-[#FFF1E7]/60 mb-4">Save 20% vs monthly</div>
              <button
                onClick={() => handleSubscribe('annual', 'yearly')}
                disabled={isLoading}
                className="w-full bg-[#EF8E81] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#E67A6E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Loading...' : 'Subscribe Annual'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-[#FFF1E7]/60 text-sm mb-4">
            Cancel anytime. No hidden fees. Secure payment powered by Stripe.
          </p>
          <button
            onClick={onClose}
            className="text-[#EF8E81] hover:text-[#E67A6E] text-sm underline"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
