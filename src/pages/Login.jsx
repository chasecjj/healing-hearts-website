import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [mode, setMode] = useState('password'); // 'password' | 'magic'
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const { signIn, signInWithMagicLink, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from = location.state?.from?.pathname || '/portal';
  const justVerified = searchParams.get('verified') === 'true';

  async function handlePasswordLogin(e) {
    e.preventDefault();
    setError('');
    setUnconfirmedEmail('');
    setResendSuccess(false);
    setLoading(true);

    const { error: authError } = await signIn({ email, password });

    if (authError) {
      if (authError.message?.toLowerCase().includes('email not confirmed')) {
        setUnconfirmedEmail(email);
        setError('');
      } else {
        setError(authError.message);
      }
      setLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  }

  async function handleResendConfirmation() {
    if (!unconfirmedEmail) return;
    setResendLoading(true);
    setResendSuccess(false);

    const { error: resendError } = await resendConfirmation(unconfirmedEmail);

    if (resendError) {
      setError(resendError.message);
    } else {
      setResendSuccess(true);
    }
    setResendLoading(false);
  }

  async function handleMagicLink(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await signInWithMagicLink(email);

    if (authError) {
      setError(authError.message);
    } else {
      setMagicLinkSent(true);
    }
    setLoading(false);
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-outfit font-bold text-3xl text-primary mb-4">Check your email</h1>
          <p className="font-sans text-foreground/70 mb-8">
            We sent a magic link to <strong className="text-primary">{email}</strong>.
            Click the link in the email to sign in.
          </p>
          <button
            onClick={() => { setMagicLinkSent(false); setMode('password'); }}
            className="font-sans text-sm text-accent hover:text-accent/80 transition-colors"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-background flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
        <div className="relative z-10">
          <Link to="/" className="font-outfit font-bold text-2xl">Healing Hearts.</Link>
        </div>
        <div className="relative z-10">
          <h2 className="font-drama italic text-5xl leading-tight mb-6">
            Welcome back to your journey.
          </h2>
          <p className="font-sans font-light text-background/80 text-lg leading-relaxed max-w-md">
            Every step forward is a step toward the marriage you both deserve.
          </p>
        </div>
        <div className="relative z-10">
          <p className="font-sans text-sm text-background/70">
            © 2026 Healing Hearts LLC
          </p>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <Link to="/" className="font-outfit font-bold text-xl text-primary lg:hidden block mb-10">
            Healing Hearts.
          </Link>

          <h1 className="font-outfit font-bold text-3xl text-primary mb-2">Sign in</h1>
          <p className="font-sans text-foreground/60 mb-8">
            Access your courses and continue your healing journey.
          </p>

          {justVerified && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl mb-6 text-sm font-sans flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>Email verified! You can now sign in.</span>
            </div>
          )}

          {unconfirmedEmail && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-4 rounded-2xl mb-6 text-sm font-sans">
              <p className="font-medium mb-2">Email not yet verified</p>
              <p className="text-amber-700 mb-3">
                Please check your inbox for a confirmation link from <strong>noreply@mail.app.supabase.io</strong>.
                It may be in your spam folder.
              </p>
              {resendSuccess ? (
                <p className="text-green-700 font-medium">Confirmation email resent! Check your inbox.</p>
              ) : (
                <button
                  onClick={handleResendConfirmation}
                  disabled={resendLoading}
                  className="text-accent font-medium hover:text-accent/80 transition-colors disabled:opacity-50"
                >
                  {resendLoading ? 'Sending...' : 'Resend confirmation email'}
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm font-sans">
              {error}
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('password')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-outfit font-medium transition-colors ${
                mode === 'password'
                  ? 'bg-primary text-background'
                  : 'bg-primary/5 text-primary hover:bg-primary/10'
              }`}
            >
              Password
            </button>
            <button
              onClick={() => setMode('magic')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-outfit font-medium transition-colors flex items-center justify-center gap-2 ${
                mode === 'magic'
                  ? 'bg-primary text-background'
                  : 'bg-primary/5 text-primary hover:bg-primary/10'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Magic Link
            </button>
          </div>

          <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink}>
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

            {/* Password (only in password mode) */}
            {mode === 'password' && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-outfit text-sm font-medium text-primary/80">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="font-sans text-xs text-accent hover:text-accent/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-primary/15 bg-background font-sans text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  />
                </div>
              </div>
            )}

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
                  {mode === 'password' ? 'Sign in' : 'Send magic link'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 font-sans text-sm text-foreground/60">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent font-medium hover:text-accent/80 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
