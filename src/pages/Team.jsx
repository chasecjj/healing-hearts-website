import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '../components/Layout';
import { OrganicDivider } from '@scoria/ui';
import { Heart, Wrench, Handshake, ArrowRight, ChevronDown, Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ */
/*  HERO — editorial, layered, with floating client voices              */
/* ------------------------------------------------------------------ */
const Hero = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.team-reveal', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power3.out' });
      // Floating quotes drift upward slowly
      gsap.to('.float-quote', { y: -40, duration: 20, ease: 'none', repeat: -1, yoyo: true });
      // Scroll indicator bounce
      gsap.to('.scroll-hint', { y: 8, duration: 1.4, ease: 'power1.inOut', repeat: -1, yoyo: true });
      // Parallax the background quotes on scroll
      gsap.to('.parallax-quotes', {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: { trigger: containerRef.current, start: 'top top', end: 'bottom top', scrub: 0.4 },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[85vh] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Warm gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 30%, rgba(17,145,177,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(185,106,95,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(17,145,177,0.04) 0%, transparent 40%), linear-gradient(180deg, #fbf3e4 0%, #faf9f6 60%, #ffffff 100%)',
        }}
        aria-hidden="true"
      />

      {/* Floating client quotes — decorative background texture */}
      <div className="parallax-quotes absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="float-quote absolute top-[15%] left-[5%] md:left-[10%] max-w-[220px] text-primary/[0.07] font-drama italic text-2xl md:text-3xl leading-snug select-none">
          "We've had great connections, great conversations..."
        </div>
        <div className="float-quote absolute top-[25%] right-[5%] md:right-[8%] max-w-[240px] text-accent/[0.08] font-drama italic text-xl md:text-2xl leading-snug select-none" style={{ animationDelay: '3s' }}>
          "She felt safe enough to explore those feelings..."
        </div>
        <div className="float-quote absolute bottom-[20%] left-[8%] md:left-[15%] max-w-[200px] text-primary/[0.06] font-drama italic text-xl leading-snug select-none" style={{ animationDelay: '6s' }}>
          "It just feels more hopeful..."
        </div>
        <div className="float-quote absolute bottom-[30%] right-[10%] md:right-[12%] max-w-[220px] text-accent/[0.07] font-drama italic text-2xl leading-snug select-none" style={{ animationDelay: '9s' }}>
          "We were together, we were feeling connected..."
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
        <p className="team-reveal text-primary font-medium tracking-widest uppercase text-sm mb-4">
          Meet the Team
        </p>
        <h1 className="team-reveal font-drama italic text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.1] mb-6">
          A Family on a Mission
        </h1>
        <p className="team-reveal text-lg md:text-xl text-foreground/70 max-w-xl mx-auto leading-relaxed mb-4">
          Healing Hearts isn't a corporation — it's a family who believes every couple
          deserves the tools to find their way back to each other.
        </p>

        {/* Social proof stats */}
        <div className="team-reveal flex items-center justify-center gap-6 md:gap-10 mt-8 mb-12">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-drama italic text-primary">20+</p>
            <p className="text-xs md:text-sm text-foreground/50 uppercase tracking-wider">Years Coaching</p>
          </div>
          <div className="w-px h-10 bg-primary/15" />
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-drama italic text-primary">8</p>
            <p className="text-xs md:text-sm text-foreground/50 uppercase tracking-wider">Course Modules</p>
          </div>
          <div className="w-px h-10 bg-primary/15" />
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-drama italic text-primary">90 min</p>
            <p className="text-xs md:text-sm text-foreground/50 uppercase tracking-wider">Weekly Coaching</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-hint absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-primary/40">
        <span className="text-xs uppercase tracking-widest font-medium">Scroll</span>
        <ChevronDown className="w-5 h-5" />
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  QUOTE BREAK — standalone quote between sections                     */
/* ------------------------------------------------------------------ */
const QuoteBreak = ({ text, attribution }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current, { y: 20, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 85%', toggleActions: 'play none none none' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="py-12 md:py-16 px-6">
      <div className="max-w-3xl mx-auto text-center relative">
        <Quote className="w-8 h-8 text-primary/15 mx-auto mb-4 rotate-180" />
        <p className="font-drama italic text-2xl md:text-3xl text-foreground/70 leading-relaxed mb-3">
          {text}
        </p>
        <p className="text-sm text-foreground/40 uppercase tracking-wider">{attribution}</p>
      </div>
    </div>
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
          yPercent: 6, ease: 'none',
          scrollTrigger: { trigger: frameRef.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        });
      }
      gsap.fromTo(frameRef.current, { scale: 0.92, opacity: 0, y: 30 }, {
        scale: 1, opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: frameRef.current, start: 'top 85%', toggleActions: 'play none none none' },
      });
    }, frameRef);
    return () => ctx.revert();
  }, [hasPhoto]);

  const gradients = {
    primary: 'linear-gradient(135deg, rgba(17,145,177,0.2) 0%, rgba(17,145,177,0.08) 50%, rgba(185,106,95,0.1) 100%)',
    accent: 'linear-gradient(135deg, rgba(185,106,95,0.18) 0%, rgba(185,106,95,0.06) 50%, rgba(17,145,177,0.1) 100%)',
  };

  return (
    <div ref={frameRef} className="relative w-56 md:w-64 lg:w-72 flex-shrink-0">
      <div className="absolute inset-0 rounded-3xl" style={{ background: gradients[accentColor], transform: 'translate(12px, 14px) rotate(2.5deg)' }} aria-hidden="true" />
      <div className="absolute inset-0 rounded-3xl" style={{ background: gradients[accentColor], opacity: 0.4, transform: 'translate(22px, 24px) rotate(4deg)' }} aria-hidden="true" />
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl" style={{ boxShadow: '0 16px 40px -8px rgba(7, 58, 71, 0.18)' }}>
        {hasPhoto ? (
          <img ref={imgRef} src={src} alt={alt} className="w-full h-[112%] object-cover -translate-y-[3%]" style={{ objectPosition }} loading="lazy" />
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
    <div className="absolute inset-0" style={{
      background: 'linear-gradient(90deg, transparent 0%, rgba(17,145,177,0.5) 15%, rgba(185,106,95,0.4) 35%, rgba(17,145,177,0.3) 55%, rgba(185,106,95,0.2) 75%, transparent 100%)',
      backgroundSize: '200% 100%', animation: 'shimmer 6s ease-in-out infinite alternate',
    }} />
    <style>{`@keyframes shimmer { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }`}</style>
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
      gsap.fromTo(`.member-text-${id}`, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: contentRef.current, start: 'top 75%', toggleActions: 'play none none none' },
      });
    }, contentRef);
    return () => ctx.revert();
  }, [id]);

  const sectionBgs = {
    primary: 'radial-gradient(ellipse at 25% 50%, rgba(17,145,177,0.06) 0%, transparent 60%), radial-gradient(ellipse at 75% 50%, rgba(185,106,95,0.04) 0%, transparent 60%), linear-gradient(180deg, #faf9f6 0%, #ffffff 50%, #faf9f6 100%)',
    accent: 'radial-gradient(ellipse at 75% 50%, rgba(185,106,95,0.06) 0%, transparent 60%), radial-gradient(ellipse at 25% 50%, rgba(17,145,177,0.04) 0%, transparent 60%), linear-gradient(180deg, #ffffff 0%, #faf9f6 50%, #ffffff 100%)',
  };

  return (
    <section id={id} ref={contentRef} className="relative py-16 md:py-24 overflow-hidden" style={{ background: sectionBgs[accentColor] }}>
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-neutral-200/60 overflow-hidden transition-shadow duration-500 hover:shadow-xl" style={{ boxShadow: '0 8px 32px -8px rgba(7, 58, 71, 0.08), 0 2px 8px -2px rgba(0,0,0,0.03)' }}>
          <ShimmerBar />
          <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 md:gap-16 p-8 md:p-12 lg:p-16`}>
            <TeamPhoto src={photo} alt={name} id={id} objectPosition={photoPosition} icon={Icon} accentColor={accentColor} />
            <div className="flex-1 text-center md:text-left">
              <div className={`member-text-${id} inline-flex items-center gap-2 text-primary font-medium text-sm tracking-wider uppercase mb-3`}>
                <Icon className="w-4 h-4" />{title}
              </div>
              <h2 className={`member-text-${id} font-drama italic text-4xl md:text-5xl text-foreground mb-6`}>{name}</h2>
              <p className={`member-text-${id} text-foreground/70 text-lg leading-relaxed mb-6`}>{bio}</p>
              {highlight && (
                <div className={`member-text-${id} bg-[#f4f9fa] border-l-4 border-primary rounded-r-xl px-6 py-4 mb-8`}>
                  <p className="text-foreground/80 italic text-base leading-relaxed">{highlight}</p>
                </div>
              )}
              {cta && (
                <Link to={ctaLink || '/spark-challenge'} className={`member-text-${id} inline-block`}>
                  <MagneticButton className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors">
                    {cta}<ArrowRight className="w-4 h-4" />
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
      gsap.fromTo('.cta-reveal', { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden" style={{
      backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(17,145,177,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(185,106,95,0.06) 0%, transparent 50%)',
    }}>
      <div className="max-w-4xl mx-auto px-6 sm:px-12 text-center relative z-10 bg-[#F9F8F5]/60 backdrop-blur-sm p-12 md:p-20 rounded-3xl" style={{ boxShadow: '0 10px 40px -10px rgba(17, 145, 177, 0.06)' }}>
        <p className="cta-reveal text-primary font-medium tracking-widest uppercase text-sm mb-4">Ready to Start?</p>
        <h2 className="cta-reveal font-drama italic text-4xl md:text-5xl text-foreground mb-6">Try the Free 7-Day Challenge</h2>
        <p className="cta-reveal text-foreground/70 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Seven days. One exercise per day. A real taste of what Healing Hearts can do for your relationship — completely free.
        </p>
        <Link to="/spark-challenge" className="cta-reveal inline-block">
          <MagneticButton className="bg-primary text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
            Start the Challenge<ArrowRight className="w-5 h-5" />
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

    <QuoteBreak
      text="She felt safe enough to explore some of those feelings and her fears. I think those are signs that we're allowing each other to come closer."
      attribution="Coaching session participant"
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
      highlight={`"We were working on our module together. That space was a time for both of us. We were together, we were feeling connected."\n— Coaching session participant`}
      cta="Explore Our Programs"
      ctaLink="/programs"
      reverse={true}
    />

    <QuoteBreak
      text="He was able to comfort me in ways he never has. He's made me laugh in ways he never has."
      attribution="Coaching session participant"
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
