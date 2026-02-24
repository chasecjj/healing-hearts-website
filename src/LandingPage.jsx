import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Menu, X, PlayCircle, FileText, CheckCircle2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// --- 1. Magnetic Button ---
const MagneticButton = ({ children, className = '', onClick }) => {
  const buttonRef = useRef(null);
  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={`relative overflow-hidden group transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-[1.02] hover:-translate-y-[1px] \${className}`}
    >
      <span className="absolute inset-0 w-full h-full bg-foreground/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] z-0"></span>
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};

// --- 2. Navbar ---
const Navbar = ({ onLogin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out w-[95%] max-w-6xl rounded-full px-6 py-4 flex items-center justify-between \${
          isScrolled
            ? 'bg-background/90 backdrop-blur-md border border-primary/10 text-primary shadow-sm'
            : 'bg-transparent text-primary border border-transparent'
        }`}
      >
        <div className="font-outfit font-bold text-xl tracking-wide flex-shrink-0 text-primary">
          Healing Hearts.
        </div>
        <div className="hidden md:flex items-center gap-10 font-sans text-sm font-medium">
          <a href="#about" className="hover:text-accent transition-colors">About Us</a>
          <a href="#philosophy" className="hover:text-accent transition-colors">Philosophy</a>
          <a href="#programs" className="hover:text-accent transition-colors">Programs</a>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <button onClick={onLogin} className="text-sm font-sans font-medium text-primary hover:text-accent transition-colors">
            Member Login
          </button>
          <MagneticButton className="bg-primary text-background px-6 py-2.5 rounded-full text-sm font-semibold shadow-md">
            Start Healing
          </MagneticButton>
        </div>
        <button className="md:hidden block p-2 text-primary" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>
      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-background z-40 flex flex-col items-center justify-center gap-8 transition-transform duration-500 md:hidden \${mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-primary font-outfit text-2xl">About Us</a>
        <a href="#philosophy" onClick={() => setMobileMenuOpen(false)} className="text-primary font-outfit text-2xl">Philosophy</a>
        <a href="#programs" onClick={() => setMobileMenuOpen(false)} className="text-primary font-outfit text-2xl">Programs</a>
        <button onClick={() => { onLogin(); setMobileMenuOpen(false); }} className="text-primary font-outfit text-2xl">
          Member Login
        </button>
        <MagneticButton className="bg-primary text-background px-8 py-3 rounded-full text-lg mt-4" onClick={() => setMobileMenuOpen(false)}>
          Start Healing
        </MagneticButton>
      </div>
    </>
  );
};

// --- 3. Hero Section ---
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
    <section ref={containerRef} className="relative w-full h-[100dvh] flex flex-col justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 w-full h-full hero-image" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1511265691771-defa26cce81e?q=80&w=2600&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center 30%', opacity: 0.4 }}></div>
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-background/40 via-background/60 to-background pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center gap-6 mt-16">
        <h1 className="flex flex-col text-primary">
          <span className="hero-reveal font-sans font-medium text-lg md:text-xl tracking-widest uppercase opacity-80 mb-6">
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

// --- 4. The Problem / Philosophy Section ---
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
    <section ref={containerRef} id="philosophy" className="w-full py-32 bg-background relative z-10">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="phil-reveal font-drama italic text-4xl md:text-6xl text-primary mb-8 leading-tight">
          You've tried everything. <br/> Nothing is sticking.
        </h2>
        <p className="phil-reveal font-sans text-foreground/70 text-lg md:text-xl leading-relaxed mb-6 font-light">
          You’ve read the books. Maybe you’ve sat in a therapist’s office and nodded along while the clock ran out. You’ve had the tearful conversations at midnight that felt like breakthroughs but changed nothing by Tuesday morning.
        </p>
        <p className="phil-reveal font-sans text-foreground/70 text-lg md:text-xl leading-relaxed mb-16 font-light">
          Here’s what nobody told you: most relationship advice treats symptoms. It teaches you better words to say during a fight. But it never touches the part of your brain that’s actually running the fight.
        </p>
        <div className="phil-reveal h-px w-24 bg-accent/30 mx-auto"></div>
      </div>
    </section>
  );
};

const Pillars = () => {
  return (
    <section className="w-full py-20 bg-[#F7F6F2] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="font-outfit font-bold text-3xl md:text-4xl text-primary mb-4">A Different Kind of Help</h2>
          <p className="font-sans text-foreground/70 text-lg font-light">
            We go beneath the arguments. Past the surface. Into the nervous system, the attachment wounds, and the invisible scripts your childhood wrote.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-background p-10 rounded-[2.5rem] shadow-sm border border-primary/5 hover:border-accent/20 transition-colors duration-500">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <h3 className="font-outfit font-bold text-xl text-primary mb-4">Science That Makes Sense</h3>
            <p className="text-foreground/70 font-sans text-sm leading-relaxed font-light">
              Grounded in polyvagal theory, attachment science, and the latest neuroscience research—translated into language that actually sticks.
            </p>
          </div>

          <div className="bg-background p-10 rounded-[2.5rem] shadow-sm border border-primary/5 hover:border-accent/20 transition-colors duration-500">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-6 text-accent">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </div>
            <h3 className="font-outfit font-bold text-xl text-primary mb-4">Faith Woven In</h3>
            <p className="text-foreground/70 font-sans text-sm leading-relaxed font-light">
               We believe marriages are sacred. Our faith shapes how we see covenant and forgiveness—but we never weaponize scripture or reduce your pain to a devotional.
            </p>
          </div>

          <div className="bg-background p-10 rounded-[2.5rem] shadow-sm border border-primary/5 hover:border-accent/20 transition-colors duration-500">
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
    </section>
  );
};

// --- 5. Programs / Pricing Section ---
const Programs = () => {
  const plans = [
    {
      name: "The Conflict Rescue Kit",
      desc: "Stop the bleeding. Learn to fight without destroying.",
      features: ["SPARK Method training", "Critter Brain framework", "Zones of Resilience assessment", "The 90-Second Wave guide"],
      cta: "Get the Rescue Kit",
      popular: false
    },
    {
      name: "Healing Hearts Journey",
      desc: "Our complete 8-module premium program.",
      features: ["All 8 Transformation Modules", "Subconscious Healing Guides", "Nervous System Regulation", "Private Community Access", "1-on-1 Coaching Option"],
      cta: "Apply for the Journey",
      popular: true
    },
    {
      name: "Communication Mastery",
      desc: "Say what you mean, hear what they're saying.",
      features: ["Attachment style deep-dive", "Needs expression framework", "Active listening techniques", "SPARK repair process practice"],
      cta: "Get the Toolkit",
      popular: false
    }
  ];

  return (
    <section id="programs" className="w-full bg-background py-32 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="font-drama italic text-4xl md:text-5xl text-primary mb-6">Our Programs</h2>
          <p className="font-sans text-foreground/70 text-lg max-w-2xl mx-auto font-light">
            Every couple enters at a different place. We meet you where you are, whether you're in crisis or just feeling the slow drift.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-6xl mx-auto border-transparent">
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

// --- Footer ---
const Footer = () => {
  return (
    <footer className="w-full bg-primary text-background rounded-t-[3rem] pt-20 pb-8 px-6 relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-12 text-center md:text-left">
          <div className="md:w-1/2 max-w-md mx-auto md:mx-0">
            <h2 className="font-outfit font-bold text-3xl mb-4 text-background">
              Healing Hearts.
            </h2>
            <p className="font-drama italic text-2xl text-background/80 mb-6 leading-snug">
              Every marriage has a story worth fighting for.
            </p>
          </div>
          
          <div className="md:w-1/2 flex flex-wrap gap-12 justify-center md:justify-end">
            <div className="flex flex-col gap-3">
              <h4 className="font-outfit font-bold text-sm text-background/50 mb-2">Explore</h4>
              <a href="#" className="font-sans font-light text-sm text-background/80 hover:text-accent transition-colors">Programs</a>
              <a href="#" className="font-sans font-light text-sm text-background/80 hover:text-accent transition-colors">About</a>
              <a href="#" className="font-sans font-light text-sm text-background/80 hover:text-accent transition-colors">Physician Marriages</a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-outfit font-bold text-sm text-background/50 mb-2">Legal</h4>
              <a href="#" className="font-sans font-light text-sm text-background/80 hover:text-accent transition-colors">Privacy Policy</a>
              <a href="#" className="font-sans font-light text-sm text-background/80 hover:text-accent transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="font-sans font-light text-xs text-background/50">
            © 2026 Healing Hearts LLC. All rights reserved.
          </p>
          <p className="font-sans font-light text-xs text-background/50 max-w-sm">
            Clinically informed, faith-grounded relationship coaching. Not a licensed therapy practice.
          </p>
        </div>
      </div>
    </footer>
  );
};

export const LandingPage = ({ onLogin }) => {
  return (
    <div className="w-full bg-background min-h-screen">
      <Navbar onLogin={onLogin} />
      <Hero />
      <Philosophy />
      <Pillars />
      <Programs />
      <Footer />
    </div>
  );
};
