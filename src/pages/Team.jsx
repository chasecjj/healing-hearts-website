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
/*  ARCHWAY PHOTO with gradient mat backdrop                            */
/* ------------------------------------------------------------------ */
const ArchwayPhoto = ({ src, alt, id, objectPosition = 'top', icon: Icon }) => {
  const frameRef = useRef(null);
  const imgRef = useRef(null);
  const hasPhoto = !!src;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      if (hasPhoto && imgRef.current) {
        gsap.to(imgRef.current, {
          yPercent: 8,
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

  const archRadius = '50% 50% 0.75rem 0.75rem';

  return (
    <div ref={frameRef} className="relative w-64 md:w-72 lg:w-80 flex-shrink-0">
      {/* Gradient mat — peeks out behind the photo as a decorative frame */}
      <div
        className="absolute -inset-2 md:-inset-3"
        style={{
          borderRadius: archRadius,
          background: 'linear-gradient(135deg, rgba(17,145,177,0.15) 0%, rgba(185,106,95,0.12) 50%, rgba(17,145,177,0.08) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Archway frame */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden"
        style={{
          borderRadius: archRadius,
          boxShadow: '0 20px 50px -12px rgba(7, 58, 71, 0.2)',
        }}
      >
        {hasPhoto ? (
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            className="w-full h-[115%] object-cover -translate-y-[5%]"
            style={{ objectPosition }}
            loading="lazy"
          />
        ) : (
          /* Placeholder — gradient with icon */
          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-[#fbf3e4] to-accent/10 flex items-center justify-center">
            {Icon && <Icon className="w-16 h-16 text-primary/25" />}
          </div>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  SHIMMER BAR — animated gradient accent                              */
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
const TeamMember = ({ id, name, title, icon: Icon, photo, photoPosition = 'top', bio, highlight, cta, ctaLink, reverse, glowColor = 'primary' }) => {
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

  const glowMap = {
    primary: 'bg-primary/8',
    accent: 'bg-accent/8',
  };

  return (
    <section
      id={id}
      ref={contentRef}
      className="relative py-16 md:py-24 overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(251,243,228,0.5) 0%, rgba(255,255,255,0.9) 70%, #ffffff 100%)',
      }}
    >
      {/* Background depth orbs */}
      <div
        className={`absolute ${reverse ? '-left-32 top-20' : '-right-32 top-20'} w-[400px] h-[400px] ${glowMap[glowColor]} rounded-full blur-[100px] pointer-events-none`}
        aria-hidden="true"
      />
      <div
        className={`absolute ${reverse ? '-right-20 bottom-10' : '-left-20 bottom-10'} w-[250px] h-[250px] ${glowColor === 'primary' ? 'bg-accent/5' : 'bg-primary/5'} rounded-full blur-[80px] pointer-events-none`}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6">
        <div
          className="bg-[#F9F8F5]/70 backdrop-blur-sm rounded-3xl border border-primary/8 overflow-hidden transition-shadow duration-500 hover:shadow-xl"
          style={{
            boxShadow: '0 10px 40px -10px rgba(17, 145, 177, 0.08), 0 4px 16px -4px rgba(0,0,0,0.04)',
          }}
        >
          {/* Animated shimmer accent bar */}
          <ShimmerBar />

          <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 md:gap-16 p-8 md:p-12 lg:p-16`}>
            {/* Photo with gradient mat */}
            <ArchwayPhoto
              src={photo}
              alt={name}
              id={id}
              objectPosition={photoPosition}
              icon={Icon}
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
                <div className={`member-text-${id} bg-white/60 border-l-4 border-primary rounded-r-xl px-6 py-4 mb-8 backdrop-blur-sm`}>
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
  <main className="bg-white">
    <Hero />
    <OrganicDivider variant="wave" />

    <TeamMember
      id="trisha"
      name="Trisha Jamison"
      title="Founder & Lead Coach"
      icon={Heart}
      photo="/images/team/trisha.jpg"
      photoPosition="top"
      glowColor="primary"
      bio="Trisha built Healing Hearts from two decades of coaching couples through their hardest moments. She's not a textbook educator — she's someone who's lived it, learned from it, and now helps others find their way back to connection. Her warmth and vulnerability are what make the program feel like a conversation, not a lecture."
      highlight="Every couple in the program gets weekly 90-minute coaching sessions with Trisha. She's in the room with you — helping you navigate the conversations that feel too scary to have alone. Because real change doesn't happen from watching videos. It happens when someone's there with you."
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
      glowColor="accent"
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
      glowColor="primary"
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
