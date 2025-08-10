import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing-root">
      <header className="landing-header">
        <div className="landing-brand">MomentumDIY</div>
        <nav className="landing-nav">
          <Link to="/auth">Sign in</Link>
        </nav>
      </header>

      <section className="landing-hero">
        <h1>Marketing momentum for local businesses</h1>
        <p>Plan, schedule, and stay consistent with a simple weekly system and an on-page marketing assistant.</p>
        <div className="landing-cta">
          <Link to="/auth" className="cta-btn">Start free</Link>
        </div>
      </section>

      <section className="landing-features">
        <div className="feature">
          <h3>Weekly tracks</h3>
          <p>12-week tracks with step-by-step guidance and tasks.</p>
        </div>
        <div className="feature">
          <h3>Task clarity</h3>
          <p>Turn strategy into action with a focused task tracker.</p>
        </div>
        <div className="feature">
          <h3>Built-in assistant</h3>
          <p>Get help right on the page you’re working on.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <Link to="/terms">Terms</Link>
      </footer>
    </div>
  );
}


