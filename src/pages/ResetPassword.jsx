import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Lock, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';
import { errorCopyFor } from '../lib/authErrorCopy';

export default function ResetPassword() {
  usePageMeta('Set New Password', 'Choose a new password for your Healing Hearts account.');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [tokenError, setTokenError] = useState(null);

  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const successHeadingRef = useRef(null);
  const tokenErrorHeadingRef = useRef(null);
  useEffect(() => {
    if (success && successHeadingRef.current) {
      successHeadingRef.current.focus();
    }
  }, [success]);
  useEffect(() => {
    if (tokenError && tokenErrorHeadingRef.current) {
      tokenErrorHeadingRef.current.focus();
    }
  }, [tokenError]);

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when the recovery token in URL hash
    // is detected and a recovery session is established
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setRecoveryReady(true);
        }
      }
    );

    // Surface Supabase's hash-encoded error params (expired/invalid token)
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      setTokenError(params.get('error_description') || params.get('error') || 'invalid');
    }

    // Fallback: if PASSWORD_RECOVERY never fires and no error surfaced,
    // treat as missing/invalid token after a short grace window
    const timer = setTimeout(() => {
      setRecoveryReady((ready) => {
        if (!ready) {
          setTokenError((prev) => prev ?? 'no-token');
        }
        return ready;
      });
    }, 2500);

    return () => {
      subscription?.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    const { error: authError } = await updatePassword(password);

    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/portal', { replace: true }), 2000);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <Link to="/" className="font-outfit font-bold text-xl text-primary block mb-10">
          Healing Hearts.
        </Link>

        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 aria-hidden="true" className="w-8 h-8 text-green-600" />
            </div>
            <h1 ref={successHeadingRef} tabIndex={-1} className="font-outfit font-bold text-3xl text-primary mb-4">Password updated</h1>
            <p className="font-sans text-foreground/70">
              Redirecting you to your portal...
            </p>
          </div>
        ) : tokenError ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle aria-hidden="true" className="w-8 h-8 text-red-600" />
            </div>
            <h1 ref={tokenErrorHeadingRef} tabIndex={-1} className="font-outfit font-bold text-3xl text-primary mb-4">Reset link expired</h1>
            <p className="font-sans text-foreground/70 mb-4">
              This password reset link has expired or is no longer valid.
            </p>
            <p className="font-sans text-sm text-foreground/50 mb-8">
              Reset links work for a short window for your security — request a fresh
              one and you'll be back on track in a moment.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 font-outfit font-medium text-sm text-accent hover:text-accent/80 transition-colors"
            >
              Request a new reset link
              <ArrowRight aria-hidden="true" className="w-4 h-4" />
            </Link>
            <p className="text-center mt-8">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-sans text-sm text-foreground/60 hover:text-primary transition-colors"
              >
                <ArrowLeft aria-hidden="true" className="w-4 h-4" /> Back to login
              </Link>
            </p>
          </div>
        ) : !recoveryReady ? (
          <div className="text-center" role="status" aria-live="polite">
            <div className="w-12 h-12 mx-auto mb-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <h1 className="font-outfit font-bold text-3xl text-primary mb-2">Verifying your reset link</h1>
            <p className="font-sans text-foreground/60">
              One moment — confirming your password reset link is valid...
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-outfit font-bold text-3xl text-primary mb-2">Set new password</h1>
            <p className="font-sans text-foreground/60 mb-8">
              Choose a new password for your account.
            </p>

            {error && (
              <div role="alert" aria-live="polite" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm font-sans">
                {errorCopyFor(error)}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="reset-password" className="block font-outfit text-sm font-medium text-primary/80 mb-2">
                  New password
                </label>
                <div className="relative">
                  <Lock aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
                  <input
                    id="reset-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-primary/15 bg-background font-sans text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="reset-confirm" className="block font-outfit text-sm font-medium text-primary/80 mb-2">
                  Confirm new password
                </label>
                <div className="relative">
                  <Lock aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
                  <input
                    id="reset-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-primary/15 bg-background font-sans text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-primary text-background font-outfit font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                ) : (
                  <>
                    Update password
                    <ArrowRight aria-hidden="true" className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
