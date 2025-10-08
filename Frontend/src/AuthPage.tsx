import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { apiService } from './services/api';
import ReferralTracker from './components/ReferralTracker';
import { API_URL } from './config/environment';

export default function AuthPage() {
  const { signInWithPassword, signUpWithPassword, signInWithGoogle, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
      // User is authenticated, link referral if exists
      linkReferralIfExists(user.id);
      
      // Redirect to app (onboarding will be handled there)
      navigate('/app', { replace: true });
    }
  }, [user, navigate, location.state]);

  const linkReferralIfExists = async (userId: string) => {
    const referralCode = localStorage.getItem('referral_code');
    if (!referralCode) return;

    try {
      const token = localStorage.getItem('supabase.auth.token');
      await fetch(`${API_URL}/api/affiliate/link-referral`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referralCode }),
        credentials: 'include',
      });

      // Clear the stored referral code after linking
      localStorage.removeItem('referral_code');
    } catch (err) {
      console.error('Error linking referral:', err);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      if (mode === 'signin') {
        const { ok, error } = await signInWithPassword(email, password);
        if (!ok) {
          setStatus(`Sign-in failed: ${error}`);
        } else {
          setStatus('Signing you in…');
          // Navigation will be handled by the useEffect when user changes
        }
      } else {
        const { ok, error } = await signUpWithPassword(email, password, fullName);
        if (!ok) {
          setStatus(`Sign-up failed: ${error}`);
        } else {
          setIsNewUser(true);
          setStatus('Account created! Please check your email to verify your account.');
        }
      }
    } catch (error) {
      setStatus(`An unexpected error occurred: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const { ok, error } = await signInWithGoogle();
      if (!ok) {
        setStatus(`Google sign-in failed: ${error}`);
        setLoading(false);
      } else {
        setStatus('Signing you in with Google…');
        // Navigation will be handled by the useEffect when user changes
      }
    } catch (error) {
      setStatus(`An unexpected error occurred: ${error}`);
      setLoading(false);
    }
  };
  
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1B1628] to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#EF8E81]/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#D4AF37]/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#EF8E81]/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-md w-full space-y-8 relative z-10">
          {/* Referral Tracker */}
          <ReferralTracker />
          
          <div className="text-center">
            <div className="relative">
              <img src="/assets/octopus_icon.png" alt="MomentumDIY" className="mx-auto h-16 w-16 drop-shadow-2xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] rounded-full blur-lg opacity-30 -z-10"></div>
            </div>
            <h2 className="mt-6 text-4xl font-extrabold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {mode === 'signup' ? 'Create your account' : 'Sign in to your account'}
            </h2>
            <p className="mt-3 text-lg text-gray-300 font-medium">
              {mode === 'signup' ? 'Start your 30-day free trial' : 'Welcome back'}
            </p>
            {mode === 'signup' && (
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full text-green-300 text-sm font-medium">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No credit card required
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden">
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
            
            {/* Tab Switcher */}
            <div className="flex mb-8 bg-white/5 rounded-xl p-1.5 relative z-10">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  mode === 'signin'
                    ? 'bg-white text-gray-900 shadow-lg transform scale-105'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  mode === 'signup'
                    ? 'bg-white text-gray-900 shadow-lg transform scale-105'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-4 py-4 border border-white/20 placeholder-gray-400 text-gray-900 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#EF8E81] focus:border-[#EF8E81] focus:z-10 text-sm transition-all duration-200 hover:bg-white focus:bg-white shadow-lg"
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-4 py-4 border border-white/20 placeholder-gray-400 text-gray-900 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#EF8E81] focus:border-[#EF8E81] focus:z-10 text-sm transition-all duration-200 hover:bg-white focus:bg-white shadow-lg"
                  placeholder="Enter your password"
                />
              </div>

              {mode === 'signup' && (
                <div className="space-y-1">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-200">
                    Full name <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full px-4 py-4 border border-white/20 placeholder-gray-400 text-gray-900 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#EF8E81] focus:border-[#EF8E81] focus:z-10 text-sm transition-all duration-200 hover:bg-white focus:bg-white shadow-lg"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] hover:from-[#EF8E81]/90 hover:to-[#D4AF37]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EF8E81] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      <span className="text-lg">Working…</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="text-lg">{mode === 'signin' ? 'Sign in' : 'Create account'}</span>
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/10 backdrop-blur-sm text-gray-300 font-medium rounded-full">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full inline-flex justify-center items-center py-4 px-6 border border-white/20 rounded-xl shadow-lg bg-white/95 backdrop-blur-sm text-base font-semibold text-gray-700 hover:bg-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EF8E81] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                  >
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-lg">Continue with Google</span>
                  </button>
                </div>
              </div>
            </form>

            {status && (
              <div className={`mt-6 p-4 rounded-xl text-sm font-medium backdrop-blur-sm border ${
                status.includes('failed') || status.includes('error') 
                  ? 'bg-red-500/20 text-red-200 border-red-400/30' 
                  : 'bg-green-500/20 text-green-200 border-green-400/30'
              }`}>
                <div className="flex items-center">
                  {status.includes('failed') || status.includes('error') ? (
                    <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{status}</span>
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <Link
                to="/"
                className="inline-flex items-center text-sm text-gray-300 hover:text-white transition-all duration-200 hover:bg-white/10 px-4 py-2 rounded-lg"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}