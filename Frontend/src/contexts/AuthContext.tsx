import React, { createContext, useEffect, useMemo, useState, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useNotifications } from './NotificationContext';
import { logger } from '../utils/logger';

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ ok: boolean; error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUpWithPassword: (email: string, password: string, fullName?: string) => Promise<{ ok: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const hasShownWelcomeRef = useRef<boolean>(false);
  const { addNotification } = useNotifications();

  // Check if auth is disabled for local development
  const disableAuthValue = import.meta.env.VITE_DISABLE_AUTH;
  const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';
  const BYPASS_AUTH = (disableAuthValue === 'true' || disableAuthValue === 'TRUE') && !isProduction;

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        if (BYPASS_AUTH) {
          // Create a mock user for testing
          const mockUser = {
            id: 'test-user-id',
            email: 'test@momentumdiy.com',
            user_metadata: { full_name: 'Test User' },
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            email_confirmed_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            role: 'authenticated',
            confirmation_sent_at: new Date().toISOString(),
            recovery_sent_at: undefined,
            email_change_sent_at: undefined,
            new_email: undefined,
            invited_at: undefined,
            action_link: undefined,
            email_change: undefined,
            new_phone: undefined,
            phone: undefined,
            phone_confirmed_at: undefined,
            phone_change_sent_at: undefined,
            confirmed_at: new Date().toISOString(),
            email_change_confirm_status: 0,
            banned_until: undefined,
            reauthentication_sent_at: undefined,
            reauthentication_confirm_status: 0,
            is_sso_user: false,
            deleted_at: undefined,
            is_anonymous: false,
            identities: [],
            factors: []
          } as User;

          const mockSession = {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            token_type: 'bearer',
            user: mockUser
          } as Session;

          if (!isMounted) return;
          setSession(mockSession);
          setUser(mockUser);
          setLoading(false);
          return;
        }

        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
        // Ensure profile exists for signed-in users
        if (data.session?.user) {
          await ensureProfileExists(data.session.user);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    init();

    if (BYPASS_AUTH) {
      // Skip auth state change listener in bypass mode
      return () => {
        isMounted = false;
      };
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Handle sign out - redirect to auth page if not already there
      if (event === 'SIGNED_OUT') {
        logger.info('User signed out - redirecting to auth page');
        const currentPath = window.location.pathname;
        if (currentPath !== '/auth' && currentPath !== '/pricing' && !currentPath.startsWith('/landing')) {
          window.location.href = '/auth?signed_out=true';
        }
      }
      
      if (newSession?.user) {
        void ensureProfileExists(newSession.user);
        
        // Link referral if exists (check URL parameter and cookie will be handled by backend)
        if (event === 'SIGNED_IN' || event === 'SIGNED_UP') {
          // Check for URL parameter
          const urlParams = new URLSearchParams(window.location.search);
          const refCode = urlParams.get('ref');
          if (refCode) {
            // Store in localStorage temporarily, will be linked when profile is created
            localStorage.setItem('referral_code', refCode);
          }
          
          // Call link referral endpoint (cookie will be sent automatically)
          void linkReferralOnSignup(newSession.user.id);
        }
        
        // Show welcome notification only when user actually signs in (not on initial load)
        if (event === 'SIGNED_IN' && !hasShownWelcomeRef.current) {
          addNotification({
            type: 'success',
            title: '🎉 Welcome to MomentumDIY!',
            message: 'You\'re all set to start your marketing journey! Let\'s make amazing things happen together!',
          });
          hasShownWelcomeRef.current = true;
        }
      }
    });
    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, [addNotification]);

  const ensureProfileExists = async (_signedInUser: User) => {
    // Temporarily disabled to prevent errors while deployment completes
    // Profile creation is handled by the backend automatically
    logger.debug('Profile creation handled by backend automatically');
  };

  const linkReferralOnSignup = async (userId: string) => {
    // Check URL parameter and localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const urlRefCode = urlParams.get('ref');
    const storedRefCode = localStorage.getItem('referral_code');
    const referralCode = urlRefCode || storedRefCode;
    
    if (!referralCode) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://momentumdiy-backend.onrender.com/api'}/affiliate/link-referral`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referralCode }),
        credentials: 'include', // Include cookies
      });

      const result = await response.json();
      if (result.success) {
        // Clear stored code after successful linking
        if (storedRefCode) {
          localStorage.removeItem('referral_code');
        }
        // Clean URL parameter
        if (urlRefCode) {
          const newUrl = window.location.pathname + window.location.search.replace(/[?&]ref=[^&]*/, '').replace(/^&/, '?');
          window.history.replaceState({}, '', newUrl || window.location.pathname);
        }
      }
    } catch (err) {
      logger.debug('Error linking referral on signup', err);
    }
  };

  const signInWithEmail = async (email: string) => {
    try {
      const redirectTo = `${window.location.origin}/auth`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo }
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const signUpWithPassword = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: fullName ? { full_name: fullName } : undefined }
      });
      if (error) return { ok: false, error: error.message };
      if (data.user) {
        await ensureProfileExists(data.user);
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const redirectTo = `${window.location.origin}/auth`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      });
      if (error) return { ok: false, error: error.message };
      // Browser will redirect; this promise may not resolve before navigation
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const value: AuthContextValue = useMemo(() => ({
    user,
    session,
    loading,
    signInWithEmail,
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
    signOut: async () => { await supabase.auth.signOut(); }
  }), [user, session, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}




