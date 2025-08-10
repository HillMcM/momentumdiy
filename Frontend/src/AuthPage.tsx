import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

export default function AuthPage() {
  const { signInWithEmail, user } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    // Handle magic link hash fragment (/#access_token=...)
    const hash = window.location.hash.replace('#', '');
    if (hash && hash.includes('access_token')) {
      // Supabase will process tokens automatically via onAuthStateChange
      // Clear hash and redirect to app
      window.history.replaceState(null, '', '/auth');
    }

    if (user) {
      const redirectTo = (location.state as any)?.from || '/app';
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const res = await signInWithEmail(email);
    if (res.ok) {
      setStatus('Check your email for a magic sign-in link.');
    } else {
      setStatus(res.error || 'Failed to send magic link');
    }
    setLoading(false);
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <h1>Sign in</h1>
        <p>We’ll email you a magic link to sign in.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send magic link'}</button>
        </form>
        {status && <div className="auth-status">{status}</div>}
        <div className="auth-footer">
          <Link to="/">Back to site</Link>
        </div>
      </div>
    </div>
  );
}


