import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from user_profiles table
  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    }
    return data;
  }

  // Create profile if it doesn't exist (e.g., on first login)
  async function ensureProfile(userId, email, displayName) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          id: userId,
          display_name: displayName || email?.split('@')[0] || 'Student',
          role: 'student',
        },
        { onConflict: 'id', ignoreDuplicates: true }
      )
      .select()
      .single();

    if (error) {
      console.error('Error ensuring profile:', error);
      return null;
    }
    return data;
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        fetchProfile(currentUser.id).then((p) => {
          setProfile(p);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          if (event === 'SIGNED_IN') {
            // Ensure profile exists on sign-in
            const p = await ensureProfile(
              currentUser.id,
              currentUser.email,
              currentUser.user_metadata?.display_name
            );
            setProfile(p);
          } else {
            const p = await fetchProfile(currentUser.id);
            setProfile(p);
          }
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Auth methods
  //
  // EMAIL VERIFICATION: The emailRedirectTo URLs below use window.location.origin,
  // which resolves to the correct domain in production (https://healingheartscourse.com).
  // However, Supabase must also have these redirect URLs allowlisted in the dashboard:
  //   Supabase Dashboard > Authentication > URL Configuration > Redirect URLs
  //   Required entries:
  //     https://healingheartscourse.com/login?verified=true
  //     https://healingheartscourse.com/portal
  //     https://healingheartscourse.com/reset-password
  //     https://www.healingheartscourse.com/** (wildcard for www variant)
  //   Also set "Site URL" to: https://healingheartscourse.com
  //
  async function signUp({ email, password, displayName }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/login?verified=true`,
      },
    });
    return { data, error };
  }

  async function resendConfirmation(email) {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login?verified=true`,
      },
    });
    return { data, error };
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async function signInWithMagicLink(email) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/portal`,
      },
    });
    return { data, error };
  }

  async function resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  }

  async function updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setProfile(null);
    }
    return { error };
  }

  const isAdmin = profile?.role === 'admin';

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    signUp,
    signIn,
    signInWithMagicLink,
    resendConfirmation,
    resetPassword,
    updatePassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
