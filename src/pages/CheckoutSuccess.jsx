import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { verifyCheckoutSession } from '../lib/checkout';
import { CheckCircle, ShieldAlert, ArrowRight, Download } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

export default function CheckoutSuccess() {
  usePageMeta('Order Confirmed', 'Your purchase was successful. Welcome to Healing Hearts.');
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session found');
      setLoading(false);
      return;
    }

    verifyCheckoutSession(sessionId)
      .then((data) => setSession(data))
      .catch(() => setError('We could not verify your purchase. Please contact us for help.'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="font-sans text-foreground/60 text-sm">Confirming your purchase...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h2 className="font-outfit font-bold text-xl text-primary mb-2">
              Something Went Wrong
            </h2>
            <p className="font-sans text-foreground/60 text-sm leading-relaxed">
              {error || 'We could not verify your purchase.'}
            </p>
          </div>
          <Link
            to="/contact"
            className="px-6 py-3 rounded-full text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  const isDownload = session.product_slug !== 'full-course';
  const signupUrl = `/signup?email=${encodeURIComponent(session.customer_email || '')}&from=checkout`;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center gap-8 max-w-lg text-center">
        {/* Checkmark */}
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        {/* Headline */}
        <div>
          <h1 className="font-drama italic text-3xl sm:text-4xl text-primary mb-3">
            You Just Took a Beautiful Step
          </h1>
          <p className="font-sans text-foreground/70 text-lg leading-relaxed">
            Your purchase of <strong>{session.product_name}</strong> is confirmed.
          </p>
        </div>

        {/* Next step based on auth state */}
        {user ? (
          <div className="flex flex-col items-center gap-4">
            <p className="font-sans text-foreground/60 leading-relaxed">
              {isDownload
                ? 'Your resource is ready and waiting for you. We also sent a confirmation to your email.'
                : 'All 8 modules are now unlocked in your portal. Start with Module 1 whenever you are ready. There is no rush.'}
            </p>
            <Link
              to={isDownload ? '/portal/downloads' : '/portal'}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-medium text-white bg-accent hover:bg-accent/90 transition-colors shadow-lg"
            >
              {isDownload ? (
                <>
                  <Download className="w-5 h-5" />
                  Go to Downloads
                </>
              ) : (
                <>
                  Go to Your Portal
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="font-sans text-foreground/60 leading-relaxed">
              Create your free account so you can access{' '}
              <strong>{session.product_name}</strong> anytime. We have pre-filled
              the email you just used at checkout.
            </p>
            <Link
              to={signupUrl}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-medium text-white bg-accent hover:bg-accent/90 transition-colors shadow-lg"
            >
              Create Your Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="font-sans text-foreground/40 text-xs">
              Already have an account?{' '}
              <Link to="/login" className="underline hover:text-primary">
                Log in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
