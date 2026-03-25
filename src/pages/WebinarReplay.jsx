import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { Play, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';
import { supabase } from '../lib/supabase';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const testimonials = [
  {
    quote:
      "The workshop was the first time I felt like someone actually understood what we were going through. Jeff and Trisha don't just teach concepts\u2014they live them.",
    author: 'A. & D.',
    meta: 'Married 8 years',
  },
  {
    quote:
      "I almost didn't watch. I'm so glad I did. The part about the Critter Brain completely reframed how I see our arguments. We're not broken\u2014we're just wired for survival.",
    author: 'M.',
    meta: 'Married 14 years',
  },
  {
    quote:
      "We watched it together on a Sunday morning with coffee. By the end we were holding hands and hadn't done that in months.",
    author: 'R. & S.',
    meta: 'Married 6 years',
  },
];

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

/* ───────────────────────────────────────────────
   State 1 — Replay Available
   ─────────────────────────────────────────────── */
function ReplayView({ replay, upcoming }) {
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
    <div ref={containerRef} className="w-full bg-background pt-32 md:pt-48 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="reveal-el mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Play className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="reveal-el font-drama italic text-4xl md:text-6xl text-primary mb-4">
            Watch the Workshop
          </h1>
          <p className="reveal-el font-sans text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
            {replay.title}
          </p>
        </div>

        {/* Video Player */}
        <div className="reveal-el mb-20">
          <video
            src={replay.replay_url}
            controls
            preload="metadata"
            className="w-full rounded-2xl shadow-lg"
            style={{ maxHeight: '70vh' }}
            playsInline
          >
            Your browser does not support video playback.
          </video>
        </div>

        {/* CTA Section */}
        <section className="reveal-el max-w-3xl mx-auto text-center mb-24">
          <h2 className="font-drama italic text-3xl md:text-5xl text-primary mb-4">
            If This Resonated&hellip;
          </h2>
          <p className="font-sans text-lg text-foreground/70 mb-8 max-w-xl mx-auto leading-relaxed">
            The workshop is just the beginning. Healing Hearts gives you and your
            partner a proven path from disconnection to deep, lasting connection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/apply"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-accent text-white font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Apply for Healing Hearts
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/book"
              className="font-sans text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              Schedule a Conversation
            </Link>
          </div>
        </section>

        {/* Testimonials */}
        <section className="reveal-el max-w-4xl mx-auto mb-24">
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-primary/5 border border-primary/10 rounded-3xl p-8 hover:bg-primary/10 transition-colors"
              >
                <div className="font-drama text-5xl text-accent opacity-50 leading-none h-8">
                  &ldquo;
                </div>
                <p className="font-sans text-foreground/80 leading-relaxed mb-6">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3 border-t border-primary/10 pt-4">
                  <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold font-sans text-sm">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-sans font-bold text-foreground text-sm leading-tight">
                      {t.author}
                    </p>
                    <p className="font-mono text-[10px] text-primary uppercase tracking-widest">
                      {t.meta}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Next Live Workshop */}
        {upcoming && (
          <section className="reveal-el max-w-2xl mx-auto text-center">
            <div className="bg-primary/5 border border-primary/10 rounded-3xl p-10">
              <div className="mb-4 flex justify-center">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-drama italic text-2xl md:text-3xl text-primary mb-2">
                Next Live Workshop
              </h3>
              <p className="font-sans text-foreground/70 mb-1">
                {upcoming.title}
              </p>
              <p className="font-sans text-foreground/60 text-sm mb-6">
                {formatDate(upcoming.starts_at)} at {formatTime(upcoming.starts_at)}
              </p>
              <Link
                to="/webinar"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
              >
                Register Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   State 2 — No Replay Available
   ─────────────────────────────────────────────── */
function NoReplayView() {
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
    <div ref={containerRef} className="w-full bg-background pt-32 md:pt-48 pb-24">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="reveal-el mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Play className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="reveal-el font-drama italic text-4xl md:text-6xl text-primary mb-4">
          Replay Coming Soon
        </h1>
        <p className="reveal-el font-sans text-lg text-foreground/70 max-w-xl mx-auto leading-relaxed mb-12">
          We are preparing the workshop replay. In the meantime, here are two
          ways to start your healing journey today.
        </p>

        <div className="reveal-el flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Link
            to="/webinar"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-accent text-white font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Join Us Live at the Next Workshop
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/spark-challenge"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Try the Free 7-Day Spark Challenge
          </Link>
        </div>

        <p className="reveal-el font-sans text-sm text-foreground/50">
          Questions?{' '}
          <a
            href="mailto:hello@healingheartscourse.com?subject=Workshop%20Replay"
            className="text-primary underline"
          >
            Email us
          </a>{' '}
          and we will let you know when the replay is ready.
        </p>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   Main Page Component
   ─────────────────────────────────────────────── */
export default function WebinarReplay() {
  usePageMeta(
    'Workshop Replay',
    'Watch our most recent Healing Hearts workshop and discover the science-backed tools that help couples move from disconnection to deep, lasting connection.'
  );

  const [replay, setReplay] = useState(null);
  const [upcoming, setUpcoming] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [replayResult, upcomingResult] = await Promise.all([
          supabase
            .from('webinars')
            .select('*')
            .in('status', ['completed', 'evergreen'])
            .not('replay_url', 'is', null)
            .order('starts_at', { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from('webinars')
            .select('id, title, starts_at')
            .in('status', ['scheduled', 'live'])
            .order('starts_at', { ascending: true })
            .limit(1)
            .single(),
        ]);

        if (replayResult.data) setReplay(replayResult.data);
        if (upcomingResult.data) setUpcoming(upcomingResult.data);
      } catch {
        // Supabase query errors are non-fatal — we just show the no-replay state
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-background pt-32 md:pt-48 pb-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-6" />
            <div className="h-10 bg-primary/10 rounded-lg max-w-md mx-auto mb-4" />
            <div className="h-5 bg-primary/5 rounded-lg max-w-sm mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (replay) {
    return <ReplayView replay={replay} upcoming={upcoming} />;
  }

  return <NoReplayView />;
}
