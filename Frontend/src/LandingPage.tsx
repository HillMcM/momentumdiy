import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BRANDING } from './config/branding';

const Star = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const Check = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChevronDown = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function LandingPage() {
  const isDevelopment = import.meta.env.DEV;
  
  // Interactive States
  const [annual, setAnnual] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [mockTaskChecked, setMockTaskChecked] = useState(false);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [spotsRemaining, setSpotsRemaining] = useState(14); // Interactive feel

  // Scroll handler for sticky header and scroll reveals
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsHeaderScrolled(true);
      } else {
        setIsHeaderScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Scroll reveal observer
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((el) => observer.observe(el));

    // Slowly reduce spots remaining occasionally for FOMO effect
    const interval = setInterval(() => {
      setSpotsRemaining((prev) => (prev > 3 ? prev - 1 : prev));
    }, 45000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      revealElements.forEach((el) => observer.unobserve(el));
      clearInterval(interval);
    };
  }, []);

  // FAQ List Data
  const faqs = [
    {
      q: "Will it work if I don’t have any marketing background?",
      a: "Absolutely! MomentumDIY was built specifically for small-business owners who aren't marketing professionals. Every lesson is short and jargon-free, and every task is broken down into simple, step-by-step instructions that show you exactly what to do."
    },
    {
      q: "What is the onboarding process like?",
      a: "Simple and fast. After signing up, you will select a 12-week marketing track that matches your immediate goal (e.g., getting local SEO rankings, setting up email newsletters, or creating social templates). Your dashboard immediately populates with your first tasks, and our AI guide walks you through setup."
    },
    {
      q: "Who is this designed for?",
      a: "Solopreneurs, service business owners (like trades, cafes, wellness practitioners), and boutique shops who want to build a consistent marketing engine without paying high agency fees. It’s built to fit your schedule, taking just 15 to 45 minutes per week."
    },
    {
      q: "What if I get stuck or have questions?",
      a: "That's what Hillary, your custom AI assistant, is for! She is available on every page to give you copy feedback, brainstorm headings, or explain marketing steps. If you want 1-on-1 human expert help, you can upgrade to the Spark plan at any time."
    },
    {
      q: "Can I cancel my subscription easily?",
      a: "Yes. You can cancel your subscription at any time with a single click from your Billing page. There are no contracts, commitments, or cancellation fees. Your data belongs to you."
    }
  ];

  // Pricing constants (matches PricingPage.tsx)
  const FOUNDER_PRICE = annual ? 8.25 : 9.99;
  const STANDARD_PRICE = annual ? 12.50 : 14.99;

  return (
    <div className="landing-root">
      {/* Background Orbs */}
      <div className="landing-glow-orb orb-1"></div>
      <div className="landing-glow-orb orb-2"></div>
      <div className="landing-glow-orb orb-3"></div>

      {/* Header */}
      <header className={`landing-header ${isHeaderScrolled ? 'scrolled' : ''}`}>
        <div className="landing-brand">
          <svg className="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#EF8E81" stroke="#EF8E81" />
          </svg>
          {BRANDING.name}
        </div>
        <nav className="landing-nav">
          <Link to="/pricing">Pricing</Link>
          <Link to="/auth" className="nav-signin">Sign in</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="reveal">
            <span className="hero-badge">
              <Star className="h-4 w-4" /> 30-Day Free Trial • No Credit Card
            </span>
            <h1>
              <span className="hero-gradient-text">Marketing Clarity</span> & Momentum
            </h1>
            <p>
              Finally, marketing feels doable. Get step-by-step weekly plans, a dedicated AI marketing consultant, and a secure asset library built specifically for busy founders.
            </p>
            <div className="landing-cta">
              <div className="cta-group">
                <Link to="/auth" className="cta-btn">Start Free Trial</Link>
                {isDevelopment && (
                  <Link to="/app" className="cta-btn dev-btn">🚀 Enter App (Dev)</Link>
                )}
              </div>
              <div className="landing-subtext">
                <Check className="h-4 w-4 text-[#EF8E81]" /> 30 days free • Cancel in 1-click
              </div>
            </div>
          </div>

          {/* Interactive CSS Mockup */}
          <div className="relative reveal">
            <div className="mock-dashboard">
              <div className="mock-browser-bar">
                <div className="mock-browser-dots">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
                <div className="mock-browser-address">
                  <svg className="h-3 w-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  app.momentumdiy.com/dashboard
                </div>
              </div>
              
              <div className="mock-app-layout">
                <aside className="mock-sidebar">
                  <div className="mock-logo">MomentumDIY</div>
                  <div className="mock-nav-item active">My Track</div>
                  <div className="mock-nav-item">Task Tracker</div>
                  <div className="mock-nav-item">Asset Library</div>
                  <div className="mock-nav-item">Ask Hillary</div>
                </aside>

                <main className="mock-main-content">
                  <div className="mock-track-header">
                    <div>
                      <div className="mock-track-title">Week 2: Build Foundation</div>
                      <div className="text-[10px] text-white/50">Track: Local Service Authority</div>
                    </div>
                    <div className="text-right text-[11px] text-[#EF8E81] font-semibold">
                      {mockTaskChecked ? '66% Done' : '33% Done'}
                    </div>
                  </div>

                  <div className="mock-progress-container">
                    <div className="mock-progress-bar" style={{ width: mockTaskChecked ? '66%' : '33%' }}></div>
                  </div>

                  <div className="mock-tasks">
                    <div className="text-[11px] font-bold text-white/60 mb-1">THIS WEEK'S TASKS</div>
                    
                    <div className="mock-task checked">
                      <div className="mock-checkbox">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span>Identify primary keyword profile</span>
                    </div>

                    <div 
                      className={`mock-task ${mockTaskChecked ? 'checked' : ''}`}
                      onClick={() => setMockTaskChecked(!mockTaskChecked)}
                    >
                      <div className="mock-checkbox">
                        {mockTaskChecked && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="flex-1">Set up Google Business profile</span>
                      <span className="text-[9px] bg-[#EF8E81]/15 text-[#EF8E81] px-1.5 py-0.5 rounded font-bold">CLICK ME</span>
                    </div>

                    <div className="mock-task">
                      <div className="mock-checkbox"></div>
                      <span>Write 3 social introduction templates</span>
                    </div>
                  </div>
                </main>
              </div>

              {/* Floating AI Chat Assistant */}
              <div className="mock-chat-bubble">
                <div className="mock-chat-header">
                  <span className="chat-status-dot"></span>
                  Hillary AI (Advisor)
                </div>
                <div className="mock-chat-body">
                  "Hey! Since you are launching a local shop, target the phrase <b>'best espresso nearby'</b> first. Let's draft your profile!"
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Trust Band */}
      <section className="landing-marquee">
        <div className="marquee-content">
          <span className="marquee-item"><span className="marquee-dot">✦</span> Local Cafes</span>
          <span className="marquee-item"><span className="marquee-dot">✦</span> Home Services</span>
          <span className="marquee-item"><span className="marquee-dot">✦</span> Wellness Studios</span>
          <span className="marquee-item"><span className="marquee-dot">✦</span> Creative agencies</span>
          <span className="marquee-item"><span className="marquee-dot">✦</span> E-commerce Shops</span>
          <span className="marquee-item"><span className="marquee-dot">✦</span> Solopreneurs</span>
          {/* Repeat for seamless loop */}
          <span className="marquee-item"><span className="marquee-dot">✦</span> Local Cafes</span>
          <span className="marquee-item"><span className="marquee-dot">✦</span> Home Services</span>
          <span className="marquee-item"><span className="marquee-dot">✦</span> Wellness Studios</span>
          <span className="marquee-item"><span className="marquee-dot">✦</span> Creative agencies</span>
          <span className="marquee-item"><span className="marquee-dot">✦</span> E-commerce Shops</span>
          <span className="marquee-item"><span className="marquee-dot">✦</span> Solopreneurs</span>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="landing-features reveal">
        <div className="landing-section-subtitle">Core Features</div>
        <h2 className="landing-section-title">Everything You Need to Run Your Marketing</h2>
        
        <div className="landing-features-grid">
          {/* Feature 1 */}
          <div className="feature-card">
            <div className="feature-card-icon">📋</div>
            <h3>Weekly 12-Week Tracks</h3>
            <p>Know exactly what marketing to focus on to get traction without feeling overwhelmed. Broken down week by week.</p>
            <div className="feature-card-preview">
              <img src={new URL('./assets/landing/dashboard_feature.png', import.meta.url).href} alt="Weekly Track Dashboard" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="feature-card">
            <div className="feature-card-icon">🤖</div>
            <h3>AI Marketing Assistant</h3>
            <p>Your own Marketing Consultant, Hillary. She reads your custom profile and lessons to give tailored copy and action feedback.</p>
            <div className="feature-card-preview">
              <img src={new URL('./assets/landing/claude_ai_marketing_assistant_feature.png', import.meta.url).href} alt="AI Advisor Interface" />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="feature-card">
            <div className="feature-card-icon">✓</div>
            <h3>Simple Kanban Tracker</h3>
            <p>Manage, prioritize, and complete weekly tasks in a visual pipeline designed for real small business owners.</p>
            <div className="feature-card-preview">
              <img src={new URL('./assets/landing/task_tracker_feature.png', import.meta.url).href} alt="Task Tracker Kanban" />
            </div>
          </div>

          {/* Feature 4 */}
          <div className="feature-card">
            <div className="feature-card-icon">📁</div>
            <h3>Asset Library & Sharing</h3>
            <p>Store your logos, copy, and images in one library. Easily share selected folders securely with external partners.</p>
            <div className="feature-card-preview">
              <img src={new URL('./assets/landing/asset_feature.png', import.meta.url).href} alt="Asset Library Sharing" />
            </div>
          </div>

          {/* Feature 5 */}
          <div className="feature-card">
            <div className="feature-card-icon">✍️</div>
            <h3>AI Social Post Generator</h3>
            <p>Instantly generate highly-targeted social media copy and ideas calibrated for your specific target audience.</p>
            <div className="feature-card-preview">
              <img src={new URL('./assets/landing/gemini_social_media_generator_feature.png', import.meta.url).href} alt="AI Content Generator" />
            </div>
          </div>

          {/* Feature 6 */}
          <div className="feature-card">
            <div className="feature-card-icon">🎨</div>
            <h3>Live Brand Identity Preview</h3>
            <p>Customize primary, secondary, and accent colors for your client portal, with instant visual branding previews.</p>
            <div className="feature-card-preview" style={{ background: '#1c182a', display: 'grid', placeItems: 'center', height: '150px' }}>
              <div className="flex gap-2">
                <span className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: '#EF8E81' }}></span>
                <span className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: '#D4AF37' }}></span>
                <span className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: '#4F46E5' }}></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="landing-how reveal">
        <div className="landing-section-subtitle">How it Works</div>
        <h2 className="landing-section-title">Simplifying Marketing in Three Steps</h2>

        <div className="how-timeline">
          <div className="how-step">
            <div className="step-number">1</div>
            <h4>Select Your Track</h4>
            <p>Choose your 90-day growth goal. We immediately assemble your 12-week roadmap of short lessons and tasks.</p>
          </div>
          <div className="how-step">
            <div className="step-number">2</div>
            <h4>Execute 15-Min Tasks</h4>
            <p>Get weekly assignments that fit your busy schedule. Complete them on your visual progress tracker.</p>
          </div>
          <div className="how-step">
            <div className="step-number">3</div>
            <h4>Leverage AI Consultancy</h4>
            <p>Generate copy, get ideas, or ask Hillary (AI) to explain marketing terms. Always there in one-click.</p>
          </div>
        </div>
      </section>

      {/* Founder Spotlight */}
      <section className="landing-founder reveal">
        <div className="founder-card">
          <div className="founder-img-wrapper">
            <img 
              className="founder-img" 
              src={new URL('./assets/landing/hillary_mcmullen_headshot.jpg', import.meta.url).href} 
              alt="Hillary McMullen, Founder" 
            />
          </div>
          <div>
            <div className="founder-tagline">A Message from the Founder</div>
            <h2>Why I Built MomentumDIY</h2>
            <p className="founder-text">
              "Small business owners don't have time for complex, bloated marketing manuals. We need action. I built MomentumDIY to give founders a clear, step-by-step roadmap to consistency, backed by modern AI tools. It respects your time, budget, and energy."
            </p>
            <div className="founder-sig">Hillary McMullen, Founder</div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="landing-pricing reveal" id="pricing">
        <div className="landing-section-subtitle">Founders Pricing</div>
        <h2 className="landing-section-title">Lock in Special Lifetime Access</h2>
        
        <div className="pricing-toggle-wrapper">
          <span>Monthly Billing</span>
          <button 
            type="button" 
            className={`toggle-btn ${annual ? 'active' : ''}`}
            onClick={() => setAnnual(!annual)}
            aria-label="Toggle annual plan"
          >
            <span className="toggle-slider"></span>
          </button>
          <span>Annual Billing <span className="save-badge">Save ~20%</span></span>
        </div>

        <div className="pricing-grid">
          {/* Plan 1 */}
          <div className="pricing-card-v2 featured">
            <span className="plan-badge">Popular</span>
            <h3>MomentumDIY</h3>
            <p className="plan-desc">For small business owners seeking step-by-step marketing roadmap & AI sidekick.</p>
            
            <div className="price-display">
              <span className="price-num">${FOUNDER_PRICE.toFixed(2)}</span>
              <span className="price-denom">/month</span>
            </div>
            <div className="price-details">
              {annual ? `Billed $99/year. Regular price $149.99/year.` : `Monthly billing. Regular price $14.99/month.`}
            </div>

            <div className="plan-spots">
              🏆 {spotsRemaining} Founder Spots Remaining
            </div>

            <ul className="plan-bullets">
              <li className="plan-bullet">
                <Check className="h-4 w-4" /> Access all 12-week marketing tracks
              </li>
              <li className="plan-bullet">
                <Check className="h-4 w-4" /> Unlimited chat sessions with Hillary AI
              </li>
              <li className="plan-bullet">
                <Check className="h-4 w-4" /> Secure asset library & public sharing
              </li>
              <li className="plan-bullet">
                <Check className="h-4 w-4" /> AI social generator & template library
              </li>
              <li className="plan-bullet">
                <Check className="h-4 w-4" /> 30-day free trial, cancel in 1-click
              </li>
            </ul>

            <Link to="/auth" className="plan-cta-btn primary">Start Free Trial</Link>
          </div>

          {/* Plan 2 */}
          <div className="pricing-card-v2">
            <h3>Spark Plan</h3>
            <p className="plan-desc">Accelerate growth with our core platform plus monthly 1-on-1 strategy coaching.</p>
            
            <div className="price-display">
              <span className="price-num">$100.00</span>
              <span className="price-denom">/month</span>
            </div>
            <div className="price-details">Billed monthly. Cancel/pause anytime.</div>

            <ul className="plan-bullets">
              <li className="plan-bullet">
                <Check className="h-4 w-4" /> Everything in MomentumDIY software
              </li>
              <li className="plan-bullet">
                <Check className="h-4 w-4" /> 1 hour/month of 1:1 strategy review
              </li>
              <li className="plan-bullet">
                <Check className="h-4 w-4" /> Priority email response from Hillary
              </li>
              <li className="plan-bullet">
                <Check className="h-4 w-4" /> Live marketing audit & setup feedback
              </li>
            </ul>

            <Link to="/auth" className="plan-cta-btn secondary">Choose Spark</Link>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="landing-faqs reveal">
        <div className="landing-section-subtitle">FAQ</div>
        <h2 className="landing-section-title">Frequently Asked Questions</h2>

        <div className="faq-accordion">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`faq-item ${activeFAQ === idx ? 'active' : ''}`}
            >
              <button 
                className="faq-question-btn"
                onClick={() => setActiveFAQ(activeFAQ === idx ? null : idx)}
              >
                <span>{faq.q}</span>
                <ChevronDown className="faq-chevron" />
              </button>
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5">
          <p className="text-sm text-white/40">© {new Date().getFullYear()} {BRANDING.name}. All rights reserved.</p>
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/terms" className="text-white/40 hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="text-white/40 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/affiliate-partner/apply" className="text-white/40 hover:text-white transition-colors">Become an Affiliate Partner</Link>
            <a href="https://www.hillaryedenmcmullen.com/post/hillary-eden-mcmullen-an-introduction" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">About the Founder</a>
            <a href="mailto:info@hillaryedenmcmullen.com" className="text-white/40 hover:text-white transition-colors">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
