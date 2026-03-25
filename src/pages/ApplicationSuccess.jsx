import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { CheckCircle2 } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ApplicationSuccess() {
  usePageMeta('Application Received', 'Thank you for applying to Healing Hearts. We will be in touch shortly.');
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.reveal-el',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background flex items-center justify-center px-6 py-24"
    >
      <div className="max-w-lg w-full text-center">
        <div className="reveal-el mb-8">
          <CheckCircle2 className="w-20 h-20 text-primary mx-auto" />
        </div>

        <h1 className="reveal-el font-drama italic text-4xl md:text-5xl text-primary leading-tight mb-6">
          Application Received
        </h1>

        <p className="reveal-el font-sans text-foreground/70 font-light text-lg leading-relaxed mb-4">
          Thank you for taking this brave step. We have received your application and will review it personally.
        </p>

        <p className="reveal-el font-sans text-foreground/70 font-light text-lg leading-relaxed mb-12">
          Check your inbox for a confirmation email. We typically respond within 48 hours.
        </p>

        <div className="reveal-el flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/spark-challenge"
            className="px-8 py-4 rounded-full bg-accent text-background font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            Try the 7-Day Spark Challenge
          </Link>
          <Link
            to="/"
            className="px-8 py-4 rounded-full bg-neutral-100 text-foreground font-medium hover:bg-neutral-200 transition-all"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
