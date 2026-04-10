import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '../components/Layout';
import { OrganicDivider, FAQAccordion, TealQuoteBlock } from '@scoria/ui';
import usePageMeta from '../hooks/usePageMeta';
import {
  CheckCircle2,
  ShieldAlert,
  Eye,
  Pause,
  HandHeart,
  Link2,
  Flame,
  AlertTriangle,
  Heart,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { startCheckout } from '../lib/checkout';

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Shared: reduced-motion check                                       */
/* ------------------------------------------------------------------ */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */
const KIT_INCLUDES = [
  'The SPARK Method\u2122 \u2014 our five-step conflict interruption framework',
  'Critter Brain vs. CEO Brain \u2014 understand the two minds running your arguments',
  'Zones of Resilience self-assessment \u2014 a shared language for what\u2019s happening inside your system',
  'The 90-Second Wave guide \u2014 the neuroscience of riding an emotional surge without adding fuel',
  'Printable Conflict Recovery Plan \u2014 a step-by-step repair roadmap you can use tonight',
  '5 guided reflection prompts \u2014 practices that help you process what just happened',
];

const SPARK_STEPS = [
  { letter: 'S', title: 'See It', desc: 'Notice the moment the conversation shifts from connecting to protecting.', icon: Eye },
  { letter: 'P', title: 'Pause & Probe', desc: 'Stop the momentum. Take a breath. Ask yourself: "What am I actually feeling?"', icon: Pause },
  { letter: 'A', title: 'Acknowledge', desc: 'Before you defend, validate. It lets your partner\u2019s nervous system stand down.', icon: HandHeart },
  { letter: 'R', title: 'Reconnect', desc: 'Make a bid for repair. The signal: "I\u2019m still here. We\u2019re still us."', icon: Link2 },
  { letter: 'K', title: 'Kindle', desc: 'After the storm, revisit what happened\u2014to learn, not litigate.', icon: Flame },
];

const FAQ_ITEMS = [
  {
    question: 'Is this just for couples in crisis?',
    answer: 'No. The Conflict Rescue Kit is for any couple that wants to fight better\u2014whether you\u2019re in the middle of a warzone or just tired of the same argument on repeat. If you\u2019ve ever walked away from a fight thinking "that didn\u2019t need to go that way," this is for you.',
  },
  {
    question: 'Can I do this alone, or does my partner need to participate?',
    answer: 'You can absolutely start alone. Many of these tools work even when only one person changes their approach. When you stop reacting from your Critter Brain, the entire dynamic shifts\u2014even if your partner hasn\u2019t read a single page.',
  },
  {
    question: 'How is this different from the full Healing Hearts Program?',
    answer: 'The full program is 8 modules covering everything from attachment styles to legacy building. The Conflict Rescue Kit is a focused extraction\u2014the tools you need most when arguments are the primary pain point. Think of it as first aid. The full program is the rehabilitation.',
  },
  {
    question: 'What format does the content come in?',
    answer: 'Everything is digital and available immediately after purchase. You\u2019ll get access to the materials through our course portal\u2014readable on any device. The Conflict Recovery Plan is also available as a printable PDF you can keep on your nightstand.',
  },
  {
    question: 'What if it doesn\u2019t work for us?',
    answer: 'We offer a 30-day satisfaction guarantee. But here\u2019s what we\u2019ve found: couples who actually use the SPARK Method during their next argument almost always come back and say, "That was the first fight in years that didn\u2019t end in silence or slamming doors."',
  },
];

/* ------------------------------------------------------------------ */
/*  HERO                                                                */
/* ------------------------------------------------------------------ */
const Hero = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.rk-hero-reveal',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: 'power3.out', delay: 0.15 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[70dvh] flex items-center overflow-hidden mt-[-6rem] pt-[6rem]"
    >
      {/* Watercolor wash background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 20% 30%, #fff8ef 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(17,145,177,0.06) 0%, transparent 40%), radial-gradient(circle at 50% 50%, #fbf3e4 0%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Subtle botanical vines */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" aria-hidden="true">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path d="M10,10 Q20,40 10,70 T10,100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
          <path d="M90,10 Q80,40 90,70 T90,100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-10 py-16 lg:py-24 text-center">
        <div className="rk-hero-reveal inline-flex items-center gap-2 bg-primary/10 text-primary font-outfit font-bold px-5 py-2 rounded-full text-xs uppercase tracking-widest mb-8">
          <ShieldAlert className="w-4 h-4" />
          Standalone Toolkit — $39
        </div>

        <h1 className="rk-hero-reveal font-drama italic text-5xl md:text-7xl lg:text-8xl text-primary leading-tight mb-8">
          The Conflict<br className="hidden md:block" /> Rescue Kit
        </h1>

        <p className="rk-hero-reveal font-sans text-foreground/80 md:text-xl leading-relaxed font-light mx-auto max-w-3xl mb-6">
          Stop the bleeding. Learn to fight without destroying.
          If your arguments have become a warzone&mdash;or you've stopped fighting altogether because it feels pointless&mdash;this is where you start.
        </p>

        <p className="rk-hero-reveal font-drama italic text-accent text-2xl mb-12">
          Because the next argument is coming. And you deserve a better way through it.
        </p>

        <div className="rk-hero-reveal">
          <MagneticButton
            className="bg-accent text-white px-8 sm:px-12 py-4 rounded-full text-base w-full sm:w-auto font-medium shadow-xl hover:shadow-2xl transition-shadow"
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get the Kit &mdash; $39
          </MagneticButton>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  THE PROBLEM — Empathy-first section                                */
/* ------------------------------------------------------------------ */
const TheProblem = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.rk-problem-reveal',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 70%' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full py-[clamp(4rem,8vw,6rem)] bg-[#F9F8F5] relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" aria-hidden="true" />

      <div className="max-w-4xl mx-auto px-6 sm:px-10">
        <div className="rk-problem-reveal text-center mb-16">
          <h2 className="font-outfit font-bold text-4xl md:text-5xl text-primary mb-4">
            Sound familiar?
          </h2>
          <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full" />
        </div>

        <div className="space-y-8">
          {[
            'The same fight keeps happening. Different words, same wound underneath.',
            'You walk on eggshells because one wrong sentence turns into two hours of silence.',
            'You\'ve started keeping score\u2014who apologized last, who started it, who\'s "right."',
            'After the fight, you both retreat to separate corners. Nobody repairs. Nobody reaches.',
            'You love each other. You know that. But lately, you can\'t seem to stop hurting each other.',
          ].map((text, i) => (
            <div
              key={i}
              className="rk-problem-reveal flex items-start gap-5 bg-white rounded-2xl p-6 md:p-8 border border-primary/5"
              style={{ boxShadow: '0 4px 20px -5px rgba(17, 145, 177, 0.04)' }}
            >
              <AlertTriangle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
              <p className="font-sans text-lg text-foreground/80 font-light leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <p className="rk-problem-reveal font-drama italic text-2xl md:text-3xl text-primary text-center mt-16 leading-snug max-w-2xl mx-auto">
          You don't need another lecture about communication.
          You need tools that work when your emotions are running hot and your logic has left the building.
        </p>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  WHAT'S INSIDE                                                       */
/* ------------------------------------------------------------------ */
const WhatsInside = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.rk-inside-reveal',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 70%' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full py-[clamp(4rem,8vw,6rem)] bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[25vw] h-[25vw] bg-accent/5 rounded-full blur-[80px] -translate-y-1/3 translate-x-1/3 pointer-events-none" aria-hidden="true" />

      <div className="max-w-5xl mx-auto px-6 sm:px-10">
        <div className="rk-inside-reveal text-center mb-16">
          <h2 className="font-outfit font-bold text-4xl md:text-5xl text-primary mb-4">
            What&rsquo;s Inside the Kit
          </h2>
          <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full mb-6" />
          <p className="font-sans text-foreground/70 text-lg leading-relaxed font-light max-w-2xl mx-auto">
            Five proprietary frameworks from our flagship Healing Hearts Program, distilled into the tools you need most when conflict is the primary pain point.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {KIT_INCLUDES.map((item, i) => (
            <div
              key={i}
              className="rk-inside-reveal flex items-start gap-4 bg-[#F9F8F5] rounded-2xl p-6 border border-primary/5 transition-all duration-500 hover:-translate-y-1"
              style={{ boxShadow: '0 6px 24px -6px rgba(17, 145, 177, 0.05)' }}
            >
              <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
              <span className="font-sans text-base text-foreground/90 font-medium leading-snug">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  SPARK METHOD PREVIEW                                                */
/* ------------------------------------------------------------------ */
const SparkPreview = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray('.rk-spark-step');
      steps.forEach((step) => {
        gsap.fromTo(
          step,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: step, start: 'top 85%' },
          }
        );
      });
      gsap.fromTo(
        '.rk-spark-heading',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 70%' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full py-[clamp(4rem,8vw,6rem)] bg-primary relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10">
        <div className="text-center mb-16">
          <h2 className="rk-spark-heading font-outfit font-bold text-4xl md:text-5xl text-white mb-4">
            The SPARK Method&trade;
          </h2>
          <p className="rk-spark-heading font-drama italic text-2xl text-accent mb-6">
            Your five-step rescue plan for any conflict.
          </p>
          <p className="rk-spark-heading font-sans text-white/70 text-lg font-light max-w-2xl mx-auto leading-relaxed">
            SPARK works because it interrupts the biological cascade that turns a disagreement into a disaster. It gives your CEO Brain time to get back in the room.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {SPARK_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.letter}
                className="rk-spark-step bg-white/10 backdrop-blur-sm p-6 rounded-3xl border border-white/20 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center font-outfit font-bold text-2xl mx-auto mb-4">
                  {step.letter}
                </div>
                <h4 className="font-outfit font-bold text-lg text-white mb-2">{step.title}</h4>
                <p className="font-sans text-sm text-white/70 font-light leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>

        <p className="text-center mt-12 font-sans text-white/60 text-sm font-light">
          The full SPARK Method training is included in your Conflict Rescue Kit.
        </p>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  CRITTER vs CEO — quick preview                                      */
/* ------------------------------------------------------------------ */
const CritterCeoPreview = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.rk-brain-reveal',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 70%' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full py-[clamp(4rem,8vw,6rem)] bg-[#F9F8F5] relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 sm:px-10">
        <div className="rk-brain-reveal text-center mb-16">
          <h2 className="font-outfit font-bold text-4xl md:text-5xl text-primary mb-4">
            Why Your Fights Escalate
          </h2>
          <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full mb-6" />
          <p className="font-sans text-foreground/70 text-lg leading-relaxed font-light max-w-2xl mx-auto">
            Two parts of your brain are competing for control every time a conversation gets heated. Understanding them changes everything.
          </p>
        </div>

        <div className="rk-brain-reveal grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 md:p-10 border border-primary/5 relative overflow-hidden" style={{ boxShadow: '0 10px 40px -10px rgba(17, 145, 177, 0.06)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[40px] pointer-events-none" aria-hidden="true" />
            <div className="relative z-10">
              <h3 className="font-outfit font-bold text-2xl text-primary mb-2 flex items-center gap-3">
                <span className="text-3xl">&#128293;</span> The Critter Brain
              </h3>
              <p className="font-drama italic text-accent mb-4">The smoke alarm.</p>
              <p className="font-sans text-foreground/70 font-light leading-relaxed">
                Quick to react, terrible at distinguishing between burnt toast and a house fire. It&rsquo;s the part of your nervous system that scans for danger&mdash;installed long before you could talk. When your partner says something that brushes against an old wound, your Critter Brain hits the panic button before you even know what happened.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-10 border border-primary/5 relative overflow-hidden" style={{ boxShadow: '0 10px 40px -10px rgba(17, 145, 177, 0.06)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none" aria-hidden="true" />
            <div className="relative z-10">
              <h3 className="font-outfit font-bold text-2xl text-primary mb-2 flex items-center gap-3">
                <span className="text-3xl">&#127963;&#65039;</span> The CEO Brain
              </h3>
              <p className="font-drama italic text-accent mb-4">The wise part of you.</p>
              <p className="font-sans text-foreground/70 font-light leading-relaxed">
                It holds perspective, shows empathy, and chooses a response. But here&rsquo;s the problem: when the Critter Brain sounds the alarm, the CEO Brain gets locked out of the control room. The Rescue Kit teaches you how to bring your CEO back online&mdash;even in the middle of an argument.
              </p>
            </div>
          </div>
        </div>

        <p className="rk-brain-reveal text-center font-drama italic text-xl md:text-2xl text-primary mt-12 max-w-2xl mx-auto">
          Most couples fight Critter-to-Critter. We teach you to recognize the moment your Critter takes over&mdash;and how to bring your CEO back.
        </p>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  TEAL QUOTE                                                          */
/* ------------------------------------------------------------------ */
const Quote = () => (
  <TealQuoteBlock className="!bg-primary"
    quote="We were fighting three, four times a week. The same fight. Different words, same wound. Two weeks after using SPARK, we had our first disagreement that didn't end in silence. We actually talked through it. I cried because I forgot that was possible."
    attribution="Healing Hearts client"
  />
);

/* ------------------------------------------------------------------ */
/*  PRICING CTA                                                         */
/* ------------------------------------------------------------------ */
const PricingCta = () => {
  const { user } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const containerRef = useRef(null);

  async function handleBuyClick() {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      await startCheckout('rescue-kit', {
        email: user?.email,
        cancelPath: '/rescue-kit',
      });
    } catch (err) {
      setCheckoutError(err.message);
      setCheckoutLoading(false);
    }
  }

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.rk-pricing-reveal',
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 75%' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="pricing" ref={containerRef} className="w-full py-[clamp(4rem,8vw,6rem)] bg-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50vw] h-[50vw] bg-primary/3 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

      <div className="max-w-3xl mx-auto px-6 sm:px-10 relative z-10">
        <div
          className="rk-pricing-reveal bg-[#F9F8F5] rounded-3xl p-10 md:p-16 border border-primary/10 text-center"
          style={{ boxShadow: '0 20px 60px -15px rgba(17, 145, 177, 0.1)' }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-outfit font-bold px-5 py-2 rounded-full text-xs uppercase tracking-widest mb-8">
            <ShieldAlert className="w-4 h-4" />
            The Conflict Rescue Kit
          </div>

          <h2 className="rk-pricing-reveal font-drama italic text-5xl md:text-6xl text-primary mb-4">
            $39
          </h2>
          <p className="rk-pricing-reveal font-sans text-foreground/60 text-sm mb-8">
            One-time purchase &middot; Instant access &middot; 30-day guarantee
          </p>

          <div className="rk-pricing-reveal text-left max-w-md mx-auto mb-10">
            <h4 className="font-outfit font-bold text-sm text-primary/70 uppercase tracking-widest mb-4">Everything included:</h4>
            <ul className="space-y-3">
              {[
                'SPARK Method\u2122 training',
                'Critter Brain vs. CEO Brain framework',
                'Zones of Resilience self-assessment',
                'The 90-Second Wave guide',
                'Printable Conflict Recovery Plan',
                '5 guided reflection prompts',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="font-sans text-sm text-foreground/90 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rk-pricing-reveal">
            <MagneticButton
              onClick={handleBuyClick}
              disabled={checkoutLoading}
              className="bg-accent text-white px-8 sm:px-12 py-4 rounded-full text-base w-full sm:w-auto font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full md:w-auto disabled:opacity-60 disabled:cursor-wait"
            >
              {checkoutLoading ? 'Redirecting to checkout...' : 'Get the Conflict Rescue Kit'}
            </MagneticButton>
            {checkoutError && (
              <p className="text-red-500 text-sm mt-3">{checkoutError}</p>
            )}
          </div>

          <p className="rk-pricing-reveal font-sans text-foreground/60 text-sm mt-6 italic">
            The Conflict Rescue Kit is included in the full Healing Hearts program.
          </p>
          <p className="rk-pricing-reveal font-sans text-foreground/50 text-xs mt-2">
            Payments processed securely through Stripe. Access delivered instantly to your portal.
          </p>
        </div>

        {/* Upsell nudge */}
        <div className="rk-pricing-reveal text-center mt-12">
          <p className="font-sans text-foreground/60 font-light mb-3">
            Want the deeper work? The Conflict Rescue Kit content is included in our full program.
          </p>
          <Link
            to="/programs"
            className="inline-flex items-center gap-2 text-primary font-medium border-b-2 border-primary/20 hover:border-primary pb-1 transition-colors"
          >
            Explore the full Healing Hearts Program &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  FAQ                                                                 */
/* ------------------------------------------------------------------ */
const Faq = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.rk-faq-reveal',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 70%' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full py-[clamp(4rem,8vw,6rem)] bg-[#F9F8F5] relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-6 sm:px-10">
        <div className="rk-faq-reveal text-center mb-12">
          <h2 className="font-outfit font-bold text-4xl text-primary mb-4">
            Common Questions
          </h2>
          <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full" />
        </div>
        <div className="rk-faq-reveal">
          <FAQAccordion items={FAQ_ITEMS} />
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  CLOSING CTA                                                         */
/* ------------------------------------------------------------------ */
const ClosingCta = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.rk-closing-reveal',
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 75%' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full py-[clamp(4rem,8vw,6rem)] bg-white relative overflow-hidden">
      <div
        className="max-w-4xl mx-auto px-6 sm:px-12 text-center relative z-10 bg-white/60 backdrop-blur-sm p-12 md:p-20 rounded-3xl"
        style={{ boxShadow: '0 10px 40px -10px rgba(17, 145, 177, 0.06)' }}
      >
        <Heart className="rk-closing-reveal w-12 h-12 text-accent mx-auto mb-6" />
        <h2 className="rk-closing-reveal font-drama italic text-4xl md:text-5xl text-primary mb-8">
          The next argument is coming.<br />You get to choose how it goes.
        </h2>
        <p className="rk-closing-reveal text-lg md:text-xl text-foreground/70 font-light mb-12 leading-relaxed max-w-[55ch] mx-auto">
          You didn&rsquo;t break your relationship in a day, and you won&rsquo;t fix it in one either. But you can change the very next fight. And that&rsquo;s where everything starts to shift.
        </p>
        <div className="rk-closing-reveal">
          <MagneticButton
            className="bg-accent text-white px-8 sm:px-12 py-4 rounded-full text-base w-full sm:w-auto font-medium shadow-xl hover:shadow-2xl transition-shadow"
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get the Conflict Rescue Kit &mdash; $39
          </MagneticButton>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  PAGE EXPORT                                                         */
/* ------------------------------------------------------------------ */
export default function RescueKit() {
  usePageMeta('Conflict Rescue Kit', 'Stop the bleeding — the SPARK Method, Critter Brain framework, Zones of Resilience, and practical tools to transform how you fight.');
  return (
    <>
      <Hero />
      <OrganicDivider variant="wave-1" fillClass="text-[#F9F8F5]" />
      <TheProblem />
      <OrganicDivider variant="wave-2" fillClass="text-white" />
      <WhatsInside />
      <OrganicDivider variant="wave-3" fillClass="text-primary" />
      <SparkPreview />
      <OrganicDivider variant="wave-1" fillClass="text-[#F9F8F5]" />
      <CritterCeoPreview />
      <Quote />
      <OrganicDivider variant="wave-2" fillClass="text-white" />
      <PricingCta />
      <OrganicDivider variant="wave-3" fillClass="text-[#F9F8F5]" />
      <Faq />
      <OrganicDivider variant="wave-1" fillClass="text-white" />
      <ClosingCta />
    </>
  );
}
