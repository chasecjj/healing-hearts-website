import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '../components/Layout';
import { OrganicDivider, Button } from '@scoria/ui';
import usePageMeta from '../hooks/usePageMeta';
import {
  CheckCircle2,
  Flame,
  MessageCircleHeart,
  ShieldAlert,
  Sparkles,
  Landmark,
} from 'lucide-react';

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
const MODULES = [
  { num: 1, title: 'Love\'s Foundation', desc: 'Personality blueprint, attachment style, and love language.' },
  { num: 2, title: 'Invisible Chains', desc: 'Recognize toxic patterns hiding in plain sight.' },
  { num: 3, title: 'The Deep Roots', desc: 'Understand how your childhood wrote a Mindprint.' },
  { num: 4, title: 'Breakthrough Communication', desc: 'Express needs without blame, listen without defending.' },
];

const STANDALONE_PACKAGES = [
  {
    title: 'The Conflict Rescue Kit',
    subtitle: 'Stop the bleeding. Learn to fight without destroying.',
    desc: 'If your arguments have become a warzone\u2014or if you\'ve stopped fighting altogether because it feels pointless\u2014this is where you start.',
    includes: ['SPARK Method training', 'Critter Brain vs. CEO Brain framework', 'Zones of Resilience assessment', 'The 90-Second Wave guide', 'Printable Conflict Recovery Plan'],
    icon: ShieldAlert,
    span: 'lg:col-span-2',
    href: '/rescue-kit',
  },
  {
    title: 'Communication Mastery Toolkit',
    subtitle: 'Say what you mean\u2014and hear what they\'re really saying.',
    desc: 'Most couples don\'t have a communication problem. They have a safety problem. This toolkit teaches you to express needs without blame.',
    includes: ['Attachment style deep-dive', 'Needs expression framework', 'Active listening techniques', 'The SPARK repair process', 'Guided daily practices'],
    icon: MessageCircleHeart,
    span: 'lg:col-span-1',
  },
  {
    title: 'Toxic Pattern Breaker',
    subtitle: 'Name it. Trace it. Break the cycle.',
    desc: 'Some patterns erode trust at the foundation. Gaslighting, manipulation, emotional immaturity. We give you the vocabulary to see these patterns clearly.',
    includes: ['Gaslighting identification guide', 'Manipulation pattern analysis', 'Projection and shadow work', 'Emotional maturity assessment', 'Action plan'],
    icon: Flame,
    span: 'lg:col-span-1',
  },
  {
    title: 'Spark & Intimacy Bundle',
    subtitle: 'From roommates back to lovers.',
    desc: 'You share a bed. You coordinate schedules. But somewhere along the way, the spark went dark. This bundle addresses the full spectrum of intimacy.',
    includes: ['The 6 Levels of Intimacy framework', 'Desire and connection assessment', 'Rebuilding physical safety', 'Emotional vulnerability practices', '30-day reset plan'],
    icon: Sparkles,
    span: 'lg:col-span-2',
  },
  {
    title: 'Financial Unity System',
    subtitle: 'Because money fights are never really about money.',
    desc: 'Stop fighting about money and start building with it. Understand how your financial childhoods shaped your spending identities.',
    includes: ['Budget meeting framework', 'Debt reduction strategies', 'Financial childhood exploration', 'Spending personality assessment', 'Decision-making toolbox'],
    icon: Landmark,
    span: 'lg:col-span-3',
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
        '.programs-hero-reveal',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: 'power3.out', delay: 0.15 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[60dvh] flex items-center overflow-hidden mt-[-6rem] pt-[6rem]"
    >
      {/* Watercolor wash background — matching Home hero */}
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
        <p className="programs-hero-reveal font-sans text-primary/60 tracking-widest uppercase text-sm mb-6">
          Our Programs
        </p>
        <h1 className="programs-hero-reveal font-drama italic text-5xl md:text-7xl lg:text-8xl text-primary leading-tight mb-8">
          Every couple enters at a different place.
        </h1>
        <p className="programs-hero-reveal font-sans text-foreground/80 md:text-xl leading-relaxed font-light mx-auto max-w-3xl">
          Whether you're in crisis or just feeling the slow drift, we meet you where you are. Our programs are designed to stand alone or build on each other—so you can start with what you need most and go deeper when you're ready.
        </p>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  FLAGSHIP PROGRAM                                                    */
/* ------------------------------------------------------------------ */
const FlagshipProgram = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.flagship-reveal',
        { y: 40, opacity: 0 },
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
    <section ref={containerRef} className="w-full py-[clamp(4rem,8vw,6rem)] bg-[#F9F8F5] relative overflow-hidden">
      {/* Decorative blur */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-6">
        <div
          className="flagship-reveal bg-primary text-white rounded-3xl p-10 md:p-16 lg:p-20 relative overflow-hidden"
          style={{ boxShadow: '0 20px 60px -15px rgba(17, 145, 177, 0.3)' }}
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:items-start">
            {/* Left — Copy */}
            <div>
              <div className="flagship-reveal inline-block bg-amber-100 text-primary font-outfit font-bold px-5 py-2 rounded-full text-xs uppercase tracking-widest shadow-md mb-6">
                Premium Flagship Offering
              </div>
              <h2 className="flagship-reveal font-outfit font-bold text-4xl md:text-5xl mb-6">
                Healing Hearts <span className="font-drama italic font-normal">Program</span>
              </h2>
              <p className="flagship-reveal font-sans text-white/80 text-lg leading-relaxed font-light mb-8">
                Our complete 8-module program takes you from the foundations of understanding yourself and your partner all the way through nervous system regulation, subconscious healing, and building a legacy marriage.
              </p>
              <p className="flagship-reveal font-sans text-white/80 text-lg leading-relaxed font-light mb-12">
                This is the deep work—the kind that doesn't just improve your relationship but transforms the people in it.
              </p>

              <blockquote className="flagship-reveal border-l-2 border-accent pl-6 py-2 mb-12 hidden lg:block">
                <p className="font-drama italic text-2xl text-white leading-tight">
                  "This isn't a weekend workshop. It's a transformation. Give it 32 milestones and we'll give you a different marriage."
                </p>
              </blockquote>

              <div className="flagship-reveal">
                <Link to="/apply">
                  <MagneticButton
                    className="bg-accent text-white px-10 py-4 rounded-full text-sm font-bold shadow-xl w-full md:w-auto hover:scale-105 transition-all duration-300"
                  >
                    Apply for Healing Hearts
                  </MagneticButton>
                </Link>
              </div>
            </div>

            {/* Right — Module list */}
            <div className="flagship-reveal bg-white/10 p-10 md:p-14 rounded-3xl border border-white/20">
              <h3 className="font-outfit font-bold text-2xl mb-8 text-white">What's Inside (8 Modules)</h3>
              <div className="space-y-8">
                {MODULES.map((mod) => (
                  <div key={mod.num}>
                    <h4 className="font-sans font-semibold text-orange-100 text-lg">
                      {mod.num}. {mod.title}
                    </h4>
                    <p className="font-sans text-sm font-light text-white/80 mt-1">{mod.desc}</p>
                  </div>
                ))}
                <div className="pt-4 border-t border-white/20 mt-8">
                  <h4 className="font-sans text-sm font-medium text-white/90 italic leading-relaxed">
                    + 4 advanced modules on Nervous System, Emotional Zones, Subconscious Core Wounds, and Legacy Building.
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  STANDALONE PACKAGES — Editorial bento grid                          */
/* ------------------------------------------------------------------ */
const StandalonePackages = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.standalone-card');
      cards.forEach((card) => {
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
      gsap.fromTo(
        '.standalone-heading',
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
    <section ref={containerRef} className="w-full py-[clamp(4rem,8vw,6rem)] bg-white relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" aria-hidden="true" />
      <div className="absolute top-0 right-0 w-[25vw] h-[25vw] bg-accent/5 rounded-full blur-[80px] -translate-y-1/3 translate-x-1/3 pointer-events-none" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Section heading */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="standalone-heading font-outfit font-bold text-4xl md:text-5xl text-primary mb-4">
            Standalone Packages
          </h2>
          <div className="standalone-heading w-24 h-1 bg-primary/20 mx-auto rounded-full mb-6" />
          <p className="standalone-heading font-sans text-foreground/70 text-lg leading-relaxed font-light">
            Not ready for the full program? Start with one of our focused packages. Each one tackles a specific pain point with the same depth and science that drives our flagship program.
          </p>
        </div>

        {/* Bento grid — asymmetric card sizes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {STANDALONE_PACKAGES.map((pkg, idx) => {
            const Icon = pkg.icon;
            return (
              <div
                key={idx}
                className={`standalone-card group relative bg-[#F9F8F5] rounded-3xl border border-primary/5 overflow-hidden transition-all duration-500 hover:-translate-y-1 flex flex-col ${pkg.span}`}
                style={{ boxShadow: '0 10px 40px -10px rgba(17, 145, 177, 0.06)' }}
              >
                {/* Top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-accent/30 to-transparent" />

                <div className="p-8 md:p-10 flex flex-col flex-grow">
                  {/* Icon + Title row */}
                  <div className="flex items-start gap-5 mb-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-drama italic text-3xl text-primary mb-1 leading-tight">{pkg.title}</h3>
                      <h4 className="font-outfit font-bold text-sm text-accent">{pkg.subtitle}</h4>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="font-sans text-base text-foreground/80 font-normal leading-relaxed mb-8 max-w-[65ch]">
                    {pkg.desc}
                  </p>

                  {/* Includes */}
                  <h5 className="font-outfit font-bold text-sm text-primary/70 uppercase tracking-widest mb-4">Includes</h5>
                  <ul className="space-y-3 mb-10 flex-grow">
                    {pkg.includes.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="font-sans text-sm text-foreground/90 font-medium leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    to={pkg.href || '/apply'}
                    className="block w-full py-3 rounded-full border-2 border-primary/20 text-primary font-outfit font-semibold text-sm hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 mt-auto text-center"
                  >
                    View Details
                  </Link>
                </div>

                {/* Background glow on hover */}
                <div
                  className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            );
          })}
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
        '.closing-reveal',
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
    <section ref={containerRef} className="w-full py-[clamp(4rem,8vw,6rem)] bg-[#F9F8F5] relative overflow-hidden">
      <div
        className="max-w-4xl mx-auto px-6 sm:px-12 text-center relative z-10 bg-white/60 backdrop-blur-sm p-12 md:p-20 rounded-3xl"
        style={{ boxShadow: '0 10px 40px -10px rgba(17, 145, 177, 0.06)' }}
      >
        <h2 className="closing-reveal font-drama italic text-4xl md:text-5xl text-primary mb-8">
          Not sure where to start?
        </h2>
        <p className="closing-reveal text-lg md:text-xl text-foreground/70 font-light mb-12 leading-relaxed max-w-[55ch] mx-auto">
          Whether you're in crisis or just feeling the slow drift, we meet you where you are. Our programs are designed to stand alone or build on each other—so you can start with what you need most and go deeper when you're ready.
        </p>
        <div className="closing-reveal flex flex-col sm:flex-row gap-5 justify-center">
          <Link to="/apply">
            <MagneticButton
              className="bg-accent text-white px-10 py-4 rounded-full text-base font-medium shadow-xl hover:shadow-2xl transition-shadow"
            >
              Apply for Healing Hearts
            </MagneticButton>
          </Link>
          <Link
            to="/book"
            className="inline-flex items-center gap-2 text-primary font-medium border-b-2 border-primary/20 hover:border-primary pb-1 transition-colors self-center"
          >
            Talk to Us First
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  PAGE EXPORT                                                         */
/* ------------------------------------------------------------------ */
export default function Programs() {
  usePageMeta('Programs', 'Explore our flagship 8-module couples program and standalone packages for communication, conflict resolution, intimacy, and more.');
  return (
    <>
      <Hero />
      <OrganicDivider variant="wave-1" fillClass="text-[#F9F8F5]" />
      <FlagshipProgram />
      <OrganicDivider variant="wave-2" fillClass="text-white" />
      <StandalonePackages />
      <OrganicDivider variant="wave-3" fillClass="text-[#F9F8F5]" />
      <ClosingCta />
    </>
  );
}
