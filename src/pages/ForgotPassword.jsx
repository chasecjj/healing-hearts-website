import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { resetPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await resetPassword(email);

    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <Link to="/" className="font-outfit font-bold text-xl text-primary block mb-10">
          Healing Hearts.
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-outfit font-bold text-3xl text-primary mb-4">Check your email</h1>
            <p className="font-sans text-foreground/70 mb-8">
              If an account exists for <strong className="text-primary">{email}</strong>,
              you'll receive a password reset link shortly.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 font-outfit font-medium text-sm text-accent hover:text-accent/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-outfit font-bold text-3xl text-primary mb-2">Reset your password</h1>
            <p className="font-sans text-foreground/60 mb-8">
              Enter your email and we'll send you a link to reset your password.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm font-sans">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-primary text-background font-outfit font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                ) : (
                  <>
                    Send reset link
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center mt-8">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-sans text-sm text-foreground/60 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
