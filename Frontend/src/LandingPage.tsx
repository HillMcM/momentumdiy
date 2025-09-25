import { Link } from 'react-router-dom';

export default function LandingPage() {
  console.log('🎯 LandingPage component rendering - this is the React version!');
  
  return (
    <div className="landing-root">
      <header className="landing-header">
        <div className="landing-brand">MomentumDIY</div>
        <nav className="landing-nav">
          <Link to="/pricing">Pricing</Link>
          <Link to="/auth">Sign in</Link>
        </nav>
      </header>

      <section className="landing-hero">
        <h1>Marketing Clarity & Momentum</h1>
        <p>Finally, marketing feels doable again. Step‑by‑step weekly plans, an AI sidekick, and an asset library — built for busy small‑business owners.</p>
        <div className="landing-cta">
          <Link to="/auth" className="cta-btn">Start Free Trial</Link>
          <Link to="/app" className="cta-btn" style={{ marginLeft: '1rem', background: '#10b981' }}>🚀 Go to App (Dev)</Link>
          <Link to="/app" className="cta-btn" style={{ marginLeft: '1rem', background: '#10b981' }}>🚀 Go to App (Dev)</Link>
          <div className="landing-subtext">30 days free • No credit card required</div>
        </div>
      </section>

      <section className="landing-features">
        <h2 className="landing-section-title">What Do You Get?</h2>
        <div className="landing-features-grid">
          <div className="feature">
            <div className="feature-icon">📅</div>
            <h3>Guided 12‑Week Marketing Tracks</h3>
            <p>Pick your track for the next 12 weeks and receive a weekly action plan that includes why the step matters, what to do, and how to implement. Never feel lost again.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">✅</div>
            <h3>Smart Task Tracking & Calendar</h3>
            <p>See what needs to be done today and this week in your personal view and stay on track — no more trying to organize multiple tools.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🤖</div>
            <h3>Your Own AI Marketing Expert</h3>
            <p>Never get stuck in your marketing again. Ask your AI sidekick anything about your marketing; you'll have 24/7 access to a marketing expert.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🎨</div>
            <h3>AI-Powered Social Media Generator</h3>
            <p>Create stunning social media posts in seconds with Gemini Nano Banana AI. Generate 4 unique variations for any platform with your brand colors and logo.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📦</div>
            <h3>Asset Library & Guided Brand Creation</h3>
            <p>Store logos, brand files, core assets, and templates — plus guided prompts that walk you through creating what you need.</p>
          </div>
        </div>
        <div className="landing-cta" style={{marginTop: '1rem'}}>
          <Link to="/auth" className="cta-btn">Start Free Trial</Link>
          <Link to="/app" className="cta-btn" style={{ marginLeft: '1rem', background: '#10b981' }}>🚀 Go to App (Dev)</Link>
        </div>
      </section>

      {/* Social Media Generator Highlight */}
      <section className="landing-generator" style={{padding: '4rem 0', background: 'linear-gradient(135deg, #191628 0%, #65170C 100%)'}}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold mb-4">🎨 AI-Powered Social Media Generator</h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Create stunning social media posts in seconds with Gemini Nano Banana - the most advanced AI image generator available. 
            Generate 4 unique variations for any platform with your brand colors and logo.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-bold mb-2">Lightning Fast</h3>
              <p className="text-sm text-white/80">Generate 4 unique designs in under 30 seconds</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-bold mb-2">Brand Aware</h3>
              <p className="text-sm text-white/80">Uses your logo and brand colors automatically</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="text-lg font-bold mb-2">All Platforms</h3>
              <p className="text-sm text-white/80">Perfect for Instagram, Facebook, Twitter, LinkedIn</p>
            </div>
          </div>
          <div className="landing-cta">
            <Link to="/app/social-generator" className="cta-btn" style={{ background: '#EF8E81', color: '#0F0A1A' }}>Try Social Generator</Link>
            <Link to="/app" className="cta-btn" style={{ marginLeft: '1rem', background: '#10b981' }}>🚀 Go to App (Dev)</Link>
          </div>
        </div>
      </section>

      <section className="landing-how">
        <h2 className="landing-section-title">How It Works</h2>
        <div className="how-grid">
          <div className="how-item">
            <div className="how-check">✔</div>
            <div>
              <h4>Pick Your Track</h4>
              <p>Take a 2‑minute audit quiz or self‑select the 90‑day goal that matches your needs.</p>
            </div>
          </div>
          <div className="how-item">
            <div className="how-check">✔</div>
            <div>
              <h4>Get Your Weekly Plan</h4>
              <p>Tasks drip every week — designed to take 15–45 minutes and move the needle.</p>
            </div>
          </div>
          <div className="how-item">
            <div className="how-check">✔</div>
            <div>
              <h4>Chat with Your AI Sidekick</h4>
              <p>Stuck on wording or next steps? Ask your custom GPT for help in seconds.</p>
            </div>
          </div>
        </div>
        <div className="landing-cta" style={{marginTop: '1rem'}}>
          <Link to="/auth" className="cta-btn">Start Free Trial</Link>
          <Link to="/app" className="cta-btn" style={{ marginLeft: '1rem', background: '#10b981' }}>🚀 Go to App (Dev)</Link>
        </div>
      </section>

      <section className="landing-pricing">
        <h2 className="landing-section-title">Special Founders Pricing!</h2>
        <p className="pricing-sub">The first 100 founders lock‑in special pricing for life.</p>
        <div className="pricing-cards">
          <div className="pricing-card highlight">
            <div className="price">$3.99<span>/month</span></div>
            <div className="price-note">For LIFE • billed annually</div>
          </div>
          <div className="pricing-card">
            <div className="price">$4.99<span>/month</span></div>
            <div className="price-note">Standard • billed annually</div>
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


