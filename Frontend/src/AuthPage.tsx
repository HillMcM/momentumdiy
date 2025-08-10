import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';

export default function AuthPage() {
  const { signInWithEmail, signInWithPassword, signUpWithPassword, signInWithGoogle, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'magic' | 'signin' | 'signup'>('signin');
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    // Handle magic link hash fragment (/#access_token=...&refresh_token=...)
    const hash = window.location.hash.replace('#', '');
    const params = new URLSearchParams(hash);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if (access_token && refresh_token) {
      setStatus('Signing you in…');
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(({ error }) => {
          if (error) {
            setStatus(`Sign-in failed: ${error.message}`);
          } else {
            // Clean the URL and redirect to app
            window.history.replaceState(null, '', '/auth');
            navigate('/app', { replace: true });
          }
        });
      return; // wait for setSession
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
    let res: { ok: boolean; error?: string } = { ok: false };
    if (mode === 'magic') {
      res = await signInWithEmail(email);
      setStatus(res.ok ? 'Check your email for a magic sign-in link.' : (res.error || 'Failed to send magic link'));
    } else if (mode === 'signin') {
      res = await signInWithPassword(email, password);
      setStatus(res.ok ? null : (res.error || 'Sign in failed'));
    } else {
      res = await signUpWithPassword(email, password, fullName || undefined);
      setStatus(res.ok ? 'Account created. You can now sign in.' : (res.error || 'Sign up failed'));
      if (res.ok) setMode('signin');
    }
    setLoading(false);
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <h1>{mode === 'signup' ? 'Create your account' : 'Sign in'}</h1>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button type="button" onClick={() => setMode('signin')} disabled={mode==='signin'}>Password</button>
          <button type="button" onClick={() => setMode('magic')} disabled={mode==='magic'}>Magic link</button>
          <button type="button" onClick={() => setMode('signup')} disabled={mode==='signup'}>Sign up</button>
        </div>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          {mode !== 'magic' && (
            <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          )}
          {mode === 'signup' && (
            <input type="text" placeholder="Full name (optional)" value={fullName} onChange={(e)=>setFullName(e.target.value)} />
          )}
          <button type="submit" disabled={loading}>
            {loading ? 'Working…' : mode === 'magic' ? 'Send magic link' : (mode === 'signin' ? 'Sign in' : 'Create account')}
          </button>
        </form>
        <div style={{ marginTop: 12 }}>
          <button type="button" onClick={() => signInWithGoogle()}>
            Continue with Google
          </button>
        </div>
        {status && <div className="auth-status">{status}</div>}
        <div className="auth-footer">
          <Link to="/">Back to site</Link>
        </div>
      </div>
    </div>
  );
}


