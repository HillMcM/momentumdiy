import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PricingPage() {
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Access',
      description: 'Perfect for trying MomentumDIY',
      price: {
        monthly: 14.99,
        yearly: 143.88,
      },
      features: [
        'Full MomentumDIY platform access',
        '12-week marketing curriculum',
        'AI marketing assistant',
        'Task tracking & management',
        'Calendar integration',
        'Basic asset library',
      ],
      popular: false,
      cta: 'Start Monthly',
    },
    {
      id: 'annual',
      name: 'Annual Access',
      description: 'Best value - save 20%',
      price: {
        monthly: 11.99, // $143.88 / 12
        yearly: 143.88,
      },
      features: [
        'Everything in Monthly',
        'Priority support',
        'Early access to new features',
        'Advanced analytics',
        'Export capabilities',
        'Team collaboration tools',
      ],
      popular: true,
      cta: 'Start Annual',
      savings: 'Save $17.88 vs monthly',
    },
    {
      id: 'spark',
      name: 'Spark Membership',
      description: 'MomentumDIY + 1hr personal consultation',
      price: {
        monthly: 100,
        yearly: 1100,
      },
      features: [
        'Everything in Annual',
        '1 hour personal marketing consultation',
        'Strategy session with me',
        'Direct access via email',
        'Custom recommendations',
        'Implementation guidance',
      ],
      popular: false,
      cta: 'Choose Spark',
    },
    {
      id: 'growth',
      name: 'Growth Membership',
      description: 'MomentumDIY + 5hrs personal consultation',
      price: {
        monthly: 600,
        yearly: 6600,
      },
      features: [
        'Everything in Spark',
        '5 hours personal marketing consultation',
        'Complete strategy development',
        'Monthly check-in calls',
        'Implementation support',
        'Custom marketing plan',
      ],
      popular: false,
      cta: 'Choose Growth',
    },
    {
      id: 'lead',
      name: 'Lead Membership',
      description: 'MomentumDIY + 10hrs personal consultation',
      price: {
        monthly: 1400,
        yearly: 15400,
      },
      features: [
        'Everything in Growth',
        '10 hours personal marketing consultation',
        'Ongoing strategy refinement',
        'Weekly strategy sessions',
        'Complete marketing execution',
        'VIP priority support',
      ],
      popular: false,
      cta: 'Choose Lead',
    },
  ];

  const handleSelectPlan = (planId: string) => {
    const interval = planId === 'annual' ? 'yearly' : 'monthly';
    navigate(`/checkout/${planId}/${interval}`);
  };

  return (
    <div className="min-h-screen bg-[#0F0A1A]">
      {/* Header */}
      <div className="bg-[#1B1628]/80 backdrop-blur-sm border-b border-[#2A243E]/60">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Choose Your Plan</h1>
              <p className="text-gray-400 mt-2">Start your marketing momentum today</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-[#EF8E81] hover:text-[#E67A6E] font-medium"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-lg p-1 border border-[#2A243E]/60">
            <div className="flex">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  billingInterval === 'monthly'
                    ? 'bg-[#EF8E81] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('yearly')}
                className={`px-6 py-3 rounded-md font-medium transition-colors relative ${
                  billingInterval === 'yearly'
                    ? 'bg-[#EF8E81] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Trial Banner */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-[#EF8E81]/20 to-[#E67A6E]/20 border border-[#EF8E81]/30 rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="text-2xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-4">Start Your 30-Day Free Trial</h2>
            <p className="text-gray-300 mb-4">
              Try MomentumDIY completely free for 30 days. No credit card required.
              Cancel anytime during your trial.
            </p>
            <div className="text-[#EF8E81] font-semibold">No setup fees • No commitments</div>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border transition-all duration-300 ${
                plan.popular
                  ? 'border-[#EF8E81] shadow-lg shadow-[#EF8E81]/20'
                  : 'border-[#2A243E]/60 hover:border-[#2A243E]/80'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#EF8E81] text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

                  <div className="mb-2">
                    <span className="text-3xl font-bold text-[#EF8E81]">
                      ${billingInterval === 'monthly' ? plan.price.monthly : plan.price.yearly}
                    </span>
                    <span className="text-gray-400">
                      /{billingInterval === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>

                  {plan.savings && billingInterval === 'yearly' && (
                    <div className="text-green-400 text-sm font-medium">{plan.savings}</div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-300">
                      <span className="text-green-400 mr-3 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-[#EF8E81] hover:bg-[#E67A6E] text-white shadow-lg'
                      : 'bg-[#2A243E]/60 hover:bg-[#2A243E]/80 text-white border border-[#2A243E]/60'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-[#2A243E]/60 p-8">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">What's included in the free trial?</h4>
              <p className="text-gray-400">
                Everything! You get full access to all features, the 12-week marketing curriculum,
                AI assistant, and task management for 30 days completely free.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Can I cancel anytime?</h4>
              <p className="text-gray-400">
                Absolutely! Cancel anytime during your trial or after. If you cancel during the trial,
                you'll never be charged. After the trial, you can cancel at any time.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3">What are the consultation hours for?</h4>
              <p className="text-gray-400">
                The consultation hours are for personalized marketing strategy sessions with me.
                We'll work together to create and implement a marketing plan tailored to your business.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Do you offer refunds?</h4>
              <p className="text-gray-400">
                Yes! If you're not satisfied within the first 30 days after your trial ends,
                we'll provide a full refund. Customer satisfaction is our top priority.
              </p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-[#EF8E81]/10 to-[#E67A6E]/10 border border-[#EF8E81]/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Your Marketing Journey?</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Join hundreds of small business owners who have transformed their marketing with MomentumDIY.
              Start your free trial today and see the difference in just 30 days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/checkout/annual/yearly')}
                className="bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                Start Free Trial - Annual Plan
              </button>
              <button
                onClick={() => navigate('/checkout/monthly/monthly')}
                className="bg-[#2A243E]/60 hover:bg-[#2A243E]/80 text-white px-8 py-4 rounded-lg font-semibold transition-colors border border-[#2A243E]/60"
              >
                Try Monthly Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
