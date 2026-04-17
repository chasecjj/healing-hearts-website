import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

// eslint-disable-next-line react-refresh/only-export-components
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
    let cancelled = false;
    let loadingCleared = false;

    // Single chokepoint for ending the loading state. Idempotent — first caller
    // wins, subsequent calls are no-ops. Also clears the hangGuard so it doesn't
    // fire after loading has already been cleared by a success path.
    // ALL paths must route through here. Do NOT call setLoading(false) directly
    // elsewhere in this effect — it breaks the single-chokepoint contract.
    const finishLoading = () => {
      if (cancelled || loadingCleared) return;
      loadingCleared = true;
      clearTimeout(hangGuard);
      setLoading(false);
    };

    // Hard safety. getSession() can orphan (neither resolve nor reject) after
    // long-idle tabs or during internal auto-refresh edge cases. If nothing
    // else has cleared the loading state in 8s, force the spinner off so the
    // user isn't stranded. Also covers hangs inside fetchProfile/ensureProfile
    // called from onAuthStateChange — see §9 of the spec.
    // Routes through finishLoading() to keep the single-chokepoint contract;
    // the clearTimeout inside finishLoading is a harmless no-op on a timer
    // that has already fired.
    const hangGuard = setTimeout(() => {
      if (cancelled || loadingCleared) return;
      console.warn('[AuthContext] loading did not clear in 8s; forcing it off.');
      finishLoading();
    }, 8000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (cancelled) return;
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // NOTE: .catch() only logs. finishLoading() runs via .finally() for
          // both resolve and reject. Do not remove .finally() without adding
          // finishLoading() to the .catch() branch, or the reject path hangs.
          fetchProfile(currentUser.id)
            .then((p) => { if (!cancelled) setProfile(p); })
            .catch((err) => { console.error('Profile fetch failed:', err); })
            .finally(() => { finishLoading(); });
        } else {
          finishLoading();
        }
      })
      .catch((err) => {
        console.error('[AuthContext] getSession() rejected:', err);
        finishLoading();
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled) return;
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          try {
            if (event === 'SIGNED_IN') {
              const p = await ensureProfile(
                currentUser.id,
                currentUser.email,
                currentUser.user_metadata?.display_name
              );
              if (!cancelled) setProfile(p);
            } else {
              const p = await fetchProfile(currentUser.id);
              if (!cancelled) setProfile(p);
            }
          } catch (err) {
            console.error('Profile load failed:', err);
            if (!cancelled) setProfile(null);
          }
        } else {
          if (!cancelled) setProfile(null);
        }

        finishLoading();
      }
    );

    return () => {
      cancelled = true;
      clearTimeout(hangGuard);
      subscription.unsubscribe();
    };
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
