import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './contexts/useAuth';
import { supabase } from './lib/supabase';
import { apiService } from './services/api';
import OnboardingWizard, { type OnboardingData } from './components/OnboardingWizard';

export default function AuthPage() {
  const { signInWithPassword, signUpWithPassword, signInWithGoogle, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [, setIsNewUser] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get('mode');
    return urlMode === 'signup' ? 'signup' : 'signin';
  });
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    // Handle token hash fragment (/#access_token=...&refresh_token=...)
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
            // Clean the URL and redirect to app - trial is automatic
            window.history.replaceState(null, '', '/auth');
            navigate('/app', { replace: true });
          }
        });
      return; // wait for setSession
    }

    if (user) {
      // Check if user needs onboarding
      checkOnboardingStatus();
    }
  }, [user, navigate, location.state]);

  const checkOnboardingStatus = async () => {
    try {
      // Check if user has completed onboarding using apiService
      const response = await apiService.getProfile();
      
      if (response.success && (response.data as any)?.onboarding_completed) {
        // User has completed onboarding, go to app
        navigate('/app', { replace: true });
      } else {
        // User needs onboarding
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // On error, show onboarding to be safe
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = (_data: OnboardingData) => {
    setShowOnboarding(false);
    navigate('/app', { replace: true });
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    navigate('/app', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    let res: { ok: boolean; error?: string } = { ok: false };
    if (mode === 'signin') {
      res = await signInWithPassword(email, password);
      setStatus(res.ok ? null : (res.error || 'Sign in failed'));
      if (res.ok) {
        // Check onboarding status after successful sign in
        checkOnboardingStatus();
      }
    } else {
      res = await signUpWithPassword(email, password, fullName || undefined);
      setStatus(res.ok ? 'Account created. You can now sign in.' : (res.error || 'Sign up failed'));
      if (res.ok) {
        setIsNewUser(true);
        setMode('signin');
      }
    }
    setLoading(false);
  };

  return (
    <>
      <div className="auth-root">
        <div className="auth-card">
          <h1>{mode === 'signup' ? 'Create your account' : 'Sign in'}</h1>
          <div className="auth-tabs">
            <button type="button" onClick={() => setMode('signin')} disabled={mode==='signin'}>Sign in</button>
            <button type="button" onClick={() => setMode('signup')} disabled={mode==='signup'}>Sign up</button>
          </div>
          <div className="auth-section">
          <form className="auth-form" onSubmit={handleSubmit}>
          <input type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} autoComplete="email" required />
          <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete="current-password" required />
            {mode === 'signup' && (
              <input type="text" placeholder="Full name (optional)" value={fullName} onChange={(e)=>setFullName(e.target.value)} />
            )}
            <button className="auth-primary" type="submit" disabled={loading}>
              {loading ? 'Working…' : (mode === 'signin' ? 'Sign in' : 'Create account')}
            </button>
          </form>
          <div className="auth-social">
            <button className="auth-google" type="button" onClick={() => signInWithGoogle()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M22.5 12.2727C22.5 11.5181 22.4318 10.7909 22.3045 10.0909H12V14.1909H18.1364C17.8727 15.6091 17.0727 16.8091 15.8409 17.6182V20.3909H19.4091C21.5455 18.4273 22.5 15.6364 22.5 12.2727Z" fill="#4285F4"/><path d="M12 23C15.06 23 17.6364 22 19.4091 20.3909L15.8409 17.6182C14.8909 18.2582 13.6091 18.6364 12 18.6364C9.04545 18.6364 6.54545 16.6545 5.65455 13.9545H2V16.8091C3.76364 20.4091 7.63636 23 12 23Z" fill="#34A853"/><path d="M5.65453 13.9545C5.4318 13.3145 5.31816 12.6364 5.31816 11.9545C5.31816 11.2727 5.4318 10.5945 5.65453 9.95453V7.09998H2C1.30909 8.70907 0.909088 10.3773 0.909088 11.9545C0.909088 13.5318 1.30909 15.2 2 16.8091L5.65453 13.9545Z" fill="#FBBC05"/><path d="M12 5.36364C13.7455 5.36364 15.3 5.96364 16.5 7.09091L19.5 4.09091C17.6364 2.36364 15.06 1.36364 12 1.36364C7.63636 1.36364 3.76364 3.95455 2 7.09999L5.65455 9.95455C6.54545 7.25455 9.04545 5.36364 12 5.36364Z" fill="#EA4335"/></svg>
              <span>Continue with Google</span>
            </button>
          </div>
          </div>
          {status && <div className="auth-status">{status}</div>}
          <div className="auth-footer">
            <Link to="/">Back to site</Link>
          </div>
        </div>
      </div>

      {/* Onboarding Wizard */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    </>
  );
}


