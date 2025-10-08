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
  const BYPASS_AUTH = disableAuthValue === 'true' || disableAuthValue === 'TRUE';
  
  // TEMPORARY: Force auth enabled to show beautiful auth page
  const FORCE_AUTH_ENABLED = true;
  
  logger.debug('AuthContext environment check', {
    disableAuthValue,
    bypassAuth: BYPASS_AUTH,
    forceAuthEnabled: FORCE_AUTH_ENABLED
  });
  
  if (BYPASS_AUTH && !FORCE_AUTH_ENABLED) {
    logger.warn('Auth bypass enabled for local development');
  } else {
    logger.info('Normal authentication enabled');
  }

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        if (BYPASS_AUTH && !FORCE_AUTH_ENABLED) {
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
      
      if (newSession?.user) {
        void ensureProfileExists(newSession.user);
        
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




