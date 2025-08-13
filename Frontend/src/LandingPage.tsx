import { Link } from 'react-router-dom';

export default function LandingPage() {
  const waitlistUrl = (import.meta as { env?: { VITE_WAITLIST_URL?: string } }).env?.VITE_WAITLIST_URL || '/auth';
  return (
    <div className="landing-root">
      <header className="landing-header">
        <div className="landing-brand">MomentumDIY</div>
        <nav className="landing-nav">
          <Link to="/auth">Sign in</Link>
        </nav>
      </header>

      <section className="landing-hero">
        <h1>Marketing Clarity & Momentum</h1>
        <p>Finally, marketing feels doable again. Step‑by‑step weekly plans, an AI sidekick, and an asset library — built for busy small‑business owners.</p>
        <div className="landing-cta">
          <a href={waitlistUrl} className="cta-btn">Join Waitlist</a>
          <div className="landing-subtext">Launches September 1st</div>
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
            <p>Never get stuck in your marketing again. Ask your AI sidekick anything about your marketing; you’ll have 24/7 access to a marketing expert.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📦</div>
            <h3>Asset Library & Guided Brand Creation</h3>
            <p>Store logos, brand files, core assets, and templates — plus guided prompts that walk you through creating what you need.</p>
          </div>
        </div>
        <div className="landing-cta" style={{marginTop: '1rem'}}>
          <a href={waitlistUrl} className="cta-btn">Join Waitlist</a>
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
          <a href={waitlistUrl} className="cta-btn">Join Waitlist</a>
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
          <a href={waitlistUrl} className="cta-btn">Join Waitlist</a>
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


