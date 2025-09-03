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
    },
  ];

  const handleSelectPlan = (planId: string) => {
    const interval = planId === 'momentumdiy' && billingInterval === 'yearly' ? 'yearly' : 'monthly';
    navigate(`/checkout/${planId}/${interval}`);
  };

  return (
    <div className="min-h-screen bg-[#0F0A1A] text-white">
      {/* Trial Banner */}
      <div className="bg-[#2A243E]/60 text-center py-2">
        <span className="text-white text-sm font-medium">30-Day Free Trial • No Credit Card</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Simple, Affordable Pricing — Forever.</h1>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            One clear plan to get your marketing moving. Add expert help only if you want it.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex justify-center items-center gap-3 mb-8">
            <span className={`text-base ${billingInterval === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                billingInterval === 'yearly' ? 'bg-[#EF8E81]' : 'bg-gray-600'
              }`}
            >
              <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                billingInterval === 'yearly' ? 'translate-x-7' : 'translate-x-0.5'
              }`} />
            </button>
            <span className={`text-base ${billingInterval === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
              Save ~20% annually
            </span>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-[#1B1628]/90 backdrop-blur-sm rounded-xl border transition-all duration-300 ${
                plan.popular
                  ? 'border-[#EF8E81] shadow-lg shadow-[#EF8E81]/20'
                  : 'border-[#2A243E]/40 hover:border-[#2A243E]/60'
              }`}
            >
              {/* Tag */}
              <div className="absolute -top-2 left-4">
                <div className={`${plan.popular ? 'bg-[#EF8E81]' : 'bg-[#2A243E]/60'} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                  {plan.tag}
                </div>
              </div>

              <div className="p-6 pt-10">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">{plan.description}</p>

                  <div className="mb-3">
                    <span className="text-3xl font-bold text-white">
                      ${billingInterval === 'monthly' ? plan.price.monthly : plan.price.yearly}
                    </span>
                    <span className="text-gray-400 text-base">
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
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-300">
                      <span className="text-[#EF8E81] mr-2 mt-0.5 text-sm">✓</span>
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-base transition-all duration-200 ${
                    plan.popular
                      ? 'bg-[#EF8E81] hover:bg-[#E67A6E] text-[#191628] shadow-lg'
                      : 'bg-[#2A243E]/60 hover:bg-[#2A243E]/80 text-white border border-[#2A243E]/60'
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Billing Info */}
                <div className="text-center mt-3">
                  <p className="text-gray-400 text-xs">
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
          <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl p-8 border border-[#2A243E]/60">
            <p className="text-gray-300 text-lg mb-4 leading-relaxed text-center">
              "MomentumDIY helped us finally stick to a plan. We ran our first real campaign and saw a clear uptick in foot traffic."
            </p>
            <p className="text-gray-400 text-sm text-center">— Jamie, Café Owner</p>
          </div>
          <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl p-8 border border-[#2A243E]/60">
            <p className="text-gray-300 text-lg mb-4 leading-relaxed text-center">
              "The weekly tasks made marketing doable. Adding a monthly hour of coaching gave us the nudge we needed."
            </p>
            <p className="text-gray-400 text-sm text-center">— Marco, Home Services</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white text-center">Pricing & Plan FAQs</h2>
        </div>

        <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-[#2A243E]/60">
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
          <p className="text-gray-300 text-lg mb-8 text-center">
            Trusted by local businesses who want clear, doable marketing — not jargon.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-[#2A243E]/60 hover:bg-[#2A243E]/80 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-[#2A243E]/60">
              Coffee Shops
            </button>
            <button className="bg-[#2A243E]/60 hover:bg-[#2A243E]/80 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-[#2A243E]/60">
              Trades & Services
            </button>
            <button className="bg-[#2A243E]/60 hover:bg-[#2A243E]/80 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-[#2A243E]/60">
              Retail
            </button>
            <button className="bg-[#2A243E]/60 hover:bg-[#2A243E]/80 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-[#2A243E]/60">
              Wellness
            </button>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-[#1B1628]/80 to-[#2A243E]/60 rounded-2xl p-12 border border-[#2A243E]/60">
            <h2 className="text-3xl font-bold text-white mb-4 text-center">Ready to gain momentum?</h2>
            <p className="text-gray-300 text-lg mb-8 text-center">
              Start your 30-day free trial. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/checkout/momentumdiy/yearly')}
                className="bg-[#EF8E81] hover:bg-[#E67A6E] text-[#191628] px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-[#2A243E]/60 hover:bg-[#2A243E]/80 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors border border-[#2A243E]/60"
              >
                Questions? Contact us
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-6 text-center">
              Cancel anytime • Your data stays yours • Forever price guarantee
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-[#2A243E]/60">
        <p className="text-gray-400 text-center">© 2025 MomentumDIY. All rights reserved.</p>
      </div>
    </div>
  );
}
