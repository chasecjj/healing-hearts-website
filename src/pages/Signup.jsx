import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, User, ArrowRight } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';
import { errorCopyFor } from '../lib/authErrorCopy';
import PasswordInput from '../components/auth/PasswordInput';

export default function Signup() {
  usePageMeta('Create Account', 'Create your Healing Hearts account to access the course portal.');
  const [searchParams] = useSearchParams();
  const prefillEmail = searchParams.get('email') || '';
  const fromCheckout = searchParams.get('from') === 'checkout';

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { signUp } = useAuth();
  const successHeadingRef = useRef(null);
  useEffect(() => {
    if (success && successHeadingRef.current) {
      successHeadingRef.current.focus();
    }
  }, [success]);

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

    const { data, error: authError } = await signUp({
      email,
      password,
      displayName,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else if (data?.user?.identities?.length === 0) {
      setError('An account with this email already exists.');
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail aria-hidden="true" className="w-8 h-8 text-green-600" />
          </div>
          <h1 ref={successHeadingRef} tabIndex={-1} className="font-outfit font-bold text-3xl text-primary mb-4">Check your email</h1>
          <p className="font-sans text-foreground/70 mb-3">
            We sent a confirmation link to <strong className="text-primary">{email}</strong>.
          </p>
          <div className="bg-primary/5 rounded-2xl p-4 mb-6 text-left">
            <p className="font-sans text-sm text-foreground/80 mb-2 font-medium">What to do next:</p>
            <ol className="font-sans text-sm text-foreground/70 space-y-1.5 list-decimal list-inside">
              <li>Open your email inbox</li>
              <li>Look for an email from <strong className="text-foreground/80">noreply@mail.app.supabase.io</strong></li>
              <li>Click the "Confirm your mail" link</li>
              <li>You'll be redirected back here to sign in</li>
            </ol>
            <p className="font-sans text-xs text-stone-600 mt-3">
              Don't see it? Check your spam or junk folder. The email usually arrives within a minute.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 font-outfit font-medium text-sm text-accent hover:text-accent/80 transition-colors"
          >
            Go to sign in <ArrowRight aria-hidden="true" className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left — Branding Panel */}
      {/* Wave-9 MED-01/LOW-06: surface at md (768) to fix tablet orphaned-form whitespace */}
      <div className="hidden md:flex md:w-2/5 lg:w-1/2 bg-primary text-background flex-col justify-between p-10 lg:p-16 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
        <div className="relative z-10">
          <Link to="/" className="font-outfit font-bold text-2xl">Healing Hearts.</Link>
        </div>
        <div className="relative z-10">
          <h2 className="font-drama italic text-3xl lg:text-5xl leading-tight mb-6">
            Begin your healing journey today.
          </h2>
          <p className="font-sans font-light text-background/80 text-base lg:text-lg leading-relaxed max-w-md">
            Create a free account to start the 7-Day Spark Challenge — and explore the Healing Hearts experience.
          </p>
        </div>
        <div className="relative z-10">
          <p className="font-sans text-sm text-background/70">
            © 2026 Healing Hearts Consulting, LLC
          </p>
        </div>
      </div>

      {/* Right — Signup Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <Link to="/" className="font-outfit font-bold text-xl text-primary md:hidden block mb-10">
            Healing Hearts.
          </Link>

          <h1 className="font-outfit font-bold text-3xl text-primary mb-2">Create your account</h1>
          {fromCheckout ? (
            <p className="font-sans text-foreground/60 mb-8">
              Create your account to access your purchase. We have pre-filled the email you used at checkout.
            </p>
          ) : (
            <p className="font-sans text-foreground/60 mb-8">
              Create a free account to start the 7-Day Spark Challenge — a daily practice delivered to your inbox. No payment required.
            </p>
          )}

          {error && (
            <div role="alert" aria-live="polite" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm font-sans">
              {errorCopyFor(error)}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Display Name */}
            <div className="mb-4">
              <label htmlFor="signup-name" className="block font-outfit text-sm font-medium text-primary/80 mb-2">
                Your name
              </label>
              <div className="relative">
                {/* Wave-9 LOW-05: stone-500 placeholder for WCAG AA */}
                <User aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                <input
                  id="signup-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="How should we address you?"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-primary/15 bg-background font-sans text-foreground placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="signup-email" className="block font-outfit text-sm font-medium text-primary/80 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-primary/15 bg-background font-sans text-foreground text-ellipsis placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="signup-password" className="block font-outfit text-sm font-medium text-primary/80 mb-2">
                Password
              </label>
              {/* Wave-9 MED-04/LOW-04: shared PasswordInput w/ visibility toggle + strength meter */}
              <PasswordInput
                id="signup-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                showStrength
              />
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label htmlFor="signup-confirm" className="block font-outfit text-sm font-medium text-primary/80 mb-2">
                Confirm password
              </label>
              {/* Wave-9 LOW-01/LOW-04: shared PasswordInput w/ visibility toggle + minLength=8 */}
              <PasswordInput
                id="signup-confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Confirm your password"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-primary text-background font-outfit font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight aria-hidden="true" className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 font-sans text-sm text-foreground/60">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-medium hover:text-accent/80 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
