import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, Clock, CheckCircle, ChevronDown, Loader2, Users, Heart, Shield } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';
import { supabase } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const INPUT_CLASS =
  'w-full px-5 py-4 rounded-2xl bg-[#F7F6F2] border border-primary/10 font-sans text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const LEARN_BULLETS = [
  'Why most relationship advice treats symptoms instead of causes',
  'The nervous system pattern that hijacks your conversations',
  'The one question that reveals whether your conflict is about the issue or a much older wound',
  'What 8 months of deep work actually looks like',
];

const FAQ_ITEMS = [
  {
    question: 'Is this really free?',
    answer:
      'Yes, completely free. No credit card, no hidden upsells during the workshop. We teach for 80 minutes, then spend the last 15 minutes sharing how our program works for those who want to go deeper.',
  },
  {
    question: 'Do both of us need to attend?',
    answer:
      "Ideally, yes. The workshop is designed for couples, and you'll get the most out of it together. But if your partner isn't ready, come on your own -- you'll still walk away with tools you can use immediately.",
  },
  {
    question: 'How long is the workshop?',
    answer:
      "About 90 minutes. We spend roughly 80% of the time teaching real frameworks and tools you can use that night. The last 15-20 minutes cover how Healing Hearts works for couples who want to go deeper.",
  },
  {
    question: 'What happens after the workshop?',
    answer:
      "You'll receive a replay link and a summary of the key frameworks we covered. If you want to explore the full Healing Hearts program, we'll share how to apply -- but there's zero pressure.",
  },
  {
    question: 'Is this a sales pitch disguised as a workshop?',
    answer:
      "No. We lead with value because that's who we are. Jeff and Trisha teach real, clinically-informed content. If at the end you want to learn more about working with us, that option is there. Most people tell us the workshop alone gave them something they could use immediately.",
  },
];

const TRUST_SIGNALS = [
  { icon: Heart, text: 'Free' },
  { icon: Users, text: '80% teaching, 20% invitation' },
  { icon: Shield, text: 'No pressure' },
];

/* ------------------------------------------------------------------ */
/*  Date formatting                                                    */
/* ------------------------------------------------------------------ */

const formatWebinarDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Denver',
    timeZoneName: 'short',
  });
};

/* ------------------------------------------------------------------ */
/*  FAQ Accordion                                                      */
/* ------------------------------------------------------------------ */

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-primary/10 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none"
      >
        <h3
          className={`font-outfit font-bold text-lg md:text-xl transition-colors ${
            isOpen ? 'text-accent' : 'text-primary'
          }`}
        >
          {question}
        </h3>
        <ChevronDown
          className={`w-5 h-5 text-primary transition-transform duration-300 flex-shrink-0 ml-4 ${
            isOpen ? 'rotate-180 text-accent' : ''
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="font-sans text-foreground/70 font-light leading-relaxed pb-2">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function WebinarRegister() {
  usePageMeta(
    'Join Our Live Workshop',
    'Free live workshop with Jeff & Trisha. Learn the nervous system patterns that hijack your conversations and the one question that reveals what your conflict is really about.'
  );

  const pageRef = useRef(null);
  const [upcoming, setUpcoming] = useState(null);
  const [replay, setReplay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [formStatus, setFormStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');

  /* -- Fetch webinar data -- */
  useEffect(() => {
    async function fetchWebinars() {
      try {
        const [upcomingRes, replayRes] = await Promise.all([
          supabase
            .from('webinars')
            .select('id, title, starts_at, duration_minutes, status')
            .in('status', ['scheduled', 'live'])
            .order('starts_at', { ascending: true })
            .limit(1)
            .single(),
          supabase
            .from('webinars')
            .select('id, title, starts_at, duration_minutes, status, replay_url')
            .in('status', ['completed', 'evergreen'])
            .not('replay_url', 'is', null)
            .order('starts_at', { ascending: false })
            .limit(1)
            .single(),
        ]);

        if (upcomingRes.data) setUpcoming(upcomingRes.data);
        if (replayRes.data) setReplay(replayRes.data);
      } catch {
        // Silently handle — page will fall through to "coming soon" state
      } finally {
        setLoading(false);
      }
    }

    fetchWebinars();
  }, []);

  /* -- GSAP animations -- */
  useEffect(() => {
    if (loading || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray('.webinar-reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          }
        );
      });

      gsap.utils.toArray('.webinar-stagger').forEach((container) => {
        const children = container.querySelectorAll('.webinar-stagger-item');
        gsap.fromTo(
          children,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.1,
            scrollTrigger: { trigger: container, start: 'top 85%' },
          }
        );
      });
    }, pageRef);

    return () => ctx.revert();
  }, [loading]);

  /* -- Form handlers -- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage("That email doesn't look quite right. Could you double-check it?");
      setFormStatus('error');
      return;
    }

    setFormStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/webinar-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
        }),
      });

      if (res.ok) {
        setFormStatus('success');
      } else {
        const result = await res.json().catch(() => ({}));
        setErrorMessage(result.error || "We weren't able to register you. Please try once more.");
        setFormStatus('error');
      }
    } catch {
      setErrorMessage("We're having trouble connecting right now. Please try again, or email us at hello@healingheartscourse.com");
      setFormStatus('error');
    }
  };

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage("That email doesn't look quite right. Could you double-check it?");
      setFormStatus('error');
      return;
    }

    setFormStatus('loading');
    setErrorMessage('');

    try {
      // If there's a recent replay webinar, register against it; otherwise fall back to spark_signups
      if (replay) {
        const res = await fetch('/api/webinar-register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim() || 'Waitlist',
            email: formData.email.trim(),
          }),
        });
        if (res.ok) {
          setFormStatus('success');
        } else {
          const result = await res.json().catch(() => ({}));
          setErrorMessage(result.error || "We weren't able to add you to the waitlist. Please try once more.");
          setFormStatus('error');
        }
      } else {
        // Fallback: use spark-signup endpoint for waitlist
        const res = await fetch('/api/spark-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email.trim() }),
        });
        if (res.ok) {
          setFormStatus('success');
        } else {
          setFormStatus('error');
          setErrorMessage("We weren't able to add you to the waitlist. Please try once more.");
        }
      }
    } catch {
      setErrorMessage("We're having trouble connecting right now. Please try again, or email us at hello@healingheartscourse.com");
      setFormStatus('error');
    }
  };

  /* -- Loading state -- */
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  /* ================================================================ */
  /*  STATE 1: Upcoming webinar exists                                 */
  /* ================================================================ */
  if (upcoming) {
    return (
      <div ref={pageRef} className="w-full bg-background">
        {/* Hero */}
        <section className="pt-32 md:pt-44 pb-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="webinar-reveal font-sans text-primary/60 tracking-widest uppercase text-sm mb-6">
              Free Live Workshop
            </p>
            <h1 className="webinar-reveal font-drama italic text-4xl md:text-6xl lg:text-7xl text-primary leading-tight mb-6">
              Join Trisha & Jeff Live
            </h1>
            {upcoming.title && (
              <p className="webinar-reveal font-sans text-foreground/80 text-xl md:text-2xl font-light mb-8">
                {upcoming.title}
              </p>
            )}

            {/* Date/time display */}
            <div className="webinar-reveal inline-flex items-center gap-3 bg-primary/5 px-6 py-3 rounded-full mb-12">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-sans text-primary font-medium">
                {formatWebinarDate(upcoming.starts_at)}
              </span>
            </div>
          </div>
        </section>

        {/* What You'll Learn */}
        <section className="pb-20 px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="webinar-reveal font-outfit font-bold text-3xl text-primary text-center mb-10">
              What You'll Learn
            </h2>
            <div className="webinar-stagger space-y-4">
              {LEARN_BULLETS.map((bullet, i) => (
                <div
                  key={i}
                  className="webinar-stagger-item flex items-start gap-4 p-5 rounded-2xl bg-white border border-primary/5 shadow-sm"
                >
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <p className="font-sans text-foreground/80 text-lg leading-relaxed">
                    {bullet}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="pb-16 px-6">
          <div className="webinar-reveal flex flex-wrap items-center justify-center gap-8">
            {TRUST_SIGNALS.map((signal, i) => (
              <div key={i} className="flex items-center gap-2 text-foreground/50 font-sans text-sm">
                <signal.icon className="w-4 h-4" />
                <span>{signal.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Registration Form */}
        <section className="pb-24 px-6">
          <div className="max-w-lg mx-auto">
            <div className="webinar-reveal bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-primary/5">
              {formStatus === 'success' ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-drama italic text-3xl text-primary mb-4">
                    You're registered!
                  </h3>
                  <p className="font-sans text-foreground/70 font-light text-lg mb-2">
                    Check your inbox for a confirmation email.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-primary/5 px-5 py-2 rounded-full mt-4">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-sans text-primary text-sm font-medium">
                      {formatWebinarDate(upcoming.starts_at)}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-outfit font-bold text-2xl text-primary text-center mb-8">
                    Reserve Your Spot
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block font-outfit font-bold text-sm text-primary mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        className={INPUT_CLASS}
                        placeholder="Jeff & Trisha"
                        disabled={formStatus === 'loading'}
                      />
                    </div>
                    <div>
                      <label className="block font-outfit font-bold text-sm text-primary mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        className={INPUT_CLASS}
                        placeholder="you@example.com"
                        disabled={formStatus === 'loading'}
                      />
                    </div>

                    {formStatus === 'error' && errorMessage && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                        <p className="font-sans text-red-700 text-sm">{errorMessage}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={formStatus === 'loading'}
                      className="w-full bg-accent text-white px-10 py-4 rounded-full font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {formStatus === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
                      {formStatus === 'loading' ? 'Registering...' : 'Register for Free'}
                    </button>
                  </form>
                  <p className="font-sans text-foreground/50 text-sm text-center mt-5">
                    Your information is always kept private.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Can't make it? */}
        {replay && (
          <section className="pb-16 px-6">
            <div className="webinar-reveal text-center">
              <p className="font-sans text-foreground/50 text-sm mb-2">Can't make it live?</p>
              <Link
                to="/webinar/replay"
                className="font-sans text-accent font-semibold hover:text-primary transition-colors underline underline-offset-4"
              >
                Watch the most recent replay
              </Link>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="pb-24 px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="webinar-reveal font-outfit font-bold text-3xl text-primary text-center mb-10">
              Questions?
            </h2>
            <div className="webinar-reveal bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-primary/5">
              {FAQ_ITEMS.map((item, i) => (
                <FAQItem key={i} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ================================================================ */
  /*  STATE 2: No upcoming webinar + replay exists                     */
  /* ================================================================ */
  if (replay) {
    return (
      <div ref={pageRef} className="w-full bg-background">
        {/* Hero */}
        <section className="pt-32 md:pt-44 pb-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="webinar-reveal font-sans text-primary/60 tracking-widest uppercase text-sm mb-6">
              Workshop Replay Available
            </p>
            <h1 className="webinar-reveal font-drama italic text-4xl md:text-6xl lg:text-7xl text-primary leading-tight mb-6">
              Watch Our Most Recent Workshop
            </h1>
            {replay.title && (
              <p className="webinar-reveal font-sans text-foreground/80 text-xl font-light mb-10">
                {replay.title}
              </p>
            )}

            <div className="webinar-reveal">
              <Link
                to="/webinar/replay"
                className="inline-block bg-accent text-white px-10 py-4 rounded-full font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                Watch the Replay
              </Link>
            </div>
          </div>
        </section>

        {/* What You'll Learn */}
        <section className="pb-20 px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="webinar-reveal font-outfit font-bold text-3xl text-primary text-center mb-10">
              What You'll Learn
            </h2>
            <div className="webinar-stagger space-y-4">
              {LEARN_BULLETS.map((bullet, i) => (
                <div
                  key={i}
                  className="webinar-stagger-item flex items-start gap-4 p-5 rounded-2xl bg-white border border-primary/5 shadow-sm"
                >
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <p className="font-sans text-foreground/80 text-lg leading-relaxed">
                    {bullet}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Waitlist Form */}
        <section className="pb-24 px-6">
          <div className="max-w-lg mx-auto">
            <div className="webinar-reveal bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-primary/5">
              {formStatus === 'success' ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-drama italic text-3xl text-primary mb-4">
                    You're on the list!
                  </h3>
                  <p className="font-sans text-foreground/70 font-light text-lg">
                    We'll email you as soon as the next live workshop is scheduled.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="font-outfit font-bold text-2xl text-primary text-center mb-3">
                    Want to join live next time?
                  </h3>
                  <p className="font-sans text-foreground/60 text-center font-light mb-8">
                    Get notified when we announce the next live workshop.
                  </p>
                  <form onSubmit={handleWaitlistSubmit} className="space-y-5">
                    <div>
                      <label className="block font-outfit font-bold text-sm text-primary mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        className={INPUT_CLASS}
                        placeholder="Your name"
                        disabled={formStatus === 'loading'}
                      />
                    </div>
                    <div>
                      <label className="block font-outfit font-bold text-sm text-primary mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        className={INPUT_CLASS}
                        placeholder="you@example.com"
                        disabled={formStatus === 'loading'}
                      />
                    </div>

                    {formStatus === 'error' && errorMessage && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                        <p className="font-sans text-red-700 text-sm">{errorMessage}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={formStatus === 'loading'}
                      className="w-full bg-accent text-white px-10 py-4 rounded-full font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {formStatus === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
                      {formStatus === 'loading' ? 'Joining...' : 'Join the Waitlist'}
                    </button>
                  </form>
                  <p className="font-sans text-foreground/50 text-sm text-center mt-5">
                    Your information is always kept private.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-24 px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="webinar-reveal font-outfit font-bold text-3xl text-primary text-center mb-10">
              Questions?
            </h2>
            <div className="webinar-reveal bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-primary/5">
              {FAQ_ITEMS.map((item, i) => (
                <FAQItem key={i} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ================================================================ */
  /*  STATE 3: No webinar at all                                       */
  /* ================================================================ */
  return (
    <div ref={pageRef} className="w-full bg-background">
      {/* Hero */}
      <section className="pt-32 md:pt-44 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="webinar-reveal font-sans text-primary/60 tracking-widest uppercase text-sm mb-6">
            Live Workshops
          </p>
          <h1 className="webinar-reveal font-drama italic text-4xl md:text-6xl lg:text-7xl text-primary leading-tight mb-6">
            Live Workshops Coming Soon
          </h1>
          <p className="webinar-reveal font-sans text-foreground/70 text-xl font-light max-w-xl mx-auto mb-4">
            Jeff and Trisha host live workshops where couples learn the frameworks behind lasting change -- the same tools used in the Healing Hearts program. No fluff. Real, clinically-informed content you can use that night.
          </p>
          <p className="webinar-reveal font-sans text-foreground/50 text-base max-w-md mx-auto mb-4">
            Past workshops have covered the nervous system patterns that hijack conversations, the SPARK Method for reconnection, and the difference between Critter Brain reactions and CEO Brain responses.
          </p>
        </div>
      </section>

      {/* What to expect */}
      <section className="pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="webinar-reveal font-outfit font-bold text-3xl text-primary text-center mb-10">
            What to Expect
          </h2>
          <div className="webinar-stagger space-y-4">
            {LEARN_BULLETS.map((bullet, i) => (
              <div
                key={i}
                className="webinar-stagger-item flex items-start gap-4 p-5 rounded-2xl bg-white border border-primary/5 shadow-sm"
              >
                <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                <p className="font-sans text-foreground/80 text-lg leading-relaxed">
                  {bullet}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Form */}
      <section className="pb-24 px-6">
        <div className="max-w-lg mx-auto">
          <div className="webinar-reveal bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-primary/5">
            {formStatus === 'success' ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-drama italic text-3xl text-primary mb-4">
                  You're on the list!
                </h3>
                <p className="font-sans text-foreground/70 font-light text-lg">
                  We'll email you as soon as the next live workshop is scheduled.
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-outfit font-bold text-2xl text-primary text-center mb-3">
                  Join the Waitlist
                </h3>
                <p className="font-sans text-foreground/60 text-center font-light mb-8">
                  Get notified the moment registration opens.
                </p>
                <form onSubmit={handleWaitlistSubmit} className="space-y-5">
                  <div>
                    <label className="block font-outfit font-bold text-sm text-primary mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className={INPUT_CLASS}
                      placeholder="Your name"
                      disabled={formStatus === 'loading'}
                    />
                  </div>
                  <div>
                    <label className="block font-outfit font-bold text-sm text-primary mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className={INPUT_CLASS}
                      placeholder="you@example.com"
                      disabled={formStatus === 'loading'}
                    />
                  </div>

                  {formStatus === 'error' && errorMessage && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                      <p className="font-sans text-red-700 text-sm">{errorMessage}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={formStatus === 'loading'}
                    className="w-full bg-accent text-white px-10 py-4 rounded-full font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {formStatus === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
                    {formStatus === 'loading' ? 'Joining...' : 'Notify Me'}
                  </button>
                </form>
                <p className="font-sans text-foreground/50 text-sm text-center mt-5">
                  Your information is always kept private.
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
