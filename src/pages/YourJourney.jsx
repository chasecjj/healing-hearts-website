import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '../components/Layout';
import { OrganicDivider } from '@scoria/ui';
import usePageMeta from '../hooks/usePageMeta';
import {
  Heart,
  Brain,
  Shield,
  MessageCircleHeart,
  Activity,
  Compass,
  Sparkles,
  Crown,
  Video,
  Users,
  BookOpen,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */
const PHASES = [
  {
    phase: 1,
    label: 'Understand',
    tagline: 'See yourself clearly — maybe for the first time.',
    description:
      'Before you can change anything, you need to understand what\'s actually driving the disconnect. This phase peels back the layers — your personality wiring, your attachment patterns, and the childhood blueprint that still runs the show.',
    color: 'primary',
    modules: [
      {
        num: 1,
        title: "Love's Foundation",
        desc: 'Discover your personality blueprint, attachment style, and love language — the invisible forces shaping every interaction with your partner.',
        icon: Heart,
      },
      {
        num: 2,
        title: 'Invisible Chains',
        desc: 'Recognize the toxic patterns hiding in plain sight — gaslighting, projection, emotional immaturity — and name what you\'ve been feeling.',
        icon: Shield,
      },
      {
        num: 3,
        title: 'The Deep Roots',
        desc: 'Trace your relationship patterns back to their origin. Your childhood wrote a Mindprint. Now you get to read it.',
        icon: Brain,
      },
    ],
  },
  {
    phase: 2,
    label: 'Transform',
    tagline: 'New tools. New responses. A new way of being together.',
    description:
      'Understanding isn\'t enough — you need real tools that work in real arguments, real silences, real Tuesday nights. This phase gives you the SPARK Method, nervous system regulation, and emotional mastery frameworks that change how you show up.',
    color: 'accent',
    modules: [
      {
        num: 4,
        title: 'Breakthrough Communication',
        desc: 'Learn the SPARK Method — our 5-step framework for expressing needs without blame and listening without defending.',
        icon: MessageCircleHeart,
      },
      {
        num: 5,
        title: 'Nervous System Regulation',
        desc: 'Master the 90-Second Wave. Understand your Zones of Resilience. Calm the storm inside before addressing the storm between you.',
        icon: Activity,
      },
      {
        num: 6,
        title: 'Emotional Zones',
        desc: 'Meet your Critter Brain and CEO Brain. Map your emotional landscape and learn to navigate it together.',
        icon: Compass,
      },
    ],
  },
  {
    phase: 3,
    label: 'Rebuild',
    tagline: 'Heal what\'s deepest. Build what lasts.',
    description:
      'This is the deep work that most programs never touch. Core wound healing, belief reprogramming, forgiveness that actually frees you — and then building a marriage that transforms not just your life, but your family for generations.',
    color: 'primary',
    modules: [
      {
        num: 7,
        title: 'Forgiveness & Letting Go',
        desc: 'Heal the hidden core wounds driving your reactions. Learn the BTEA Cycle and reprogram the beliefs your younger self wrote for survival.',
        icon: Sparkles,
      },
      {
        num: 'F',
        title: 'Legacy Building',
        desc: 'Build a marriage that transforms generations. This is where everything comes together — your legacy starts here.',
        icon: Crown,
      },
    ],
  },
];

const INCLUDED = [
  {
    icon: BookOpen,
    title: '8 Deep-Dive Modules',
    desc: '25+ lessons with our proprietary frameworks, reflection prompts, and guided practices designed for real couples in real life.',
  },
  {
    icon: Video,
    title: 'Weekly Coaching with Trisha',
    desc: '90-minute live Zoom sessions every week. Ask questions, get personalized guidance, and do the work together in real time.',
  },
  {
    icon: Users,
    title: 'Private Community',
    desc: 'A safe space to connect with other couples walking the same path. You are not alone in this.',
  },
  {
    icon: Activity,
    title: 'Proprietary Frameworks',
    desc: 'The SPARK Method, Critter Brain vs. CEO Brain, Zones of Resilience, 90-Second Wave, Core Wounds — tools you\'ll use for life.',
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
        '.journey-hero-reveal',
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
        <p className="journey-hero-reveal font-sans text-primary/60 tracking-widest uppercase text-sm mb-6">
          The Healing Hearts Journey
        </p>
        <h1 className="journey-hero-reveal font-drama italic text-5xl md:text-7xl lg:text-8xl text-primary leading-tight mb-8">
          Your path back <br className="hidden md:block" />to each other.
        </h1>
        <p className="journey-hero-reveal font-sans text-foreground/80 md:text-xl leading-relaxed font-light mx-auto max-w-3xl mb-6">
          This isn't a weekend workshop or a list of tips. It's a guided transformation through 32 milestones — from understanding why you shut down, to building a marriage that lasts generations.
        </p>
        <p className="journey-hero-reveal font-sans text-foreground/60 md:text-lg leading-relaxed font-light mx-auto max-w-2xl mb-12">
          Built by Jeff & Trisha Jamison from the trenches of their own marriage. Every framework has been tested in real life first.
        </p>
        <div className="journey-hero-reveal flex flex-col sm:flex-row gap-5 justify-center">
          <Link to="/apply">
            <MagneticButton className="bg-accent text-white px-10 py-4 rounded-full text-base font-medium shadow-xl hover:shadow-2xl transition-shadow">
              Apply for Healing Hearts
            </MagneticButton>
          </Link>
          <Link
            to="/spark-challenge"
            className="group inline-flex items-center gap-2 text-primary font-medium border-b-2 border-primary/20 hover:border-primary pb-1 transition-colors self-center"
          >
            Try the Free Spark Challenge
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  THE PROBLEM — Why most approaches fail                              */
/* ------------------------------------------------------------------ */
const TheProblem = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.problem-reveal',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 70%' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="w-full py-[clamp(4rem,8vw,6rem)] bg-[#F9F8F5] relative overflow-hidden"
    >
      {/* Decorative blurs */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" aria-hidden="true" />

      <div className="max-w-4xl mx-auto px-6 sm:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="problem-reveal font-drama italic text-4xl md:text-5xl text-primary mb-8 leading-tight">
              You've tried to fix this before.
            </h2>
            <p className="problem-reveal font-sans text-foreground/80 text-lg leading-relaxed font-light mb-6">
              The books. The late-night conversations that felt like breakthroughs but changed nothing by Tuesday. Maybe even a therapist's office where you nodded along while the clock ran out.
            </p>
            <p className="problem-reveal font-sans text-foreground/80 text-lg leading-relaxed font-light">
              Here's what nobody told you: most relationship advice treats symptoms. It teaches you better words to say during a fight. But it never touches the part of your brain that's actually <em>running</em> the fight.
            </p>
          </div>
          <div className="problem-reveal">
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-primary/5" style={{ boxShadow: '0 10px 40px -10px rgba(17, 145, 177, 0.06)' }}>
              <h3 className="font-outfit font-bold text-xl text-primary mb-6">Our approach is different.</h3>
              <div className="space-y-5">
                {[
                  'We start with your nervous system — not your arguments',
                  'We trace patterns to their roots, not just their symptoms',
                  'We give you frameworks that work at 11pm on a Tuesday',
                  'We walk beside you with live coaching every single week',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="font-sans text-foreground/80 text-sm leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  3-PHASE JOURNEY ARC — The heart of the page                        */
/* ------------------------------------------------------------------ */
const JourneyArc = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.arc-heading',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 70%' },
        }
      );

      gsap.utils.toArray('.phase-card').forEach((card) => {
        gsap.fromTo(
          card,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: card, start: 'top 85%' },
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full py-[clamp(4rem,8vw,6rem)] bg-white relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" aria-hidden="true" />
      <div className="absolute top-0 right-0 w-[25vw] h-[25vw] bg-accent/5 rounded-full blur-[80px] -translate-y-1/3 translate-x-1/3 pointer-events-none" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Section heading */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="arc-heading font-drama italic text-4xl md:text-5xl text-primary mb-4">
            Three phases. One transformation.
          </h2>
          <div className="arc-heading w-24 h-1 bg-primary/20 mx-auto rounded-full mb-6" />
          <p className="arc-heading font-sans text-foreground/70 text-lg leading-relaxed font-light">
            Each phase builds on the last. You start by understanding yourself, then learn to transform how you respond, and finally rebuild from the deepest level. No skipping ahead — the foundation matters.
          </p>
        </div>

        {/* Phase cards */}
        <div className="space-y-16 md:space-y-24">
          {PHASES.map((phase) => (
            <div key={phase.phase} className="phase-card">
              {/* Phase header */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-outfit font-bold text-xl text-white ${
                  phase.color === 'accent' ? 'bg-accent' : 'bg-primary'
                }`}>
                  {phase.phase}
                </div>
                <div>
                  <h3 className="font-outfit font-bold text-2xl md:text-3xl text-primary">
                    {phase.label}
                  </h3>
                  <p className="font-drama italic text-lg text-foreground/60">{phase.tagline}</p>
                </div>
              </div>

              <p className="font-sans text-foreground/80 text-lg leading-relaxed font-light mb-10 max-w-3xl">
                {phase.description}
              </p>

              {/* Module cards */}
              <div className={`grid grid-cols-1 ${phase.modules.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6`}>
                {phase.modules.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <div
                      key={mod.num}
                      className="group relative bg-[#F9F8F5] rounded-3xl border border-primary/5 p-8 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                      style={{ boxShadow: '0 10px 40px -10px rgba(17, 145, 177, 0.06)' }}
                    >
                      {/* Top accent bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1 ${
                        phase.color === 'accent'
                          ? 'bg-gradient-to-r from-accent/40 via-accent/20 to-transparent'
                          : 'bg-gradient-to-r from-primary/40 via-primary/20 to-transparent'
                      }`} />

                      {/* Background glow on hover */}
                      <div
                        className={`absolute -top-10 -right-10 w-40 h-40 ${
                          phase.color === 'accent' ? 'bg-accent/5' : 'bg-primary/5'
                        } rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}
                        aria-hidden="true"
                      />

                      <div className="relative z-10">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            phase.color === 'accent' ? 'bg-accent/10' : 'bg-primary/10'
                          }`}>
                            <Icon className={`w-6 h-6 ${phase.color === 'accent' ? 'text-accent' : 'text-primary'}`} />
                          </div>
                          <div>
                            <p className="font-outfit font-bold text-xs text-foreground/40 uppercase tracking-widest mb-1">
                              Module {mod.num === 'F' ? 'Final' : mod.num}
                            </p>
                            <h4 className="font-drama italic text-2xl text-primary leading-tight">{mod.title}</h4>
                          </div>
                        </div>
                        <p className="font-sans text-foreground/70 text-sm leading-relaxed font-light">
                          {mod.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  TEAL QUOTE — Emotional mid-page beat                               */
/* ------------------------------------------------------------------ */
const TealQuote = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.jquote-reveal',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 75%' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative py-24 md:py-32 overflow-hidden bg-primary">
      {/* Botanical vine decoration */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 opacity-10 pointer-events-none" aria-hidden="true">
        <svg height="400" viewBox="0 0 300 400" width="300">
          <path d="M50 100 C150 100 150 300 250 300" fill="none" stroke="white" strokeWidth="2" />
          <circle cx="50" cy="100" fill="white" r="10" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-12 text-center relative z-10">
        <span className="jquote-reveal block text-7xl md:text-8xl leading-none text-white/20 font-drama select-none mb-6" aria-hidden="true">
          &ldquo;
        </span>
        <blockquote className="jquote-reveal font-drama italic text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-10">
          This isn't a weekend workshop. It's a transformation. Give it 32 milestones and we'll give you a different marriage.
        </blockquote>
        <cite className="jquote-reveal not-italic text-base sm:text-lg text-white/70 font-medium tracking-wide uppercase block">
          — Trisha Jamison
        </cite>
        <div className="jquote-reveal mt-12 flex justify-center gap-3" aria-hidden="true">
          <div className="w-3 h-3 rounded-full bg-white/60" />
          <div className="w-3 h-3 rounded-full bg-white/25" />
          <div className="w-3 h-3 rounded-full bg-white/25" />
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  WHAT'S INCLUDED                                                     */
/* ------------------------------------------------------------------ */
const WhatsIncluded = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.included-reveal',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 70%' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full py-[clamp(4rem,8vw,6rem)] bg-[#F9F8F5] relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute bottom-0 right-0 w-[30vw] h-[30vw] bg-accent/5 rounded-full blur-[80px] translate-y-1/2 translate-x-1/3 pointer-events-none" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="included-reveal font-drama italic text-4xl md:text-5xl text-primary mb-4">
            Everything you need to do the real work.
          </h2>
          <div className="included-reveal w-24 h-1 bg-primary/20 mx-auto rounded-full mb-6" />
          <p className="included-reveal font-sans text-foreground/70 text-lg leading-relaxed font-light">
            This isn't a course you watch and forget. It's a guided experience — with live coaching, a supportive community, and tools designed to meet you in the middle of real life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {INCLUDED.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="included-reveal group relative bg-white rounded-3xl border border-primary/5 p-8 md:p-10 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                style={{ boxShadow: '0 10px 40px -10px rgba(17, 145, 177, 0.06)' }}
              >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" aria-hidden="true" />

                <div className="relative z-10 flex items-start gap-5">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-outfit font-bold text-xl text-primary mb-2">{item.title}</h3>
                    <p className="font-sans text-foreground/70 text-base leading-relaxed font-light">{item.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  FREE PREVIEW + CLOSING CTA                                          */
/* ------------------------------------------------------------------ */
const ClosingCta = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.jcta-reveal',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 75%' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full py-[clamp(4rem,8vw,6rem)] bg-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 50%, rgba(17,145,177,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(185,106,95,0.06) 0%, transparent 50%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Spark Challenge card — free first step */}
          <div
            className="jcta-reveal bg-[#F9F8F5] rounded-3xl p-10 md:p-12 border border-primary/5 flex flex-col"
            style={{ boxShadow: '0 10px 40px -10px rgba(17, 145, 177, 0.06)' }}
          >
            <p className="font-outfit font-bold text-xs text-accent uppercase tracking-widest mb-3">Start Free</p>
            <h3 className="font-drama italic text-3xl text-primary mb-4">
              Start before you commit.
            </h3>
            <p className="font-sans text-foreground/70 text-base leading-relaxed font-light mb-8 flex-grow">
              The 7-Day Spark Challenge is a free daily practice delivered to your inbox. One small shift a day, for seven days — no credit card, no commitment, just a taste of the work we do in the full program.
            </p>
            <Link to="/spark-challenge">
              <MagneticButton className="w-full py-4 rounded-full border-2 border-primary/20 text-primary font-outfit font-semibold text-sm hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                Start the Spark Challenge
              </MagneticButton>
            </Link>
          </div>

          {/* Full Program card */}
          <div
            className="jcta-reveal bg-primary text-white rounded-3xl p-10 md:p-12 relative overflow-hidden flex flex-col"
            style={{ boxShadow: '0 20px 60px -15px rgba(17, 145, 177, 0.3)' }}
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

            <div className="relative z-10 flex flex-col h-full">
              <p className="font-outfit font-bold text-xs text-accent uppercase tracking-widest mb-3">Full Program</p>
              <h3 className="font-drama italic text-3xl text-white mb-4">
                Ready to do the real work?
              </h3>
              <p className="font-sans text-white/80 text-base leading-relaxed font-light mb-8 flex-grow">
                8 modules. 32 milestones. 36 coaching sessions with Trisha. A private community of couples on the same path. And a transformation that changes not just your marriage — but your family tree.
              </p>
              <Link to="/apply">
                <MagneticButton className="w-full py-4 rounded-full bg-accent text-white font-outfit font-semibold text-sm shadow-xl hover:scale-105 transition-all duration-300">
                  Apply for Healing Hearts
                </MagneticButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <p className="jcta-reveal text-center mt-12 font-sans text-foreground/50 text-sm font-light">
          Have questions?{' '}
          <Link to="/contact" className="text-accent hover:text-primary transition-colors underline underline-offset-2">
            Talk to us first
          </Link>
          . We're real people who've walked this road.
        </p>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  PAGE EXPORT                                                        */
/* ------------------------------------------------------------------ */
export default function YourJourney() {
  usePageMeta('Your Journey', 'Explore the complete Healing Hearts program — 8 modules, weekly coaching, and a path from crisis to connection.');
  return (
    <>
      <Hero />
      <OrganicDivider variant="wave-1" fillClass="text-[#F9F8F5]" />
      <TheProblem />
      <OrganicDivider variant="wave-2" fillClass="text-white" />
      <JourneyArc />
      <TealQuote />
      <WhatsIncluded />
      <OrganicDivider variant="wave-3" fillClass="text-white" />
      <ClosingCta />
    </>
  );
}
