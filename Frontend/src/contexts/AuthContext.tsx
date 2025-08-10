import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ ok: boolean; error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUpWithPassword: (email: string, password: string, fullName?: string) => Promise<{ ok: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
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

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        void ensureProfileExists(newSession.user);
      }
    });
    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const ensureProfileExists = async (signedInUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', signedInUser.id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') return; // ignore not found error code differences
      if (!data) {
        await supabase.from('profiles').insert({ id: signedInUser.id, email: signedInUser.email });
      }
    } catch {
      // no-op: not critical for UX
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

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


