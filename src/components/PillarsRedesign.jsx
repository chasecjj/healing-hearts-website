import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PillarsRedesign = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header cascade
      gsap.fromTo(
        '.pillar-heading',
        { y: 50, opacity: 0, filter: 'blur(8px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );

      // Cards stagger in from different origins
      const cards = gsap.utils.toArray('.pillar-card');
      cards.forEach((card, i) => {
        const xStart = i === 0 ? -80 : i === 1 ? 80 : 0;
        gsap.fromTo(
          card,
          { y: 100, x: xStart, opacity: 0, scale: 0.92, filter: 'blur(6px)' },
          {
            y: 0,
            x: 0,
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 1.4,
            delay: i * 0.2,
            ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
          }
        );
      });

      // Decorative line draws in
      gsap.fromTo(
        '.pillar-accent-line',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.8,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-32 md:py-44 bg-[#F9F8F5] relative overflow-hidden">
      {/* Subtle background texture — large radial glow */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/[0.03] rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header — left-aligned with decorative accent */}
        <div className="mb-24 md:mb-32 max-w-3xl">
          <span className="pillar-heading inline-block font-sans text-[11px] font-semibold tracking-[0.25em] uppercase text-accent mb-6">
            What Makes Us Different
          </span>
          <h2 className="pillar-heading font-drama italic text-4xl md:text-6xl lg:text-7xl text-primary leading-[1.1] mb-8">
            We don't teach you <br className="hidden md:block" />
            better words to say.
          </h2>
          <p className="pillar-heading font-sans text-foreground/50 text-lg md:text-xl font-light leading-relaxed max-w-[55ch]">
            We go beneath the arguments. Past the surface. Into the nervous system,
            the attachment wounds, and the invisible scripts your childhood wrote.
          </p>
          <div className="pillar-accent-line origin-left mt-10 h-[2px] w-32 bg-gradient-to-r from-accent to-accent/0" />
        </div>

        {/* Staggered pillar layout — editorial zig-zag */}
        <div className="flex flex-col gap-8 md:gap-0">

          {/* Pillar 1 — Full width, split layout */}
          <div className="pillar-card group md:flex md:items-stretch rounded-[2.5rem] bg-white overflow-hidden
            shadow-[0_4px_40px_-12px_rgba(0,0,0,0.06)]
            hover:shadow-[0_12px_60px_-12px_rgba(17,145,177,0.12)]
            transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
            hover:-translate-y-1">
            <div className="md:w-2/5 bg-primary/[0.04] p-10 md:p-14 flex flex-col justify-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 text-primary
                group-hover:scale-110 group-hover:bg-primary/15
                transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="font-outfit font-bold text-2xl md:text-3xl text-primary tracking-tight">
                Science That <br />Makes Sense
              </h3>
            </div>
            <div className="md:w-3/5 p-10 md:p-14 flex items-center">
              <p className="font-sans text-foreground/55 text-base md:text-lg leading-relaxed font-light">
                Grounded in polyvagal theory, attachment science, and the latest neuroscience
                research—translated into language that actually sticks. No jargon walls.
                No textbook lectures. Just the science of why you shut down, explained so
                it clicks the first time you hear it.
              </p>
            </div>
          </div>

          {/* Pillar 2 — Offset right, reversed layout */}
          <div className="pillar-card group md:flex md:items-stretch md:flex-row-reverse rounded-[2.5rem] bg-white overflow-hidden
            md:w-[85%] md:ml-auto md:-mt-6
            shadow-[0_4px_40px_-12px_rgba(0,0,0,0.06)]
            hover:shadow-[0_12px_60px_-12px_rgba(185,106,95,0.12)]
            transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
            hover:-translate-y-1">
            <div className="md:w-2/5 bg-accent/[0.05] p-10 md:p-14 flex flex-col justify-center">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-8 text-accent
                group-hover:scale-110 group-hover:bg-accent/15
                transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-outfit font-bold text-2xl md:text-3xl text-primary tracking-tight">
                Faith <br />Woven In
              </h3>
            </div>
            <div className="md:w-3/5 p-10 md:p-14 flex items-center">
              <p className="font-sans text-foreground/55 text-base md:text-lg leading-relaxed font-light">
                We believe marriages are sacred. Our faith shapes how we see covenant
                and forgiveness—but we never weaponize scripture or reduce your pain
                to a devotional. This is where clinical depth meets spiritual grounding,
                without the guilt.
              </p>
            </div>
          </div>

          {/* Pillar 3 — Offset left, visual anchor */}
          <div className="pillar-card group md:flex md:items-stretch rounded-[2.5rem] bg-white overflow-hidden
            md:w-[85%] md:-mt-6
            shadow-[0_4px_40px_-12px_rgba(0,0,0,0.06)]
            hover:shadow-[0_12px_60px_-12px_rgba(17,145,177,0.12)]
            transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
            hover:-translate-y-1">
            <div className="md:w-2/5 bg-primary/[0.04] p-10 md:p-14 flex flex-col justify-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 text-primary
                group-hover:scale-110 group-hover:bg-primary/15
                transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-outfit font-bold text-2xl md:text-3xl text-primary tracking-tight">
                Built by <br />a Couple
              </h3>
            </div>
            <div className="md:w-3/5 p-10 md:p-14 flex items-center">
              <p className="font-sans text-foreground/55 text-base md:text-lg leading-relaxed font-light">
                Jeff and Trisha learned this in the trenches of their own marriage.
                Every framework in this program has been tested in real life first—not
                borrowed from a textbook. They teach what they've lived.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PillarsRedesign;
