import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '../components/Layout';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Shared: reduced-motion check                                       */
/* ------------------------------------------------------------------ */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ */
/*  HERO — Organic Flow variant                                        */
/*  Watercolor cream background, teardrop-masked couple photo,         */
/*  serif italic headline, salmon CTA. Wave divider into next section. */
/* ------------------------------------------------------------------ */
const Hero = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-reveal',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: 'power3.out', delay: 0.15 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[100dvh] flex items-center overflow-hidden mt-[-6rem] pt-[6rem]"
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

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text + CTA — Left */}
          <div className="flex flex-col items-start text-left gap-6">
            <h1 className="flex flex-col text-primary">
              <span className="hero-reveal font-sans font-medium text-lg md:text-xl tracking-widest uppercase opacity-80 mb-6 text-primary">
                Healing Hearts
              </span>
              <span className="hero-reveal font-drama italic text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight text-primary">
                Your marriage is not broken.
              </span>
              <span className="hero-reveal font-outfit font-bold text-4xl md:text-6xl mt-4 text-primary">
                It's buried.
              </span>
            </h1>
            <p className="hero-reveal mt-4 font-sans text-foreground/80 text-lg md:text-xl max-w-[50ch] font-light leading-relaxed">
              Underneath everything you were never taught. We help you understand why you shut down, and how to come back to each other.
            </p>
            <div className="hero-reveal mt-6 flex flex-col sm:flex-row gap-5">
              <Link to="/spark-challenge">
                <MagneticButton className="bg-accent text-white px-10 py-4 rounded-full text-base font-medium shadow-xl hover:shadow-2xl">
                  Start the Free Challenge
                </MagneticButton>
              </Link>
              <Link
                to="/about"
                className="group inline-flex items-center gap-2 text-primary font-medium border-b-2 border-primary/20 hover:border-primary pb-1 transition-colors self-center"
              >
                Explore Our Philosophy
              </Link>
            </div>
          </div>

          {/* Teardrop image — Right */}
          <div className="hero-reveal hidden lg:flex justify-center items-center">
            <div className="relative w-full max-w-sm aspect-[3/4]">
              {/* SVG clip definition */}
              <svg className="absolute w-0 h-0" aria-hidden="true">
                <defs>
                  <clipPath id="teardrop-hero" clipPathUnits="objectBoundingBox">
                    <path d="M0.5 0 C0.7 0.2 0.9 0.4 0.9 0.7 C0.9 0.9 0.7 1 0.5 1 C0.3 1 0.1 0.9 0.1 0.7 C0.1 0.4 0.3 0.2 0.5 0" />
                  </clipPath>
                </defs>
              </svg>
              <div
                className="w-full h-full overflow-hidden shadow-2xl"
                style={{ clipPath: 'url(#teardrop-hero)' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=1287&auto=format&fit=crop"
                  alt="Couple walking together at sunset"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay pointer-events-none" />
              </div>

              {/* Floating accent bubble */}
              <div className="absolute -bottom-6 -left-6 w-44 h-44 bg-white rounded-full flex items-center justify-center p-6 border border-primary/10 shadow-lg">
                <p className="font-drama italic text-sm text-primary leading-snug text-center">
                  "Healing happens in the spaces between words."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave transition into Philosophy */}
      <div className="absolute bottom-0 left-0 w-full leading-[0] pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-auto block">
          <path
            d="M0,192L48,176C96,160,192,128,288,128C384,128,480,160,576,181.3C672,203,768,213,864,197.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            className="fill-[#F9F8F5]"
          />
        </svg>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  PHILOSOPHY — Editorial two-column with organic image mask          */
/* ------------------------------------------------------------------ */
const Philosophy = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.phil-reveal',
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
      className="w-full py-[clamp(4rem,8vw,6rem)] bg-[#F9F8F5] relative z-10 overflow-hidden"
    >
      {/* Subtle botanical vines */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" aria-hidden="true">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path d="M10,10 Q20,40 10,70 T10,100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
          <path d="M90,10 Q80,40 90,70 T90,100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
        </svg>
      </div>

      {/* Decorative blurs */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Image — botanical mask with floating quote */}
          <div className="phil-reveal relative flex justify-center order-last md:order-first min-h-[300px]">
            {/* SVG clip definition */}
            <svg className="absolute w-0 h-0" aria-hidden="true">
              <defs>
                <clipPath id="teardrop-phil" clipPathUnits="objectBoundingBox">
                  <path d="M0.5 0 C0.7 0.2 0.9 0.4 0.9 0.7 C0.9 0.9 0.7 1 0.5 1 C0.3 1 0.1 0.9 0.1 0.7 C0.1 0.4 0.3 0.2 0.5 0" />
                </clipPath>
              </defs>
            </svg>
            <div className="relative w-full max-w-md aspect-[4/5]">
              <div
                className="w-full h-full overflow-hidden rounded-[2.5rem] md:rounded-none shadow-2xl md:[clip-path:url(#teardrop-phil)]"
              >
                <img
                  src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1287&auto=format&fit=crop"
                  alt="Couple connecting emotionally"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-primary/15 mix-blend-overlay pointer-events-none" />
              </div>
              {/* Floating pull-quote */}
              <div className="absolute -bottom-8 -right-4 md:-right-8 bg-white p-6 rounded-[2rem] shadow-xl border border-primary/5 max-w-xs z-20">
                <p className="font-drama italic text-xl text-primary leading-tight">
                  "Before you can communicate better, you have to feel safe."
                </p>
              </div>
            </div>
          </div>

          {/* Text Side */}
          <div className="text-left relative z-10 max-w-2xl">
            <h2 className="phil-reveal font-drama italic text-4xl md:text-5xl lg:text-6xl text-primary mb-8 leading-tight">
              You've tried everything. <br /> Nothing is sticking.
            </h2>
            <p className="phil-reveal font-sans text-foreground/80 text-lg leading-relaxed mb-6 font-light max-w-[65ch]">
              You've read the books. Maybe you've sat in a therapist's office and nodded along while the clock ran out. You've had the tearful conversations at midnight that felt like breakthroughs but changed nothing by Tuesday morning.
            </p>
            <p className="phil-reveal font-sans text-foreground/80 text-lg leading-relaxed mb-12 font-light max-w-[65ch]">
              Here's what nobody told you: most relationship advice treats symptoms. It teaches you better words to say during a fight. But it never touches the part of your brain that's actually running the fight.
            </p>
            <div className="phil-reveal flex justify-start mt-8">
              <Link
                to="/about"
                className="group inline-flex items-center gap-3 text-accent hover:text-primary font-medium tracking-wide transition-colors"
              >
                <span className="border-b border-accent/30 group-hover:border-primary pb-1 transition-colors">
                  Read Our Philosophy
                </span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  PILLARS — "A Different Kind of Help"                               */
/*  Organic rounded cards in a staggered zig-zag layout.               */
/*  Teal accents, rounded-3xl corners.                                 */
/* ------------------------------------------------------------------ */
const Pillars = () => {
  const containerRef = useRef(null);

  const pillars = [
    {
      title: 'Science That Makes Sense',
      description:
        'Grounded in polyvagal theory, attachment science, and the latest neuroscience research\u2014translated into language that actually sticks.',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      accent: 'bg-primary/10 text-primary',
      bgGlow: 'bg-primary/5',
    },
    {
      title: 'Faith Woven In',
      description:
        'We believe marriages are sacred. Our faith shapes how we see covenant and forgiveness\u2014but we never weaponize scripture.',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      accent: 'bg-accent/10 text-accent',
      bgGlow: 'bg-accent/5',
    },
    {
      title: 'Built by a Couple',
      description:
        'Jeff and Trisha learned this in the trenches of their own marriage. Every framework in this program has been tested in real life first.',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      accent: 'bg-primary/10 text-primary',
      bgGlow: 'bg-primary/5',
    },
  ];

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.pillar-reveal',
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
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {/* Section heading */}
        <div className="mb-16 md:mb-20 text-center max-w-3xl mx-auto">
          <h2 className="pillar-reveal font-drama italic text-4xl md:text-5xl text-primary mb-4">
            A Different Kind of Help
          </h2>
          <div className="pillar-reveal w-24 h-1 bg-primary/20 mx-auto rounded-full mb-6" />
          <p className="pillar-reveal font-sans text-foreground/70 text-lg font-light max-w-[65ch] mx-auto">
            We go beneath the arguments. Past the surface. Into the nervous system, the attachment wounds, and the invisible scripts your childhood wrote.
          </p>
        </div>

        {/* Staggered zig-zag pillar cards */}
        <div className="space-y-12 md:space-y-0 md:grid md:grid-cols-3 md:gap-8 lg:gap-12">
          {pillars.map((pillar, i) => (
            <div
              key={i}
              className={`pillar-reveal group relative bg-[#F9F8F5] p-8 md:p-10 rounded-3xl border border-primary/5 overflow-hidden transition-all duration-500 hover:-translate-y-1 ${
                i === 1 ? 'md:mt-12' : i === 2 ? 'md:mt-6' : ''
              }`}
              style={{
                boxShadow: '0 10px 40px -10px rgba(17, 145, 177, 0.06)',
              }}
            >
              {/* Background glow on hover */}
              <div
                className={`absolute -top-10 -right-10 w-40 h-40 ${pillar.bgGlow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                aria-hidden="true"
              />

              <div className={`relative z-10 w-16 h-16 ${pillar.accent} rounded-2xl flex items-center justify-center mb-6`}>
                {pillar.icon}
              </div>
              <h3 className="relative z-10 font-outfit font-bold text-2xl text-primary mb-4">
                {pillar.title}
              </h3>
              <p className="relative z-10 text-foreground/70 font-sans text-base leading-relaxed font-light max-w-[50ch]">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Wave transition into teal quote */}
      <div className="w-full mt-20 leading-[0] pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-auto block">
          <path
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            className="fill-primary"
          />
        </svg>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  TEAL QUOTE — Full-width emotional mid-page beat                    */
/* ------------------------------------------------------------------ */
const TealQuote = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.quote-reveal',
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
    <section
      ref={containerRef}
      className="relative py-24 md:py-32 overflow-hidden bg-primary"
    >
      {/* Botanical vine decoration */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 opacity-10 pointer-events-none" aria-hidden="true">
        <svg height="400" viewBox="0 0 300 400" width="300">
          <path d="M50 100 C150 100 150 300 250 300" fill="none" stroke="white" strokeWidth="2" />
          <circle cx="50" cy="100" fill="white" r="10" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-12 text-center relative z-10">
        {/* Decorative quote mark */}
        <span
          className="quote-reveal block text-7xl md:text-8xl leading-none text-white/20 font-drama select-none mb-6"
          aria-hidden="true"
        >
          &ldquo;
        </span>

        <blockquote className="quote-reveal font-drama italic text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-10">
          We are only as strong as we are tender. The bravest thing you'll ever do is stay soft in a world that keeps telling you to toughen up.
        </blockquote>

        <cite className="quote-reveal not-italic text-base sm:text-lg text-white/70 font-medium tracking-wide uppercase block">
          — Healing Hearts
        </cite>

        {/* Dots */}
        <div className="quote-reveal mt-12 flex justify-center gap-3" aria-hidden="true">
          <div className="w-3 h-3 rounded-full bg-white/60" />
          <div className="w-3 h-3 rounded-full bg-white/25" />
          <div className="w-3 h-3 rounded-full bg-white/25" />
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  PROGRAMS TEASER — "Where Do We Start?"                             */
/*  Organic program cards with warm photography feel.                   */
/* ------------------------------------------------------------------ */
const ProgramsTeaser = () => {
  const containerRef = useRef(null);
  const plans = [
    {
      name: 'The Conflict Rescue Kit',
      desc: 'Stop the bleeding. Learn to fight without destroying.',
      features: ['SPARK Method training', 'Critter Brain framework', 'Zones of Resilience assessment'],
      cta: 'Get the Rescue Kit',
      popular: false,
      href: '/rescue-kit',
    },
    {
      name: 'Healing Hearts Journey',
      desc: 'Our complete 8-module premium program.',
      features: ['All 8 Transformation Modules', 'Subconscious Healing Guides', 'Nervous System Regulation', '1-on-1 Coaching Option'],
      cta: 'Explore the Journey',
      popular: true,
      href: '/journey',
    },
  ];

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.programs-reveal',
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
    <section ref={containerRef} className="w-full bg-[#F9F8F5] py-[clamp(4rem,8vw,6rem)] relative z-10">
      {/* Wave transition from teal */}
      <div className="absolute top-0 left-0 w-full leading-[0] pointer-events-none -translate-y-[99%]" aria-hidden="true">
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-auto block rotate-180">
          <path
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            className="fill-[#F9F8F5]"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="programs-reveal text-center mb-16">
          <h2 className="font-drama italic text-4xl md:text-5xl text-primary mb-6">Where Do We Start?</h2>
          <p className="font-sans text-foreground/70 text-lg max-w-2xl mx-auto font-light mb-8">
            Every couple enters at a different place. We meet you where you are.
          </p>
          <Link
            to="/programs"
            className="text-accent hover:text-primary font-medium tracking-wide underline underline-offset-4 transition-colors"
          >
            View All Programs
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`programs-reveal relative rounded-3xl p-10 flex flex-col h-full transition-all duration-500 hover:-translate-y-2 ${
                plan.popular
                  ? 'bg-primary text-white shadow-2xl scale-100 lg:scale-105 z-10 py-12 lg:py-16'
                  : 'bg-white text-foreground shadow-sm border border-primary/5'
              }`}
              style={{
                boxShadow: plan.popular
                  ? '0 20px 60px -15px rgba(17, 145, 177, 0.3)'
                  : '0 4px 20px -4px rgba(17, 145, 177, 0.08)',
              }}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-white px-5 py-1.5 rounded-full text-xs font-outfit uppercase tracking-wider font-semibold shadow-md">
                  Most Transformative
                </div>
              )}

              <h3 className={`font-outfit font-bold text-2xl md:text-3xl mb-4 ${plan.popular ? 'text-white' : 'text-primary'}`}>
                {plan.name}
              </h3>
              <p className={`font-sans text-sm mb-8 font-light leading-relaxed ${plan.popular ? 'text-white/80' : 'text-foreground/70'}`}>
                {plan.desc}
              </p>

              <ul className="flex-grow space-y-5 mb-10">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-accent' : 'text-primary/40'}`} />
                    <span className={`text-sm font-sans font-light ${plan.popular ? 'text-white/90' : 'text-foreground/80'}`}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              <MagneticButton
                className={`w-full py-4 rounded-full text-sm font-medium transition-colors ${
                  plan.popular
                    ? 'bg-accent text-white'
                    : 'bg-primary/5 text-primary hover:bg-primary hover:text-white'
                }`}
                onClick={() => window.location.href = plan.href}
              >
                {plan.cta}
              </MagneticButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  CTA — "Take the first step" with organic warm feel                 */
/* ------------------------------------------------------------------ */
const FinalCta = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cta-reveal',
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
      {/* Subtle texture background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, rgba(17,145,177,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(185,106,95,0.06) 0%, transparent 50%)`,
        }}
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-6 sm:px-12 text-center relative z-10 bg-[#F9F8F5]/60 backdrop-blur-sm p-12 md:p-20 rounded-3xl" style={{ boxShadow: '0 10px 40px -10px rgba(17, 145, 177, 0.06)' }}>
        <h2 className="cta-reveal font-drama italic text-4xl md:text-5xl text-primary mb-8">
          Take the first step.
        </h2>
        <p className="cta-reveal text-lg md:text-xl text-foreground/70 font-light mb-12 leading-relaxed max-w-[55ch] mx-auto">
          Your healing doesn't have to be loud. It begins with a quiet choice to try again. We are here to hold the space for you.
        </p>
        <div className="cta-reveal">
          <Link to="/spark-challenge">
            <MagneticButton className="bg-accent text-white px-8 sm:px-12 py-4 sm:py-5 rounded-full text-base sm:text-lg w-full sm:w-auto font-medium shadow-lg hover:shadow-xl transition-shadow">
              Start Your Healing Journey
            </MagneticButton>
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  PAGE EXPORT                                                        */
/* ------------------------------------------------------------------ */
export default function Home() {
  usePageMeta('Couples Coaching & Relationship Tools', 'Healing Hearts helps couples move from disconnection to deep, lasting connection through science-backed coaching, the SPARK Method, and practical relationship tools.');
  return (
    <>
      <Hero />
      <Philosophy />
      <Pillars />
      <TealQuote />
      <ProgramsTeaser />
      <FinalCta />
    </>
  );
}
