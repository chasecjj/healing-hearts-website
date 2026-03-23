import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '../components/Layout';
import { OrganicDivider } from '@scoria/ui';
import { Heart, Wrench, Handshake, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ */
/*  HERO                                                                */
/* ------------------------------------------------------------------ */
const Hero = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.team-reveal',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full py-32 md:py-44 flex flex-col items-center justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 20% 30%, #fff8ef 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(17,145,177,0.06) 0%, transparent 40%), radial-gradient(circle at 50% 50%, #fbf3e4 0%, #ffffff 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
        <p className="team-reveal text-primary font-medium tracking-widest uppercase text-sm mb-4">
          Meet the Team
        </p>
        <h1 className="team-reveal font-drama italic text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.1] mb-6">
          A Family on a Mission
        </h1>
        <p className="team-reveal text-lg md:text-xl text-foreground/70 max-w-xl mx-auto leading-relaxed">
          Healing Hearts isn't a corporation — it's a family who believes every couple
          deserves the tools to find their way back to each other.
        </p>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  PHOTO with offset gradient shadow card                              */
/* ------------------------------------------------------------------ */
const TeamPhoto = ({ src, alt, id, objectPosition = 'top', icon: Icon, accentColor = 'primary' }) => {
  const frameRef = useRef(null);
  const imgRef = useRef(null);
  const hasPhoto = !!src;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      if (hasPhoto && imgRef.current) {
        gsap.to(imgRef.current, {
          yPercent: 6,
          ease: 'none',
          scrollTrigger: {
            trigger: frameRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        });
      }
      gsap.fromTo(
        frameRef.current,
        { scale: 0.92, opacity: 0, y: 30 },
        {
          scale: 1, opacity: 1, y: 0,
          duration: 1.2, ease: 'power3.out',
          scrollTrigger: {
            trigger: frameRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, frameRef);
    return () => ctx.revert();
  }, [hasPhoto]);

  const gradients = {
    primary: 'linear-gradient(135deg, rgba(17,145,177,0.2) 0%, rgba(17,145,177,0.08) 50%, rgba(185,106,95,0.1) 100%)',
    accent: 'linear-gradient(135deg, rgba(185,106,95,0.18) 0%, rgba(185,106,95,0.06) 50%, rgba(17,145,177,0.1) 100%)',
  };

  return (
    <div ref={frameRef} className="relative w-56 md:w-64 lg:w-72 flex-shrink-0">
      {/* Offset shadow card — shifted down-right, slightly rotated */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          background: gradients[accentColor],
          transform: 'translate(12px, 14px) rotate(2.5deg)',
        }}
        aria-hidden="true"
      />

      {/* Second offset for extra depth — more subtle, further offset */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          background: gradients[accentColor],
          opacity: 0.4,
          transform: 'translate(22px, 24px) rotate(4deg)',
        }}
        aria-hidden="true"
      />

      {/* Main photo frame */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl"
        style={{
          boxShadow: '0 16px 40px -8px rgba(7, 58, 71, 0.18)',
        }}
      >
        {hasPhoto ? (
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            className="w-full h-[112%] object-cover -translate-y-[3%]"
            style={{ objectPosition }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/8 via-[#fbf3e4] to-accent/8 flex items-center justify-center">
            {Icon && <Icon className="w-14 h-14 text-primary/20" />}
          </div>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  SHIMMER BAR                                                         */
/* ------------------------------------------------------------------ */
const ShimmerBar = () => (
  <div className="relative h-1.5 w-full overflow-hidden rounded-t-3xl">
    <div
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(17,145,177,0.5) 15%, rgba(185,106,95,0.4) 35%, rgba(17,145,177,0.3) 55%, rgba(185,106,95,0.2) 75%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 6s ease-in-out infinite alternate',
      }}
    />
    <style>{`
      @keyframes shimmer {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }
    `}</style>
  </div>
);

/* ------------------------------------------------------------------ */
/*  TEAM MEMBER CARD                                                    */
/* ------------------------------------------------------------------ */
const TeamMember = ({ id, name, title, icon: Icon, photo, photoPosition = 'top', bio, highlight, cta, ctaLink, reverse, accentColor = 'primary' }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.member-text-${id}`,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, contentRef);
    return () => ctx.revert();
  }, [id]);

  // Alternating section backgrounds
  const sectionBgs = {
    primary: 'radial-gradient(ellipse at 25% 50%, rgba(17,145,177,0.06) 0%, transparent 60%), radial-gradient(ellipse at 75% 50%, rgba(185,106,95,0.04) 0%, transparent 60%), linear-gradient(180deg, #faf9f6 0%, #ffffff 50%, #faf9f6 100%)',
    accent: 'radial-gradient(ellipse at 75% 50%, rgba(185,106,95,0.06) 0%, transparent 60%), radial-gradient(ellipse at 25% 50%, rgba(17,145,177,0.04) 0%, transparent 60%), linear-gradient(180deg, #ffffff 0%, #faf9f6 50%, #ffffff 100%)',
  };

  return (
    <section
      id={id}
      ref={contentRef}
      className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: sectionBgs[accentColor] }}
    >
      {/* Card */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6">
        <div
          className="bg-white/70 backdrop-blur-sm rounded-3xl border border-neutral-200/60 overflow-hidden transition-shadow duration-500 hover:shadow-xl"
          style={{
            boxShadow: '0 8px 32px -8px rgba(7, 58, 71, 0.08), 0 2px 8px -2px rgba(0,0,0,0.03)',
          }}
        >
          <ShimmerBar />

          <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 md:gap-16 p-8 md:p-12 lg:p-16`}>
            {/* Photo with offset cards */}
            <TeamPhoto
              src={photo}
              alt={name}
              id={id}
              objectPosition={photoPosition}
              icon={Icon}
              accentColor={accentColor}
            />

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <div className={`member-text-${id} inline-flex items-center gap-2 text-primary font-medium text-sm tracking-wider uppercase mb-3`}>
                <Icon className="w-4 h-4" />
                {title}
              </div>
              <h2 className={`member-text-${id} font-drama italic text-4xl md:text-5xl text-foreground mb-6`}>
                {name}
              </h2>
              <p className={`member-text-${id} text-foreground/70 text-lg leading-relaxed mb-6`}>
                {bio}
              </p>
              {highlight && (
                <div className={`member-text-${id} bg-[#f4f9fa] border-l-4 border-primary rounded-r-xl px-6 py-4 mb-8`}>
                  <p className="text-foreground/80 italic text-base leading-relaxed">
                    {highlight}
                  </p>
                </div>
              )}
              {cta && (
                <Link to={ctaLink || '/spark-challenge'} className={`member-text-${id} inline-block`}>
                  <MagneticButton className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors">
                    {cta}
                    <ArrowRight className="w-4 h-4" />
                  </MagneticButton>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  BOTTOM CTA                                                          */
/* ------------------------------------------------------------------ */
const BottomCTA = () => {
  const ref = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cta-reveal',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 80%' },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(17,145,177,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(185,106,95,0.06) 0%, transparent 50%)',
      }}
    >
      <div
        className="max-w-4xl mx-auto px-6 sm:px-12 text-center relative z-10 bg-[#F9F8F5]/60 backdrop-blur-sm p-12 md:p-20 rounded-3xl"
        style={{ boxShadow: '0 10px 40px -10px rgba(17, 145, 177, 0.06)' }}
      >
        <p className="cta-reveal text-primary font-medium tracking-widest uppercase text-sm mb-4">
          Ready to Start?
        </p>
        <h2 className="cta-reveal font-drama italic text-4xl md:text-5xl text-foreground mb-6">
          Try the Free 7-Day Challenge
        </h2>
        <p className="cta-reveal text-foreground/70 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Seven days. One exercise per day. A real taste of what Healing Hearts
          can do for your relationship — completely free.
        </p>
        <Link to="/spark-challenge" className="cta-reveal inline-block">
          <MagneticButton className="bg-primary text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
            Start the Challenge
            <ArrowRight className="w-5 h-5" />
          </MagneticButton>
        </Link>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  PAGE                                                                */
/* ------------------------------------------------------------------ */
const Team = () => (
  <main className="bg-[#faf9f6]">
    <Hero />
    <OrganicDivider variant="wave" />

    <TeamMember
      id="trisha"
      name="Trisha Jamison"
      title="Founder & Lead Coach"
      icon={Heart}
      photo="/images/team/trisha.jpg"
      photoPosition="top"
      accentColor="primary"
      bio="Trisha built Healing Hearts from two decades of coaching couples through their hardest moments. She's not a textbook educator — she's someone who's lived it, learned from it, and now helps others find their way back to connection. Every couple in the full program gets weekly 90-minute coaching sessions with Trisha over Zoom — she's right there with you, helping you navigate the conversations that feel too scary to have alone."
      highlight={`"Voicing these things that we like about each other — it feels really good and positive. It feels like we can keep going. It just feels more hopeful. I feel like it will be easier to bring compassion into these moments and maybe not get so heated."\n— Coaching session participant`}
      cta="Start the Free Challenge"
      ctaLink="/spark-challenge"
      reverse={false}
    />

    <TeamMember
      id="chase"
      name="Chase Jamison"
      title="Platform & Strategy"
      icon={Wrench}
      photo="/images/team/chase.jpg"
      photoPosition="top"
      accentColor="accent"
      bio="Chase designed and built the entire Healing Hearts platform — from the course portal to the coaching infrastructure. His goal is to make the technology invisible so couples can focus entirely on each other. He handles the business strategy, technical architecture, and makes sure every part of the system serves the mission."
      highlight={null}
      cta="Explore Our Programs"
      ctaLink="/programs"
      reverse={true}
    />

    <TeamMember
      id="makayla"
      name="Makayla Hildreth"
      title="Operations & Partnerships"
      icon={Handshake}
      photo={null}
      accentColor="primary"
      bio="Makayla is the engine behind Healing Hearts — she coordinates events, manages partnerships, and makes sure everything runs smoothly. Whether it's organizing an expo booth or connecting with wellness providers who share our mission, she's the first point of contact and the one who always follows through."
      highlight={null}
      cta="Partner With Us"
      ctaLink="/contact"
      reverse={false}
    />

    <OrganicDivider variant="gentle" />
    <BottomCTA />
  </main>
);

export default Team;
