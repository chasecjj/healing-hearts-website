import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function Signup() {
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
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
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-outfit font-bold text-3xl text-primary mb-4">Check your email</h1>
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
            <p className="font-sans text-xs text-foreground/50 mt-3">
              Don't see it? Check your spam or junk folder. The email usually arrives within a minute.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 font-outfit font-medium text-sm text-accent hover:text-accent/80 transition-colors"
          >
            Go to sign in <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-background flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
        <div className="relative z-10">
          <Link to="/" className="font-outfit font-bold text-2xl">Healing Hearts.</Link>
        </div>
        <div className="relative z-10">
          <h2 className="font-drama italic text-5xl leading-tight mb-6">
            Begin your healing journey today.
          </h2>
          <p className="font-sans font-light text-background/80 text-lg leading-relaxed max-w-md">
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
          <Link to="/" className="font-outfit font-bold text-xl text-primary lg:hidden block mb-10">
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm font-sans">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Display Name */}
            <div className="mb-4">
              <label className="block font-outfit text-sm font-medium text-primary/80 mb-2">
                Your name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  placeholder="How should we address you?"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-primary/15 bg-background font-sans text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block font-outfit text-sm font-medium text-primary/80 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-primary/15 bg-background font-sans text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block font-outfit text-sm font-medium text-primary/80 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-primary/15 bg-background font-sans text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block font-outfit text-sm font-medium text-primary/80 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-primary/15 bg-background font-sans text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
              </div>
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
                  <ArrowRight className="w-4 h-4" />
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
