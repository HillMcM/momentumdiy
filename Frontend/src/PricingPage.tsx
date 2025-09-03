import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PricingPage() {
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      id: 'momentumdiy',
      name: 'MomentumDIY',
      description: 'Self-guided 12-week marketing track with weekly lessons & tasks.',
      price: {
        monthly: 14.99,
        yearly: 143.88,
      },
      features: [
        'Access to all current & future core features',
        'Weekly dripped lessons & step-by-step tasks',
        'On-page AI assistant guidance',
        'Task tracker, templates & checklists',
        'Cancel anytime — your data stays yours',
        '30-day free trial, no credit card required',
      ],
      popular: true,
      cta: 'Start 30-Day Free Trial',
      tag: 'Most Popular',
      tagColor: 'bg-green-500',
    },
    {
      id: 'spark',
      name: 'Spark',
      description: 'Everything in MomentumDIY + 1 hour of 1:1 consulting each month.',
      price: {
        monthly: 100,
        yearly: 1100,
      },
      features: [
        '1 hr/month strategy or execution support',
        'Prioritized Q&A via email',
        'Flexible scheduling to fit your month',
        'Includes full MomentumDIY access',
      ],
      popular: false,
      cta: 'Choose Spark',
      tag: 'Great for getting unstuck',
      tagColor: 'bg-gray-600',
    },
    {
      id: 'growth',
      name: 'Growth',
      description: 'Everything in MomentumDIY + 5 hours of 1:1 support each month.',
      price: {
        monthly: 600,
        yearly: 6600,
      },
      features: [
        '5 hrs/month hands-on strategy & execution',
        'Roadmap planning & accountability',
        'Priority turnaround on deliverables',
        'Includes full MomentumDIY access',
      ],
      popular: false,
      cta: 'Choose Growth',
      tag: 'Best for momentum',
      tagColor: 'bg-gray-600',
    },
    {
      id: 'lead',
      name: 'Lead',
      description: 'Everything in MomentumDIY + 10 hours of 1:1 support each month.',
      price: {
        monthly: 1400,
        yearly: 15400,
      },
      features: [
        '10 hrs/month strategy, content & campaigns',
        'Deeper collaboration & sprint reviews',
        'Priority access & scheduling',
        'Includes full MomentumDIY access',
      ],
      popular: false,
      cta: 'Choose Lead',
      tag: 'Done-with-you powerhouse',
      tagColor: 'bg-gray-600',
    },
  ];

  const handleSelectPlan = (planId: string) => {
    const interval = planId === 'momentumdiy' && billingInterval === 'yearly' ? 'yearly' : 'monthly';
    navigate(`/checkout/${planId}/${interval}`);
  };

  return (
    <div className="min-h-screen bg-[#0F0A1A] text-white">
      {/* Trial Banner */}
      <div className="bg-green-500 text-center py-3">
        <span className="text-white font-medium">30-Day Free Trial • No Credit Card</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">Simple, Affordable Pricing — Forever.</h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            One clear plan to get your marketing moving. Add expert help only if you want it.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <span className={`text-lg ${billingInterval === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                billingInterval === 'yearly' ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                billingInterval === 'yearly' ? 'translate-x-9' : 'translate-x-1'
              }`} />
            </button>
            <span className={`text-lg ${billingInterval === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
              Save ~20% annually
            </span>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-[#242836] rounded-2xl border transition-all duration-300 ${
                plan.popular
                  ? 'border-green-500 shadow-lg shadow-green-500/20'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              {/* Tag */}
              <div className="absolute -top-3 left-4">
                <div className={`${plan.tagColor} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                  {plan.tag}
                </div>
              </div>

              <div className="p-8 pt-12">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-3">{plan.name}</h3>
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">{plan.description}</p>

                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">
                      ${billingInterval === 'monthly' ? plan.price.monthly : plan.price.yearly}
                    </span>
                    <span className="text-gray-400 text-lg">
                      /{billingInterval === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>

                  {plan.id === 'momentumdiy' && billingInterval === 'yearly' && (
                    <div className="text-gray-300 text-sm">
                      ≈ $11.99/mo • Save 20%
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-300">
                      <span className="text-green-500 mr-3 mt-1 text-lg">✓</span>
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                    plan.popular
                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                      : 'bg-gray-600 hover:bg-gray-500 text-white'
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Billing Info */}
                <div className="text-center mt-4">
                  <p className="text-gray-400 text-sm">
                    {plan.id === 'momentumdiy' && billingInterval === 'yearly' 
                      ? 'Billed $143.88 yearly (≈ $11.99/mo). Save 20% vs monthly.'
                      : 'Billed monthly. Upgrade/downgrade anytime.'
                    }
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-[#242836] rounded-2xl p-8">
            <p className="text-gray-300 text-lg mb-4 leading-relaxed">
              "MomentumDIY helped us finally stick to a plan. We ran our first real campaign and saw a clear uptick in foot traffic."
            </p>
            <p className="text-gray-400 text-sm">— Jamie, Café Owner</p>
          </div>
          <div className="bg-[#242836] rounded-2xl p-8">
            <p className="text-gray-300 text-lg mb-4 leading-relaxed">
              "The weekly tasks made marketing doable. Adding a monthly hour of coaching gave us the nudge we needed."
            </p>
            <p className="text-gray-400 text-sm">— Marco, Home Services</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Pricing & Plan FAQs</h2>
        </div>

        <div className="bg-[#242836] rounded-2xl p-8 mb-16">
          <div className="space-y-6">
            <div className="border-b border-gray-600 pb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Is MomentumDIY right for my business?</h3>
              <p className="text-gray-300">
                Yes—MomentumDIY was built for local businesses under ~$1M in annual revenue who want a clear, doable marketing plan with weekly steps.
              </p>
            </div>

            <div className="border-b border-gray-600 pb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Will my price ever go up?</h3>
              <p className="text-gray-300">
                Your core subscription price is locked in for life. If our public price changes later, yours won't.
              </p>
            </div>

            <div className="border-b border-gray-600 pb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Can I upgrade to a consulting package later?</h3>
              <p className="text-gray-300">
                Absolutely. Start with the DIY plan and add Spark, Growth, or Lead anytime. You can change or cancel monthly.
              </p>
            </div>

            <div className="border-b border-gray-600 pb-6">
              <h3 className="text-lg font-semibold text-white mb-3">What do consulting hours include?</h3>
              <p className="text-gray-300">
                Strategy sessions, content/creative feedback, campaign setup support, and light execution—focused on the tasks you're tackling that month.
              </p>
            </div>

            <div className="border-b border-gray-600 pb-6">
              <h3 className="text-lg font-semibold text-white mb-3">I'm not tech-savvy—will I be able to use this?</h3>
              <p className="text-gray-300">
                Yes. Lessons are in plain English with step-by-step tasks. The on-page assistant guides you and explains terms along the way.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Is this a course or an agency?</h3>
              <p className="text-gray-300">
                It's an action system with weekly implementation, not a passive course. Add consulting if you want hands-on help without agency retainers.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="text-center mb-16">
          <p className="text-gray-300 text-lg mb-8">
            Trusted by local businesses who want clear, doable marketing — not jargon.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Coffee Shops
            </button>
            <button className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Trades & Services
            </button>
            <button className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Retail
            </button>
            <button className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Wellness
            </button>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-[#1A1D29] to-[#242836] rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to gain momentum?</h2>
            <p className="text-gray-300 text-lg mb-8">
              Start your 30-day free trial. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/checkout/momentumdiy/yearly')}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-600 hover:bg-gray-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Questions? Contact us
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-6">
              Cancel anytime • Your data stays yours • Forever price guarantee
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-gray-700">
        <p className="text-gray-400">© 2025 MomentumDIY. All rights reserved.</p>
      </div>
    </div>
  );
}
