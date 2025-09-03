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
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100">
      {/* Hero */}
      <header className="relative isolate">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-10 sm:pt-24 sm:pb-12 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-400/20">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              30‑Day Free Trial • No Credit Card
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">Simple, Affordable Pricing — Forever.</h1>
            <p className="mt-4 text-lg text-slate-300">
              One clear plan to get your marketing moving. Add expert help only if you want it.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="mx-auto mt-10 flex max-w-3xl items-center justify-center gap-3 text-sm">
            <span className={billingInterval === 'monthly' ? "text-white" : "text-slate-400"}>Monthly</span>
            <button
              type="button"
              onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-8 w-16 items-center rounded-full bg-slate-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label="Toggle billing period"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${
                  billingInterval === 'yearly' ? "translate-x-9" : "translate-x-1"
                }`}
              />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 text-[11px] font-semibold">
                <span className={billingInterval === 'monthly' ? "opacity-100" : "opacity-40"}>Mo</span>
                <span className={billingInterval === 'yearly' ? "opacity-100" : "opacity-40"}>Yr</span>
              </span>
            </button>
            <span className={billingInterval === 'yearly' ? "text-emerald-300" : "text-slate-400"}>Save ~20% annually</span>
          </div>
        </div>
      </header>

      {/* Plans */}
      <main className="relative">
        <div className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl ring-1 ring-white/5 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-2xl ${
                  plan.popular && "border-emerald-500/40 ring-emerald-400/10"
                }`}
              >
                {plan.tag && (
                  <div className="mb-4 flex items-center gap-2">
                    {plan.popular ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-400/20">
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {plan.tag}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/40 px-2.5 py-1 text-xs font-medium text-slate-300 ring-1 ring-inset ring-white/10">
                        {plan.tag}
                      </span>
                    )}
                  </div>
                )}

                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-300">{plan.description}</p>

                {/* Price */}
                <div className="mt-5 flex items-end gap-2">
                  {plan.id === 'momentumdiy' ? (
                    billingInterval === 'yearly' ? (
                      <>
                        <span className="text-4xl font-bold tracking-tight text-white">$143.88</span>
                        <span className="mb-2 text-sm text-slate-400">/year</span>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-bold tracking-tight text-white">$14.99</span>
                        <span className="mb-2 text-sm text-slate-400">/month</span>
                      </>
                    )
                  ) : (
                    <>
                      <span className="text-4xl font-bold tracking-tight text-white">
                        ${billingInterval === 'monthly' ? plan.price.monthly : plan.price.yearly}
                      </span>
                      <span className="mb-2 text-sm text-slate-400">
                        /{billingInterval === 'monthly' ? 'month' : 'year'}
                      </span>
                    </>
                  )}
                </div>

                {plan.id === 'momentumdiy' && billingInterval === 'yearly' && (
                  <p className="mt-2 text-sm text-emerald-300">≈ $11.99/mo • Save 20%</p>
                )}

                {/* Features */}
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-slate-300">
                      <svg className="h-4 w-4 text-emerald-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`mt-8 w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400'
                      : 'bg-slate-800 text-slate-100 hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400'
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Billing Info */}
                <p className="mt-3 text-xs text-slate-400">
                  {plan.id === 'momentumdiy' && billingInterval === 'yearly' 
                    ? 'Billed $143.88 yearly (≈ $11.99/mo). Save 20% vs monthly.'
                    : 'Billed monthly. Upgrade/downgrade anytime.'
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Testimonials */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-800 ring-1 ring-white/5">
            <p className="text-slate-300 text-lg mb-4 leading-relaxed">
              "MomentumDIY helped us finally stick to a plan. We ran our first real campaign and saw a clear uptick in foot traffic."
            </p>
            <p className="text-slate-400 text-sm">— Jamie, Café Owner</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-800 ring-1 ring-white/5">
            <p className="text-slate-300 text-lg mb-4 leading-relaxed">
              "The weekly tasks made marketing doable. Adding a monthly hour of coaching gave us the nudge we needed."
            </p>
            <p className="text-slate-400 text-sm">— Marco, Home Services</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white text-center">Pricing & Plan FAQs</h2>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-slate-800 ring-1 ring-white/5">
          <div className="space-y-6">
            <div className="border-b border-slate-700 pb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Is MomentumDIY right for my business?</h3>
              <p className="text-slate-300">
                Yes—MomentumDIY was built for local businesses under ~$1M in annual revenue who want a clear, doable marketing plan with weekly steps.
              </p>
            </div>

            <div className="border-b border-slate-700 pb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Will my price ever go up?</h3>
              <p className="text-slate-300">
                Your core subscription price is locked in for life. If our public price changes later, yours won't.
              </p>
            </div>

            <div className="border-b border-slate-700 pb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Can I upgrade to a consulting package later?</h3>
              <p className="text-slate-300">
                Absolutely. Start with the DIY plan and add Spark, Growth, or Lead anytime. You can change or cancel monthly.
              </p>
            </div>

            <div className="border-b border-slate-700 pb-6">
              <h3 className="text-lg font-semibold text-white mb-3">What do consulting hours include?</h3>
              <p className="text-slate-300">
                Strategy sessions, content/creative feedback, campaign setup support, and light execution—focused on the tasks you're tackling that month.
              </p>
            </div>

            <div className="border-b border-slate-700 pb-6">
              <h3 className="text-lg font-semibold text-white mb-3">I'm not tech-savvy—will I be able to use this?</h3>
              <p className="text-slate-300">
                Yes. Lessons are in plain English with step-by-step tasks. The on-page assistant guides you and explains terms along the way.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Is this a course or an agency?</h3>
              <p className="text-slate-300">
                It's an action system with weekly implementation, not a passive course. Add consulting if you want hands-on help without agency retainers.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="text-center mb-16">
          <p className="text-slate-300 text-lg mb-8">
            Trusted by local businesses who want clear, doable marketing — not jargon.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-slate-800/60 hover:bg-slate-800/80 text-slate-100 px-6 py-3 rounded-lg font-medium transition-colors border border-slate-700">
              Coffee Shops
            </button>
            <button className="bg-slate-800/60 hover:bg-slate-800/80 text-slate-100 px-6 py-3 rounded-lg font-medium transition-colors border border-slate-700">
              Trades & Services
            </button>
            <button className="bg-slate-800/60 hover:bg-slate-800/80 text-slate-100 px-6 py-3 rounded-lg font-medium transition-colors border border-slate-700">
              Retail
            </button>
            <button className="bg-slate-800/60 hover:bg-slate-800/80 text-slate-100 px-6 py-3 rounded-lg font-medium transition-colors border border-slate-700">
              Wellness
            </button>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/60 rounded-2xl p-12 border border-slate-800 ring-1 ring-white/5">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to gain momentum?</h2>
            <p className="text-slate-300 text-lg mb-8">
              Start your 30-day free trial. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/checkout/momentumdiy/yearly')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-slate-800/60 hover:bg-slate-800/80 text-slate-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors border border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Questions? Contact us
              </button>
            </div>
            <p className="text-slate-400 text-sm mt-6">
              Cancel anytime • Your data stays yours • Forever price guarantee
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-slate-800">
        <p className="text-slate-400">© 2025 MomentumDIY. All rights reserved.</p>
      </div>
    </div>
  );
}
