import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '../components/Layout';
import { OrganicDivider, Button } from '@scoria/ui';
import usePageMeta from '../hooks/usePageMeta';
import {
  CheckCircle2,
  ShieldAlert,
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
  { num: 1, title: 'The Seven Devils', desc: 'Name the seven patterns destroying your relationship. Learn the SPARK Method.', lessons: 28 },
  { num: 2, title: 'The Devils Up Close', desc: 'Face Criticism, Contempt, Defensiveness, Stonewalling. Build your Devil Audit.', lessons: 24 },
  { num: 3, title: 'The Deep Roots', desc: 'Trace your patterns to their origin. Your childhood wrote a Mindprint.', lessons: 3 },
  { num: 4, title: 'Breakthrough Communication', desc: 'Master active listening and the "I Feel / I Need" formula.', lessons: 3 },
  { num: 5, title: 'Nervous System Regulation', desc: 'The 90-Second Wave. Zones of Resilience. Co-regulation practices.', lessons: 3 },
  { num: 6, title: 'Emotional Zones', desc: 'Critter Brain vs. CEO Brain. Emotional Maturity Assessment.', lessons: 3 },
  { num: 7, title: 'Subconscious Core Wounds', desc: 'The 12 Subconscious Principles. Core wounds. True forgiveness.', lessons: 18 },
  { num: 8, title: 'Legacy of Love', desc: 'Integration, resilience, and future-proofing your marriage.', lessons: 8 },
];

const STANDALONE_PACKAGES = [
  {
    title: 'The Conflict Rescue Kit',
    subtitle: 'Stop the bleeding. Learn to fight without destroying.',
    desc: 'If your arguments have become a warzone — or if you\'ve stopped fighting altogether because it feels pointless — this is where you start. First aid for couples who can\'t wait to feel better.',
    includes: ['SPARK Method training', 'Critter Brain vs. CEO Brain framework', 'Zones of Resilience self-assessment', 'The 90-Second Wave guide', 'Conflict Recovery Plan + 7-day practice plan'],
    icon: ShieldAlert,
    span: 'lg:col-span-3',
    href: '/rescue-kit',
    price: '$39',
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
    <section ref={containerRef} className="w-full py-[clamp(4rem,8vw,6rem)] bg-background relative overflow-hidden">
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
                90+ lessons across 8 modules. From naming the Seven Devils destroying your connection, through nervous system regulation and the SPARK Method, to subconscious core wound healing and building a legacy marriage.
              </p>
              <p className="flagship-reveal font-sans text-white/80 text-lg leading-relaxed font-light mb-12">
                This is the deep work — the kind that doesn't just improve your relationship but transforms the people in it. Weekly coaching with Trisha. Interactive practice plans. A community of couples on the same path.
              </p>

              <blockquote className="flagship-reveal border-l-2 border-accent pl-6 py-2 mb-12 hidden lg:block">
                <p className="font-drama italic text-2xl text-white leading-tight">
                  "The bad days somehow find a way to look good still, because it's communicating. We have tools now that we didn't have before."
                </p>
                <cite className="not-italic font-outfit text-xs text-white/50 uppercase tracking-widest mt-2 block">
                  -- Program participant
                </cite>
              </blockquote>

              <div className="flagship-reveal flex flex-col sm:flex-row gap-4">
                <Link to="/apply">
                  <MagneticButton
                    className="bg-accent text-white px-10 py-4 rounded-full text-sm font-bold shadow-xl w-full md:w-auto hover:scale-105 transition-all duration-300"
                  >
                    Apply for Healing Hearts
                  </MagneticButton>
                </Link>
                <Link
                  to="/journey"
                  className="inline-flex items-center gap-2 text-white/80 font-medium border-b-2 border-white/20 hover:border-white pb-1 transition-colors self-center text-sm"
                >
                  Explore the Full Journey
                </Link>
              </div>
            </div>

            {/* Right — Module list */}
            <div className="flagship-reveal bg-white/10 p-10 md:p-14 rounded-3xl border border-white/20">
              <h3 className="font-outfit font-bold text-2xl mb-8 text-white">What's Inside (8 Modules)</h3>
              <div className="space-y-6">
                {MODULES.map((mod) => (
                  <div key={mod.num}>
                    <div className="flex items-baseline justify-between gap-4">
                      <h4 className="font-sans font-semibold text-orange-100 text-base">
                        {mod.num}. {mod.title}
                      </h4>
                      <span className="font-outfit text-[10px] text-white/40 uppercase tracking-widest flex-shrink-0">
                        {mod.lessons} lessons
                      </span>
                    </div>
                    <p className="font-sans text-sm font-light text-white/70 mt-1">{mod.desc}</p>
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
            Start Smaller
          </h2>
          <div className="standalone-heading w-24 h-1 bg-primary/20 mx-auto rounded-full mb-6" />
          <p className="standalone-heading font-sans text-foreground/70 text-lg leading-relaxed font-light">
            Not ready for the full program? The Rescue Kit tackles the most urgent pain point — conflict — with the same depth and science that drives our flagship program. One purchase, instant access, keep it forever.
          </p>
        </div>

        {/* Bento grid — asymmetric card sizes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {STANDALONE_PACKAGES.map((pkg, idx) => {
            const Icon = pkg.icon;
            return (
              <div
                key={idx}
                className={`standalone-card group relative bg-background rounded-3xl border border-primary/5 overflow-hidden transition-all duration-500 hover:-translate-y-1 flex flex-col ${pkg.span}`}
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
                    {pkg.price && (
                      <span className="bg-accent text-white font-outfit font-bold text-sm px-4 py-1.5 rounded-full flex-shrink-0">
                        {pkg.price}
                      </span>
                    )}
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
                    {pkg.href === '/rescue-kit' ? 'Get the Rescue Kit' : 'Learn More'}
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
    <section ref={containerRef} className="w-full py-[clamp(4rem,8vw,6rem)] bg-background relative overflow-hidden">
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
      <OrganicDivider variant="wave-1" fillClass="text-background" />
      <FlagshipProgram />
      <OrganicDivider variant="wave-2" fillClass="text-white" />
      <StandalonePackages />
      <OrganicDivider variant="wave-3" fillClass="text-background" />
      <ClosingCta />
    </>
  );
}
