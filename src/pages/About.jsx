import React, { useEffect, useRef } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '../components/Layout';
import { TeardropImage, OrganicDivider } from '@scoria/ui';
import { Activity, RefreshCw, Link2, Target } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Shared: reduced-motion check                                       */
/* ------------------------------------------------------------------ */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ */
/*  HERO — Organic Flow, centered sanctuary variant                    */
/*  Warm cream-to-white gradient, subtle organic radial washes,        */
/*  dual serif italic headings.                                        */
/* ------------------------------------------------------------------ */
const Hero = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.about-reveal',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full py-32 md:py-48 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Warm cream-to-white watercolor gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 30% 40%, #fff8ef 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(17,145,177,0.04) 0%, transparent 40%), radial-gradient(circle at 50% 50%, #fbf3e4 0%, #ffffff 100%)',
        }}
        aria-hidden="true"
      />

      {/* Subtle botanical vine decoration */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" aria-hidden="true">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path d="M10,10 Q20,40 10,70 T10,100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
          <path d="M90,10 Q80,40 90,70 T90,100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <p className="about-reveal font-sans text-primary/60 tracking-widest uppercase text-sm mb-6">About Us</p>
        <h1 className="about-reveal font-drama italic text-5xl md:text-7xl lg:text-8xl text-primary leading-tight mb-8">
          We're not experts who studied marriage.
        </h1>
        <h2 className="about-reveal font-outfit font-bold text-3xl md:text-5xl text-primary">
          We're a marriage that studied its way back.
        </h2>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  THE HONEST VERSION — TeardropImage + warm pull quote                */
/*  Cream background, editorial two-column layout.                     */
/* ------------------------------------------------------------------ */
const HonestVersion = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.honest-reveal',
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

      // Story paragraph fade-ins
      const storyParagraphs = gsap.utils.toArray('.story-p');
      storyParagraphs.forEach((el) => {
        gsap.fromTo(
          el,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="w-full py-[clamp(4rem,8vw,6rem)] bg-[#F9F8F5] overflow-hidden relative"
    >
      {/* Decorative blur */}
      <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] translate-x-1/2 pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="honest-reveal flex items-center gap-4 mb-16">
          <div className="h-px w-16 bg-accent" />
          <h3 className="font-outfit font-bold text-2xl tracking-wide text-primary uppercase">The Honest Version</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">
          {/* TeardropImage — Left */}
          <div className="honest-reveal order-last lg:order-first relative">
            <TeardropImage
              src="/images/team/jeff-and-trisha.jpg"
              alt="Jeff and Trisha Jamison, Healing Hearts founders"
              overlayClass="bg-primary/10"
              className="max-w-sm lg:max-w-md"
              imgStyle={{ objectPosition: 'center 25%' }}
            />
            {/* Floating label box */}
            <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-white p-6 rounded-[2rem] shadow-lg border border-primary/5 z-20 hidden md:block max-w-[250px]">
              <p className="font-outfit font-bold text-primary mb-1">Jeff & Trisha Jamison</p>
              <p className="font-sans text-xs text-foreground/60 font-light">Founders & Guides at Healing Hearts</p>
            </div>
          </div>

          {/* Text Side — Right */}
          <div className="relative z-10">
            {/* Pull quote — warm accent treatment inspired by TealQuoteBlock */}
            <div className="honest-reveal relative bg-primary/5 rounded-3xl p-8 mb-12 border border-primary/10">
              <span className="absolute -top-4 left-6 text-[4rem] text-primary/15 font-drama leading-none select-none" aria-hidden="true">&ldquo;</span>
              <blockquote>
                <p className="font-drama italic text-3xl md:text-4xl text-primary leading-[1.2] relative z-10">
                  We didn't set out to build a coaching program. We set out to save our own marriage.
                </p>
              </blockquote>
            </div>

            <div className="space-y-6">
              <p className="story-p font-sans text-foreground/80 text-lg leading-relaxed font-light">
                Jeff is a family physician who ran his own practice for nearly 30 years. Trisha is a coach with over two decades of experience. They've been married for more than 38 years. And for a long stretch of those years, they looked like any other successful couple on the outside — his clinic running, her work growing, the calendar full. But behind closed doors, they were two strangers sharing a house. The kind of quiet disconnection that doesn't shout but slowly suffocates.
              </p>
              <p className="story-p font-sans text-foreground/80 text-lg leading-relaxed font-light">
                Trisha felt invisible. Jeff felt criticized. His patients and staff got the best of him — and his family got whatever was left. Jeff's medical training had taught him to compartmentalize emotion. Useful in an exam room. Devastating in a marriage. Trisha's instinct for connection kept hitting a wall she couldn't name.
              </p>
              <p className="story-p font-sans text-foreground/80 text-lg leading-relaxed font-light">
                They didn't just survive it. They studied it. Jeff brought the clinical lens — polyvagal theory, nervous system regulation, the biology of why your body hijacks a conversation before your mind catches up. Trisha brought 20 years of coaching instinct and an ear for what people actually need to hear. Together, they built frameworks that worked — not in theory, but at 11pm on a Tuesday when the old patterns came roaring back.
              </p>
              <p className="story-p font-sans text-foreground/80 text-lg leading-relaxed font-medium text-primary/80 pt-4">
                Healing Hearts is what grew from the wreckage — and the rebuilding. The Seven Devils. The SPARK Method. The Zones of Resilience. Every framework in this program was tested in their own marriage first.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  WHAT WE BELIEVE — Editorial zig-zag layout                        */
/*  Each belief in its own row with alternating icon/text sides.       */
/*  Organic rounded cards with teal accents.                           */
/* ------------------------------------------------------------------ */
const beliefs = [
  {
    number: '01',
    icon: Activity,
    title: 'Your body holds the story your mind forgot.',
    description:
      'Most couples try to think their way out of relationship pain. But your nervous system is faster than your thoughts, and it learned its lessons long before you could reason with it. Real change starts when you learn to work with your biology, not against it.',
    accentClass: 'bg-primary/10 text-primary',
  },
  {
    number: '02',
    icon: Target,
    title: 'Every pattern made sense once.',
    description:
      "The way you shut down, lash out, people-please, or disappear—none of it is random. Every pattern was a brilliant survival strategy for a younger version of you. We don't shame your patterns. We honor what they protected. Then we gently help you outgrow them.",
    accentClass: 'bg-accent/10 text-accent',
  },
  {
    number: '03',
    icon: RefreshCw,
    title: 'Repair is more important than perfection.',
    description:
      "You're going to hurt each other. That's not the measure of your marriage. What matters is whether you can come back—whether rupture leads to deeper connection or just another wall. We teach repair as a skill, not a miracle.",
    accentClass: 'bg-primary/10 text-primary',
  },
  {
    number: '04',
    icon: Link2,
    title: 'Faith is the foundation, not the formula.',
    description:
      'Our work is Christ-centered, but it\'s never simplistic. We don\'t believe "just pray harder" is a relationship strategy. We believe God designed the nervous system, wrote attachment into our DNA, and invites us into the honest, sometimes messy work of becoming safe for the people we love.',
    accentClass: 'bg-accent/10 text-accent',
  },
];

const Beliefs = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.belief-heading',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 70%' },
        }
      );

      const rows = gsap.utils.toArray('.belief-row');
      rows.forEach((row) => {
        gsap.fromTo(
          row,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: row, start: 'top 80%' },
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full py-[clamp(4rem,8vw,6rem)] bg-white relative overflow-hidden">
      {/* Subtle radial decoration */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(17,145,177,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(185,106,95,0.06) 0%, transparent 50%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-6 sm:px-12">
        {/* Section heading */}
        <div className="belief-heading text-center mb-16 md:mb-20">
          <h2 className="font-drama italic text-4xl md:text-5xl text-primary mb-4">What We Believe</h2>
          <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full" />
        </div>

        {/* Editorial zig-zag: each belief in its own row */}
        <div className="space-y-12 md:space-y-16">
          {beliefs.map((belief, i) => {
            const Icon = belief.icon;
            const isEven = i % 2 === 0;

            return (
              <div
                key={i}
                className="belief-row"
              >
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-start">
                  {/* Icon + number side */}
                  <div className={`flex flex-row md:flex-col items-center gap-4 ${!isEven ? 'md:order-2' : 'md:order-1'}`}>
                    <div className={`w-16 h-16 ${belief.accentClass} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-primary/30 font-mono text-sm tracking-widest">{belief.number}</span>
                  </div>

                  {/* Text side — organic card */}
                  <div
                    className={`bg-[#F9F8F5] p-8 md:p-10 rounded-3xl border border-primary/5 transition-all duration-500 hover:-translate-y-1 ${!isEven ? 'md:order-1 md:text-right' : 'md:order-2'}`}
                    style={{
                      boxShadow: '0 10px 40px -10px rgba(17, 145, 177, 0.06)',
                    }}
                  >
                    <h3 className="font-drama italic text-3xl text-primary mb-4 leading-tight">{belief.title}</h3>
                    <p className={`font-sans text-foreground/70 font-light leading-relaxed max-w-[65ch] ${!isEven ? 'md:ml-auto' : ''}`}>
                      {belief.description}
                    </p>
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
/*  CLINICAL FRAMEWORKS — Softened cream with teal accent strip        */
/*  Jeff & Trisha backgrounds side by side.                            */
/* ------------------------------------------------------------------ */
const ClinicalFrameworks = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.clinical-reveal',
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
    <section
      ref={containerRef}
      className="w-full py-[clamp(4rem,8vw,6rem)] bg-[#F9F8F5] relative overflow-hidden"
    >
      {/* Subtle teal-tinted background wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(17,145,177,0.06) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-12">
        {/* Teal accent strip */}
        <div className="clinical-reveal w-24 h-1 bg-primary rounded-full mx-auto mb-8" />

        <h2 className="clinical-reveal font-outfit font-bold text-3xl md:text-4xl text-primary mb-8 text-center">
          A Physician and a Coach. A Marriage and a Mission.
        </h2>

        <p className="clinical-reveal font-sans text-foreground/80 text-lg leading-relaxed font-light mb-12 text-center max-w-[65ch] mx-auto">
          Their approach combines clinical science with coaching instinct. Informed by the research of Dr. John Gottman, Dr. Stephen Porges (polyvagal theory), Dr. Sue Johnson (Emotionally Focused Therapy), and Dr. Andrew Huberman — then tested in their own 38-year marriage before it ever reached a client.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          {/* Trisha's Background */}
          <div
            className="clinical-reveal bg-white p-8 md:p-10 rounded-3xl border border-primary/5 transition-all duration-500 hover:-translate-y-1"
            style={{ boxShadow: '0 10px 40px -10px rgba(17, 145, 177, 0.06)' }}
          >
            <div className="w-12 h-1 bg-accent rounded-full mb-6" />
            <h4 className="font-drama italic text-2xl text-primary mb-4">Trisha Jamison</h4>
            <p className="font-outfit font-bold text-xs text-foreground/40 uppercase tracking-widest mb-4">Founder &amp; Lead Coach &middot; Certified Relationship Coach</p>
            <p className="font-sans text-foreground/70 font-light text-base leading-relaxed mb-4">
              Trisha has spent over two decades coaching individuals and couples through their hardest moments — studying under teachers like Leah Davidson and Thais Gibson while building her own frameworks from 38 years of marriage to a busy physician. She knows what it looks like when your partner's career gets the best of them and your family gets whatever's left.
            </p>
            <p className="font-sans text-foreground/70 font-light text-base leading-relaxed">
              She created the SPARK Method, the Seven Devils framework, the Zones of Resilience, and every other tool in this program. Her teaching is warm, story-driven, and grounded in the research of Gottman, Porges, and Sue Johnson — translated into language that actually lands at 11pm when the old patterns come roaring back.
            </p>
          </div>

          {/* Jeff's Background */}
          <div
            className="clinical-reveal bg-white p-8 md:p-10 rounded-3xl border border-primary/5 transition-all duration-500 hover:-translate-y-1"
            style={{ boxShadow: '0 10px 40px -10px rgba(17, 145, 177, 0.06)' }}
          >
            <div className="w-12 h-1 bg-primary rounded-full mb-6" />
            <h4 className="font-drama italic text-2xl text-primary mb-4">Dr. Jeff Jamison</h4>
            <p className="font-outfit font-bold text-xs text-foreground/40 uppercase tracking-widest mb-4">DO, FAAFP &mdash; Board-Certified Family Physician</p>
            <p className="font-sans text-foreground/70 font-light text-base leading-relaxed mb-4">
              Jeff owned and operated his own primary care practice for nearly 30 years. He built his career on relationships with his patients — understanding not just what ails them, but the life around the ailment. He also helped place the very first cohort of medical students in family practice clinical rotations, building medical education from the ground up.
            </p>
            <p className="font-sans text-foreground/70 font-light text-base leading-relaxed mb-4">
              He brings the clinical lens to Healing Hearts — nervous system regulation, the biology of stress responses, and a firsthand understanding of how careers that demand everything leave nothing for the people at home. In his own words: "My patients and staff got the best of me, and sometimes, my family got the worst of me."
            </p>
            <p className="font-sans text-foreground/70 font-light text-base leading-relaxed">
              That honesty — the willingness to say the quiet part out loud — is what Jeff brings to every couple who walks through this program.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  CTA — "Work With Us" warm organic treatment                        */
/*  Matches Home page FinalCta: cream card, salmon button.             */
/* ------------------------------------------------------------------ */
const WorkWithUsCta = () => {
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
          backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(17,145,177,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(185,106,95,0.06) 0%, transparent 50%)',
        }}
        aria-hidden="true"
      />

      <div
        className="max-w-4xl mx-auto px-6 sm:px-12 text-center relative z-10 bg-[#F9F8F5]/60 backdrop-blur-sm p-12 md:p-20 rounded-3xl"
        style={{ boxShadow: '0 10px 40px -10px rgba(17, 145, 177, 0.06)' }}
      >
        <h2 className="cta-reveal font-drama italic text-4xl md:text-5xl text-primary mb-8">
          Take the first step.
        </h2>
        <p className="cta-reveal text-lg md:text-xl text-foreground/70 font-light mb-12 leading-relaxed max-w-[55ch] mx-auto">
          Your healing doesn't have to be loud. It begins with a quiet choice to try again. We are here to hold the space for you.
        </p>
        <div className="cta-reveal">
          <Link to="/contact">
            <MagneticButton className="bg-accent text-white px-8 sm:px-12 py-4 sm:py-5 rounded-full text-base sm:text-lg w-full sm:w-auto font-medium shadow-lg hover:shadow-xl transition-shadow">
              Work With Us
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
export default function About() {
  usePageMeta('Our Story', 'How Jeff and Trisha Jamison turned their own marriage crisis into a mission to help couples reconnect through science-backed coaching.');
  return (
    <>
      <Hero />
      <OrganicDivider variant="wave-1" fillClass="text-[#F9F8F5]" />
      <HonestVersion />
      <OrganicDivider variant="wave-2" fillClass="text-white" />
      <Beliefs />
      <OrganicDivider variant="wave-3" fillClass="text-[#F9F8F5]" />
      <ClinicalFrameworks />
      <OrganicDivider variant="wave-1" fillClass="text-white" />
      <WorkWithUsCta />
    </>
  );
}
