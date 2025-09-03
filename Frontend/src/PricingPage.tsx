import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// MomentumDIY Pricing Page Mockup
// - Single-file React component using Tailwind CSS
// - Includes: hero, billing toggle, plan cards, trust band, testimonials, FAQ, final CTA
// - Notes:
//   • The annual toggle affects the DIY software plan only (consulting packages are monthly).
//   • Replace href="#" with your actual signup/checkout routes.
//   • Tailwind classes assume Tailwind is available in your project.

function classNames(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ")
}

const Check = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
)

const Star = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M11.48 3.499a1 1 0 0 1 1.04 0l2.91 1.76a1 1 0 0 0 .7.12l3.36-.62a1 1 0 0 1 1.15 1.17l-.62 3.36a1 1 0 0 0 .12.7l1.76 2.91a1 1 0 0 1-.37 1.37l-3.05 1.76a1 1 0 0 0-.5.64l-.81 3.32a1 1 0 0 1-1.27.73l-3.25-1.07a1 1 0 0 0-.66 0L8.33 21.9a1 1 0 0 1-1.27-.73l-.81-3.32a1 1 0 0 0-.5-.64L2.7 15.06a1 1 0 0 1-.37-1.37l1.76-2.91a1 1 0 0 0 .12-.7l-.62-3.36a1 1 0 0 1 1.15-1.17l3.36.62a1 1 0 0 0 .7-.12l2.91-1.76Z" />
  </svg>
)

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const navigate = useNavigate()

  // Pricing constants
  const DIY_MONTHLY = 14.99
  const DIY_ANNUAL = 143.88 // charged yearly
  const DIY_ANNUAL_EQ = useMemo(() => (DIY_ANNUAL / 12).toFixed(2), []) // 11.99
  const DIY_SAVE_PCT = useMemo(() => Math.round((1 - DIY_ANNUAL / (DIY_MONTHLY * 12)) * 100), []) // ~20%

  const plans = [
    {
      key: "diy",
      name: "MomentumDIY",
      badge: "Most Popular",
      description: "Self-guided 12-week marketing track with weekly lessons & tasks.",
      monthlyPrice: DIY_MONTHLY,
      annualPrice: DIY_ANNUAL,
      annualMonthlyEq: DIY_ANNUAL_EQ,
      monthlyOnly: false,
      cta: annual ? "Start 30‑Day Free Trial" : "Start 30‑Day Free Trial",
      href: annual ? "/checkout/momentumdiy/yearly" : "/checkout/momentumdiy/monthly",
      highlight: true,
      bullets: [
        "Access to all current & future core features",
        "Weekly dripped lessons & step‑by‑step tasks",
        "On‑page AI assistant guidance",
        "Task tracker, templates & checklists",
        "Cancel anytime — your data stays yours",
        "30‑day free trial, no credit card required",
      ],
      footnote: annual
        ? `Billed $${DIY_ANNUAL.toFixed(2)} yearly (≈ $${DIY_ANNUAL_EQ}/mo). Save ${DIY_SAVE_PCT}% vs monthly.`
        : "Billed monthly. Switch to annual anytime.",
    },
    {
      key: "spark",
      name: "Spark",
      badge: "Great for getting unstuck",
      description: "Everything in MomentumDIY + 1 hour of 1:1 consulting each month.",
      monthlyPrice: 100,
      monthlyOnly: true,
      cta: "Choose Spark",
      href: "/checkout/spark/monthly",
      highlight: false,
      bullets: [
        "1 hr/month strategy or execution support",
        "Prioritized Q&A via email",
        "Flexible scheduling to fit your month",
        "Includes full MomentumDIY access",
      ],
      footnote: "Billed monthly. Upgrade/downgrade anytime.",
    },
    {
      key: "growth",
      name: "Growth",
      badge: "Best for momentum",
      description: "Everything in MomentumDIY + 5 hours of 1:1 support each month.",
      monthlyPrice: 600,
      monthlyOnly: true,
      cta: "Choose Growth",
      href: "/checkout/growth/monthly",
      highlight: false,
      bullets: [
        "5 hrs/month hands‑on strategy & execution",
        "Roadmap planning & accountability",
        "Priority turnaround on deliverables",
        "Includes full MomentumDIY access",
      ],
      footnote: "Billed monthly. Upgrade/downgrade anytime.",
    },
    {
      key: "lead",
      name: "Lead",
      badge: "Done‑with‑you powerhouse",
      description: "Everything in MomentumDIY + 10 hours of 1:1 support each month.",
      monthlyPrice: 1400,
      monthlyOnly: true,
      cta: "Choose Lead",
      href: "/checkout/lead/monthly",
      highlight: false,
      bullets: [
        "10 hrs/month strategy, content & campaigns",
        "Deeper collaboration & sprint reviews",
        "Priority access & scheduling",
        "Includes full MomentumDIY access",
      ],
      footnote: "Billed monthly. Upgrade/downgrade anytime.",
    },
  ] as const

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0F0A1A] via-[#0F0A1A] to-[#1B1628] text-[#FFF1E7]">
      {/* Hero */}
      <header className="relative isolate">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-10 sm:pt-24 sm:pb-12 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#EF8E81]/10 px-3 py-1 text-xs font-medium text-[#EF8E81] ring-1 ring-inset ring-[#EF8E81]/20">
              <Star className="h-3 w-3" /> 30‑Day Free Trial • No Credit Card
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl text-[#FFF1E7]">Simple, Affordable Pricing — Forever.</h1>
            <p className="mt-4 text-lg text-gray-300">
              One clear plan to get your marketing moving. Add expert help only if you want it.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="mx-auto mt-10 flex max-w-3xl items-center justify-center gap-3 text-sm">
            <span className={classNames(!annual && "text-[#FFF1E7]", annual && "text-gray-400")}>Monthly</span>
            <button
              type="button"
              onClick={() => setAnnual((v) => !v)}
              className="relative inline-flex h-8 w-16 items-center rounded-full bg-[#2A243E] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF8E81]"
              aria-label="Toggle billing period"
            >
              <span
                className={classNames(
                  "inline-block h-6 w-6 transform rounded-full bg-white shadow transition",
                  annual ? "translate-x-9" : "translate-x-1"
                )}
              />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 text-[11px] font-semibold">
                <span className={classNames(!annual && "opacity-100", annual && "opacity-40")}>Mo</span>
                <span className={classNames(annual && "opacity-100", !annual && "opacity-40")}>Yr</span>
              </span>
            </button>
            <span className={classNames(annual && "text-[#EF8E81]", !annual && "text-gray-400")}>Save ~20% annually</span>
          </div>
        </div>
      </header>

      {/* Plans */}
      <main className="relative">
        <div className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((p) => (
              <div
                key={p.key}
                className={classNames(
                  "group relative rounded-2xl border border-[#2A243E] bg-[#1B1628]/80 p-6 shadow-xl ring-1 ring-white/5 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-2xl",
                  p.highlight && "border-[#EF8E81]/40 ring-[#EF8E81]/10"
                )}
              >
                {p.badge && (
                  <div className="mb-4 flex items-center gap-2">
                    {p.highlight ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#EF8E81]/15 px-2.5 py-1 text-xs font-semibold text-[#EF8E81] ring-1 ring-inset ring-[#EF8E81]/20">
                        <Star className="h-3.5 w-3.5" /> {p.badge}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#2A243E]/60 px-2.5 py-1 text-xs font-medium text-gray-300 ring-1 ring-inset ring-white/10">
                        {p.badge}
                      </span>
                    )}
                  </div>
                )}

                <h3 className="text-xl font-semibold text-[#FFF1E7]">{p.name}</h3>
                <p className="mt-1 text-sm text-gray-300">{p.description}</p>

                {/* Price */}
                <div className="mt-5 flex items-end gap-2">
                  {p.key === "diy" ? (
                    annual ? (
                      <>
                        <span className="text-4xl font-bold tracking-tight text-[#FFF1E7]">${DIY_ANNUAL.toFixed(2)}</span>
                        <span className="mb-2 text-sm text-gray-400">/year</span>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-bold tracking-tight text-[#FFF1E7]">${DIY_MONTHLY.toFixed(2)}</span>
                        <span className="mb-2 text-sm text-gray-400">/month</span>
                      </>
                    )
                  ) : (
                    <>
                      <span className="text-4xl font-bold tracking-tight text-[#FFF1E7]">${p.monthlyPrice.toFixed(0)}</span>
                      <span className="mb-2 text-sm text-gray-400">/month</span>
                    </>
                  )}
                </div>

                {p.key === "diy" && annual && (
                  <p className="mt-1 text-xs text-[#EF8E81]">≈ ${DIY_ANNUAL_EQ}/mo • Save {DIY_SAVE_PCT}%</p>
                )}

                {/* CTA */}
                <div className="mt-5">
                  <button
                    onClick={() => navigate(p.href)}
                    className={classNames(
                      "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2",
                      p.highlight
                        ? "bg-[#EF8E81] text-[#191628] hover:bg-[#E67A6E] focus-visible:ring-[#EF8E81]"
                        : "bg-[#2A243E]/60 text-[#FFF1E7] hover:bg-[#2A243E]/80 focus-visible:ring-[#EF8E81]"
                    )}
                  >
                    {p.cta}
                  </button>
                  <p className="mt-2 text-xs text-gray-400">{p.footnote}</p>
                </div>

                {/* Features */}
                <ul className="mt-6 space-y-2 text-sm">
                  {p.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="mt-[2px] h-4 w-4 flex-none text-[#EF8E81]" />
                      <span className="text-gray-200">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Trust band */}
          <div className="mx-auto mt-14 max-w-5xl rounded-2xl border border-[#2A243E] bg-[#1B1628]/50 p-6 text-center ring-1 ring-white/5">
            <p className="text-sm text-gray-300">
              Trusted by local businesses who want clear, doable marketing — not jargon.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 opacity-80 sm:grid-cols-4">
              <div className="rounded-lg bg-[#2A243E]/60 px-3 py-2 text-xs text-gray-200">Coffee Shops</div>
              <div className="rounded-lg bg-[#2A243E]/60 px-3 py-2 text-xs text-gray-200">Trades & Services</div>
              <div className="rounded-lg bg-[#2A243E]/60 px-3 py-2 text-xs text-gray-200">Retail</div>
              <div className="rounded-lg bg-[#2A243E]/60 px-3 py-2 text-xs text-gray-200">Wellness</div>
            </div>
          </div>

          {/* Testimonials */}
          <section className="mx-auto mt-12 max-w-5xl">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <figure className="rounded-2xl border border-[#2A243E] bg-[#1B1628]/50 p-6 ring-1 ring-white/5">
                <blockquote className="text-gray-200">
                  "MomentumDIY helped us finally stick to a plan. We ran our first real campaign and saw a clear uptick in foot traffic."
                </blockquote>
                <figcaption className="mt-4 text-sm text-gray-400">— Jamie, Café Owner</figcaption>
              </figure>
              <figure className="rounded-2xl border border-[#2A243E] bg-[#1B1628]/50 p-6 ring-1 ring-white/5">
                <blockquote className="text-gray-200">
                  "The weekly tasks made marketing doable. Adding a monthly hour of coaching gave us the nudge we needed."
                </blockquote>
                <figcaption className="mt-4 text-sm text-gray-400">— Marco, Home Services</figcaption>
              </figure>
            </div>
          </section>

          {/* FAQ */}
          <section className="mx-auto mt-16 max-w-4xl">
            <h2 className="text-center text-2xl font-semibold text-[#FFF1E7]">Pricing & Plan FAQs</h2>
            <div className="mt-6 divide-y divide-[#2A243E] rounded-2xl border border-[#2A243E] bg-[#1B1628]/50 ring-1 ring-white/5">
              <details className="group p-6 open:bg-[#1B1628]/60">
                <summary className="flex cursor-pointer list-none items-center justify-between text-left text-base font-medium text-[#FFF1E7]">
                  Is MomentumDIY right for my business?
                  <span className="ml-4 text-gray-400 transition group-open:rotate-180">▾</span>
                </summary>
                <p className="mt-3 text-sm text-gray-300">
                  Yes—MomentumDIY was built for local businesses under ~$1M in annual revenue who want a clear, doable marketing plan with weekly steps.
                </p>
              </details>
              <details className="group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-left text-base font-medium text-[#FFF1E7]">
                  Will my price ever go up?
                  <span className="ml-4 text-gray-400 transition group-open:rotate-180">▾</span>
                </summary>
                <p className="mt-3 text-sm text-gray-300">
                  Your core subscription price is locked in for life. If our public price changes later, yours won't.
                </p>
              </details>
              <details className="group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-left text-base font-medium text-[#FFF1E7]">
                  Can I upgrade to a consulting package later?
                  <span className="ml-4 text-gray-400 transition group-open:rotate-180">▾</span>
                </summary>
                <p className="mt-3 text-sm text-gray-300">
                  Absolutely. Start with the DIY plan and add Spark, Growth, or Lead anytime. You can change or cancel monthly.
                </p>
              </details>
              <details className="group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-left text-base font-medium text-[#FFF1E7]">
                  What do consulting hours include?
                  <span className="ml-4 text-gray-400 transition group-open:rotate-180">▾</span>
                </summary>
                <p className="mt-3 text-sm text-gray-300">
                  Strategy sessions, content/creative feedback, campaign setup support, and light execution—focused on the tasks you're tackling that month.
                </p>
              </details>
              <details className="group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-left text-base font-medium text-[#FFF1E7]">
                  I'm not tech‑savvy—will I be able to use this?
                  <span className="ml-4 text-gray-400 transition group-open:rotate-180">▾</span>
                </summary>
                <p className="mt-3 text-sm text-gray-300">
                  Yes. Lessons are in plain English with step‑by‑step tasks. The on‑page assistant guides you and explains terms along the way.
                </p>
              </details>
              <details className="group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-left text-base font-medium text-[#FFF1E7]">
                  Is this a course or an agency?
                  <span className="ml-4 text-gray-400 transition group-open:rotate-180">▾</span>
                </summary>
                <p className="mt-3 text-sm text-gray-300">
                  It's an action system with weekly implementation, not a passive course. Add consulting if you want hands‑on help without agency retainers.
                </p>
              </details>
            </div>
          </section>

          {/* Final CTA */}
          <section className="mx-auto mt-16 max-w-5xl overflow-hidden rounded-2xl border border-[#2A243E] bg-gradient-to-r from-[#EF8E81]/10 via-[#EF8E81]/5 to-transparent p-8 text-center ring-1 ring-[#EF8E81]/10">
            <h3 className="text-2xl font-semibold text-[#FFF1E7]">Ready to gain momentum?</h3>
            <p className="mt-2 text-gray-300">Start your 30‑day free trial. No credit card required.</p>
            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button onClick={() => navigate('/checkout/momentumdiy/yearly')} className="inline-flex items-center justify-center rounded-xl bg-[#EF8E81] px-5 py-3 font-semibold text-[#191628] transition hover:bg-[#E67A6E] focus:outline-none focus:ring-2 focus:ring-[#EF8E81]">
                Start Free Trial
              </button>
              <button onClick={() => navigate('/')} className="inline-flex items-center justify-center rounded-xl bg-[#2A243E]/60 px-5 py-3 font-semibold text-[#FFF1E7] transition hover:bg-[#2A243E]/80 focus:outline-none focus:ring-2 focus:ring-[#EF8E81]">
                Questions? Contact us
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-400">Cancel anytime • Your data stays yours • Forever price guarantee</p>
          </section>
        </div>
      </main>

      <footer className="mx-auto max-w-7xl px-6 py-10 text-center text-sm text-gray-500 lg:px-8">
        © {new Date().getFullYear()} MomentumDIY. All rights reserved.
      </footer>
    </div>
  )
}