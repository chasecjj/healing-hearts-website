import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '../components/Layout';
import { TeardropImage, OrganicDivider } from '@scoria/ui';
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
            'radial-gradient(circle at 30% 40%, #fff8ef 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(17,145,177,0.04) 0%, transparent 40%), radial-gradient(circle at 50% 50%, #fbf3e4 0%, #ffffff 100%)',
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
/*  TEAM MEMBER CARD                                                    */
/* ------------------------------------------------------------------ */
const TeamMember = ({ id, name, title, icon: Icon, photo, bio, highlight, cta, ctaLink, reverse }) => {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`py-20 md:py-28 ${reverse ? 'bg-[#fbf3e4]/40' : 'bg-white'}`}
    >
      <div className={`max-w-6xl mx-auto px-6 flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-20`}>
        {/* Photo */}
        <div className="w-64 h-80 md:w-80 md:h-96 flex-shrink-0">
          {photo ? (
            <TeardropImage
              src={photo}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Icon className="w-16 h-16 text-primary/40" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-primary font-medium text-sm tracking-wider uppercase mb-3">
            <Icon className="w-4 h-4" />
            {title}
          </div>
          <h2 className="font-drama italic text-4xl md:text-5xl text-foreground mb-6">
            {name}
          </h2>
          <p className="text-foreground/70 text-lg leading-relaxed mb-6">
            {bio}
          </p>
          {highlight && (
            <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl px-6 py-4 mb-8">
              <p className="text-foreground/80 italic text-base leading-relaxed">
                {highlight}
              </p>
            </div>
          )}
          {cta && (
            <Link to={ctaLink || '/spark-challenge'}>
              <MagneticButton className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors">
                {cta}
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </Link>
          )}
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
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 80%',
          },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="py-24 md:py-32 bg-[#fbf3e4]/60">
      <div className="max-w-3xl mx-auto text-center px-6">
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
  <main>
    <Hero />
    <OrganicDivider variant="wave" />

    <TeamMember
      id="trisha"
      name="Trisha Jamison"
      title="Founder & Lead Coach"
      icon={Heart}
      photo={null /* Replace: /images/team/trisha.jpg */}
      bio="Trisha built Healing Hearts from two decades of coaching couples through their hardest moments. She's not a textbook educator — she's someone who's lived it, learned from it, and now helps others find their way back to connection. Her warmth and vulnerability are what make the program feel like a conversation, not a lecture."
      highlight="Every couple in the program gets weekly 90-minute coaching sessions with Trisha. She's in the room with you — helping you navigate the conversations that feel too scary to have alone. Because real change doesn't happen from watching videos. It happens when someone's there with you."
      cta="Start the Free Challenge"
      ctaLink="/spark-challenge"
      reverse={false}
    />

    <OrganicDivider variant="gentle" />

    <TeamMember
      id="chase"
      name="Chase Jamison"
      title="Platform & Strategy"
      icon={Wrench}
      photo="/images/team/chase.jpg"
      bio="Chase designed and built the entire Healing Hearts platform — from the course portal to the coaching infrastructure. His goal is to make the technology invisible so couples can focus entirely on each other. He handles the business strategy, technical architecture, and makes sure every part of the system serves the mission."
      highlight={null}
      cta="Explore Our Programs"
      ctaLink="/programs"
      reverse={true}
    />

    <OrganicDivider variant="wave" />

    <TeamMember
      id="makayla"
      name="Makayla Hildreth"
      title="Operations & Partnerships"
      icon={Handshake}
      photo={null /* Replace: /images/team/makayla.jpg */}
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
