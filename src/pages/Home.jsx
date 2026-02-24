import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '../components/Layout';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

// --- Hero Section ---
const Hero = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo('.hero-reveal', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, stagger: 0.2, ease: 'power3.out', delay: 0.1 });
      
      gsap.to('.hero-image', {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-[90dvh] flex flex-col justify-center overflow-hidden bg-background rounded-b-[3rem] mt-[-6rem] pt-[6rem]">
      <div className="absolute inset-0 w-full h-full hero-image" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1511265691771-defa26cce81e?q=80&w=2600&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center 30%', opacity: 0.4 }}></div>
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-background/40 via-background/60 to-background pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center gap-6 mt-8">
        <h1 className="flex flex-col text-primary">
          <span className="hero-reveal font-sans font-medium text-lg md:text-xl tracking-widest uppercase opacity-80 mb-6 text-primary">
            Healing Hearts
          </span>
          <span className="hero-reveal font-drama italic text-5xl md:text-7xl lg:text-[7rem] leading-[1] tracking-tight text-primary">
            Your marriage isn't broken.
          </span>
          <span className="hero-reveal font-outfit font-bold text-4xl md:text-6xl mt-4 text-primary">
            It's buried.
          </span>
        </h1>
        <p className="hero-reveal mt-6 font-sans text-foreground/80 text-lg md:text-xl max-w-2xl font-light leading-relaxed">
          Underneath everything you were never taught. We help you understand why you shut down, and how to come back to each other.
        </p>
        <div className="hero-reveal mt-10">
          <MagneticButton className="bg-accent text-background px-10 py-4 rounded-full text-base font-medium shadow-xl">
            Watch Our Free Masterclass
          </MagneticButton>
        </div>
      </div>
    </section>
  );
};

// --- Philosophy Teaser ---
const Philosophy = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo('.phil-reveal', 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1.2, 
          stagger: 0.2, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 70%',
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full py-32 bg-background relative z-10 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
        
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image Side */}
            <div className="phil-reveal relative flex justify-center lg:justify-end order-last lg:order-first">
                <div className="relative w-full max-w-md aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/10">
                    <div className="absolute inset-0 bg-primary/20 mix-blend-overlay z-10"></div>
                    <img 
                        src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1287&auto=format&fit=crop" 
                        alt="Couple connecting emotionally" 
                        className="w-full h-full object-cover"
                    />
                </div>
                {/* Accent shape */}
                <div className="absolute -bottom-8 -left-8 md:-left-12 bg-background p-6 rounded-[2rem] shadow-xl border border-primary/5 max-w-xs z-20">
                     <p className="font-drama italic text-xl text-primary leading-tight">
                         "Before you can communicate better, you have to feel safe."
                     </p>
                </div>
            </div>

            {/* Text Side */}
            <div className="text-left relative z-10 max-w-2xl">
                <h2 className="phil-reveal font-drama italic text-4xl md:text-5xl lg:text-7xl text-primary mb-8 leading-tight">
                You've tried everything. <br/> Nothing is sticking.
                </h2>
                <p className="phil-reveal font-sans text-foreground/80 text-lg leading-relaxed mb-6 font-light">
                You’ve read the books. Maybe you’ve sat in a therapist’s office and nodded along while the clock ran out. You’ve had the tearful conversations at midnight that felt like breakthroughs but changed nothing by Tuesday morning.
                </p>
                <p className="phil-reveal font-sans text-foreground/80 text-lg leading-relaxed mb-12 font-light">
                Here’s what nobody told you: most relationship advice treats symptoms. It teaches you better words to say during a fight. But it never touches the part of your brain that’s actually running the fight.
                </p>
                <div className="phil-reveal flex justify-start mt-8">
                <Link to="/about" className="group inline-flex items-center gap-3 text-accent hover:text-primary font-medium tracking-wide transition-colors">
                    <span className="border-b border-accent/30 group-hover:border-primary pb-1 transition-colors">Read Our Philosophy</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

// --- Pillars ---
const Pillars = () => {
  return (
    <section className="w-full py-20 bg-[#F7F6F2] relative overflow-hidden rounded-[4rem]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="font-outfit font-bold text-3xl md:text-4xl text-primary mb-4">A Different Kind of Help</h2>
          <p className="font-sans text-foreground/70 text-lg font-light">
            We go beneath the arguments. Past the surface. Into the nervous system, the attachment wounds, and the invisible scripts your childhood wrote.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="relative bg-background p-10 rounded-[2.5rem] shadow-sm border border-primary/5 hover:border-accent/20 transition-colors duration-500 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] group-hover:bg-primary/10 transition-colors duration-500"></div>
            <div className="relative z-10">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <h3 className="font-outfit font-bold text-xl text-primary mb-4">Science That Makes Sense</h3>
                <p className="text-foreground/70 font-sans text-sm leading-relaxed font-light">
                Grounded in polyvagal theory, attachment science, and the latest neuroscience research—translated into language that actually sticks.
                </p>
            </div>
          </div>

          <div className="relative bg-background p-10 rounded-[2.5rem] shadow-sm border border-primary/5 hover:border-accent/20 transition-colors duration-500 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[40px] group-hover:bg-accent/10 transition-colors duration-500"></div>
            <div className="relative z-10">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-6 text-accent">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </div>
                <h3 className="font-outfit font-bold text-xl text-primary mb-4">Faith Woven In</h3>
                <p className="text-foreground/70 font-sans text-sm leading-relaxed font-light">
                We believe marriages are sacred. Our faith shapes how we see covenant and forgiveness—but we never weaponize scripture.
                </p>
            </div>
          </div>

          <div className="relative bg-background p-10 rounded-[2.5rem] shadow-sm border border-primary/5 hover:border-accent/20 transition-colors duration-500 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] group-hover:bg-primary/10 transition-colors duration-500"></div>
            <div className="relative z-10">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h3 className="font-outfit font-bold text-xl text-primary mb-4">Built by a Couple</h3>
                <p className="text-foreground/70 font-sans text-sm leading-relaxed font-light">
                Jeff and Trisha learned this in the trenches of their own marriage. Every framework in this program has been tested in real life first.
                </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Programs Teaser ---
const ProgramsTeaser = () => {
  const plans = [
    {
      name: "The Conflict Rescue Kit",
      desc: "Stop the bleeding. Learn to fight without destroying.",
      features: ["SPARK Method training", "Critter Brain framework", "Zones of Resilience assessment"],
      cta: "Get the Rescue Kit",
      popular: false
    },
    {
      name: "Healing Hearts Journey",
      desc: "Our complete 8-module premium program.",
      features: ["All 8 Transformation Modules", "Subconscious Healing Guides", "Nervous System Regulation", "1-on-1 Coaching Option"],
      cta: "Apply for the Journey",
      popular: true
    }
  ];

  return (
    <section className="w-full bg-background py-32 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-drama italic text-4xl md:text-5xl text-primary mb-6">Where Do We Start?</h2>
          <p className="font-sans text-foreground/70 text-lg max-w-2xl mx-auto font-light mb-8">
            Every couple enters at a different place. We meet you where you are.
          </p>
          <Link to="/programs" className="text-accent hover:text-primary font-medium tracking-wide underline underline-offset-4 transition-colors">
            View All Programs
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto border-transparent">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`relative rounded-[2.5rem] p-10 flex flex-col h-full transition-transform duration-500 hover:-translate-y-2 \${
                plan.popular 
                  ? 'bg-primary text-background shadow-2xl scale-100 lg:scale-105 z-10 py-12 lg:py-16' 
                  : 'bg-[#F7F6F2] text-foreground shadow-sm border border-primary/5'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-background px-5 py-1.5 rounded-full text-xs font-outfit uppercase tracking-wider font-semibold shadow-md">
                  Most Transformative
                </div>
              )}
              
              <h3 className={`font-outfit font-bold text-2xl md:text-3xl mb-4 \${plan.popular ? 'text-background' : 'text-primary'}`}>{plan.name}</h3>
              <p className={`font-sans text-sm mb-8 font-light leading-relaxed \${plan.popular ? 'text-background/80' : 'text-foreground/70'}`}>
                {plan.desc}
              </p>
              
              <ul className="flex-grow space-y-5 mb-10">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 \${plan.popular ? 'text-accent' : 'text-primary/40'}`} />
                    <span className={`text-sm font-sans font-light \${plan.popular ? 'text-background/90' : 'text-foreground/80'}`}>{feat}</span>
                  </li>
                ))}
              </ul>
              
              <MagneticButton 
                className={`w-full py-4 rounded-full text-sm font-medium \${
                  plan.popular 
                    ? 'bg-accent text-background' 
                    : 'bg-primary/5 text-primary hover:bg-primary hover:text-background'
                }`}
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

export default function Home() {
  return (
    <>
      <Hero />
      <Philosophy />
      <Pillars />
      <ProgramsTeaser />
    </>
  );
}
