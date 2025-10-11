import { Link } from 'react-router-dom';
import { BRANDING } from './config/branding';

export default function LandingPage() {
  const isDevelopment = import.meta.env.DEV;
  
  return (
    <div className="landing-root">
      <header className="landing-header">
        <div className="landing-brand">{BRANDING.name}</div>
        <nav className="landing-nav">
          <Link to="/pricing">Pricing</Link>
          <Link to="/auth">Sign in</Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-6">Marketing Clarity & Momentum</h1>
            <p className="text-xl text-white/90 mb-8">Finally, marketing feels doable again. Step‑by‑step weekly plans, an AI sidekick, and an asset library — built for busy small‑business owners.</p>
            <div className="landing-cta">
              <Link to="/auth" className="cta-btn">Start Free Trial</Link>
              <div className="landing-subtext">30 days free • No credit card required</div>
            </div>
          </div>

          {/* Right visual placeholder */}
          <div className="relative">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 shadow-soft backdrop-blur-[1px]">
              <div className="aspect-[4/3] w-full rounded-xl bg-white/5 grid place-items-center text-white/70">
                <img 
                  src="/assets/marketing_track_feature_gif.gif" 
                  alt="MomentumDIY Dashboard Preview" 
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'block';
                  }}
                />
                <span className="text-sm" style={{display: 'none'}}>Product Screenshot / GIF Placeholder</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <h2 className="landing-section-title">What You'll Get in Your First 90 Days</h2>
        <div className="landing-features-grid">
          <div className="feature">
            <h3>Weekly plan tailored to your goals</h3>
            <p>Know exactly what to focus on each week to move the needle.</p>
            <img 
              src="/assets/dashboard_feature.png" 
              alt="Marketing Track Interface" 
              className="w-full h-32 object-cover rounded-lg mt-4"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          </div>
          <div className="feature">
            <h3>Step‑by‑step lessons</h3>
            <p>Bite‑sized learning that fits a busy owner's schedule.</p>
          </div>
          <div className="feature">
            <h3>AI marketing assistant</h3>
            <p>Get answers and execution tips whenever you're stuck.</p>
            <img 
              src="/assets/claude_ai_marketing_assistant_feature.png" 
              alt="AI Marketing Assistant Interface" 
              className="w-full h-32 object-cover rounded-lg mt-4"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          </div>
          <div className="feature">
            <h3>Simple Kanban progress</h3>
            <p>See tasks, track wins, and keep momentum visible.</p>
            <img 
              src="/assets/task_tracker_feature.png" 
              alt="Task Tracker Kanban Interface" 
              className="w-full h-32 object-cover rounded-lg mt-4"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          </div>
          <div className="feature">
            <h3>Asset Library</h3>
            <p>Store and organize all your marketing assets in one place.</p>
            <img 
              src="/assets/asset_feature.png" 
              alt="Asset Library Interface" 
              className="w-full h-32 object-cover rounded-lg mt-4"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          </div>
          <div className="feature">
            <h3>AI Social Media Generator</h3>
            <p>Create stunning social media posts in seconds with AI.</p>
            <img 
              src="/assets/gemini_social_media_generator_feature.png" 
              alt="AI Social Media Generator Interface" 
              className="w-full h-32 object-cover rounded-lg mt-4"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          </div>
        </div>
        <div className="landing-cta" style={{marginTop: '1rem'}}>
          <Link to="/auth" className="cta-btn">Start Free Trial</Link>
          {isDevelopment && (
            <Link to="/app" className="cta-btn" style={{ marginLeft: '1rem', background: '#10b981' }}>🚀 Go to App (Dev)</Link>
          )}
        </div>
      </section>

      {/* Founder note */}
      <section className="landing-founder" style={{padding: '4rem 0', background: '#191628'}}>
        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-[140px,1fr] gap-8 items-center">
          <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-full bg-white/10 border border-white/10 grid place-items-center text-white/60 overflow-hidden">
            <img 
              src="/assets/hillary_mcmullen_headshot.jpg" 
              alt="Hill McMillan, Founder" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling.style.display = 'block';
              }}
            />
            <span style={{display: 'none'}}>Photo</span>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold mb-2">Why I Built MomentumDIY</h2>
            <p className="text-white/85 max-w-3xl">I wanted a marketing system that respects real small-business constraints—time, energy, budget. MomentumDIY gives you a clear 90‑day plan, weekly action items you can actually finish, and an on‑page AI helper to keep everything moving.</p>
            <Link to="/auth" className="inline-block mt-3 text-[#EF8E81] font-semibold">Start your free trial →</Link>
          </div>
        </div>
      </section>

      <section className="landing-how">
        <h2 className="landing-section-title">How It Works</h2>
        <div className="how-grid">
          <div className="how-item">
            <div className="how-check">1</div>
            <div>
              <h4>Pick Your 90‑Day Track</h4>
              <p>Choose a clear growth goal and we'll map the next 12 weeks.</p>
            </div>
          </div>
          <div className="how-item">
            <div className="how-check">2</div>
            <div>
              <h4>Get Weekly Action Items</h4>
              <p>Bite‑sized lessons and tasks designed to fit 15–45 minutes.</p>
            </div>
          </div>
          <div className="how-item">
            <div className="how-check">3</div>
            <div>
              <h4>Chat with Your AI Sidekick</h4>
              <p>Stuck on wording or next steps? Ask your custom GPT for help in seconds.</p>
            </div>
          </div>
        </div>
        <div className="landing-cta" style={{marginTop: '1rem'}}>
          <Link to="/auth" className="cta-btn">Start Free Trial</Link>
          {isDevelopment && (
            <Link to="/app" className="cta-btn" style={{ marginLeft: '1rem', background: '#10b981' }}>🚀 Go to App (Dev)</Link>
          )}
        </div>
      </section>

      <section className="landing-pricing">
        <h2 className="landing-section-title">Special Founders Pricing!</h2>
        <p className="pricing-sub">The first 100 founders lock‑in special pricing for life.</p>
        <div className="pricing-cards">
          <div className="pricing-card highlight relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#EF8E81] text-[#0F0A1A] px-3 py-1 text-xs font-bold rounded-bl-lg">
              POPULAR
            </div>
            <div className="price">$3.99<span>/month</span></div>
            <div className="price-note">For LIFE • billed annually</div>
            <div className="mt-4 text-sm text-[#EF8E81]">✓ 30-day free trial</div>
          </div>
          <div className="pricing-card">
            <div className="price">$4.99<span>/month</span></div>
            <div className="price-note">Standard • billed annually</div>
            <div className="mt-4 text-sm text-white/60">✓ 30-day free trial</div>
          </div>
        </div>
        <div className="landing-cta" style={{marginTop: '1rem'}}>
          <Link to="/auth" className="cta-btn">Start Free Trial</Link>
          <Link to="/app" className="cta-btn" style={{ marginLeft: '1rem', background: '#10b981' }}>🚀 Go to App (Dev)</Link>
        </div>
      </section>

      <section className="landing-faqs">
        <h2 className="landing-section-title">FAQs</h2>
        <ul className="faq-list">
          <li>Will it work if I don’t have any marketing background?</li>
          <li>What’s the onboarding process like?</li>
          <li>Who will be using it?</li>
          <li>What if I’m not happy with the plan?</li>
          <li>Can I cancel the subscription?</li>
        </ul>
      </section>

      <footer className="landing-footer">
        <Link to="/terms">Terms</Link>
      </footer>
    </div>
  );
}


