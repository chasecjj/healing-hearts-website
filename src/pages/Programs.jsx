import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '../components/Layout';
import { CheckCircle2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Programs() {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo('.programs-reveal', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power3.out' }
      );
      
      const cards = gsap.utils.toArray('.program-card');
      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%"
            }
          }
        )
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const standalonePackages = [
    {
      title: "The Conflict Rescue Kit",
      subtitle: "Stop the bleeding. Learn to fight without destroying.",
      desc: "If your arguments have become a warzone—or if you’ve stopped fighting altogether because it feels pointless—this is where you start.",
      includes: ["SPARK Method training", "Critter Brain vs. CEO Brain framework", "Zones of Resilience assessment", "The 90-Second Wave guide", "Printable Conflict Recovery Plan"]
    },
    {
      title: "Communication Mastery Toolkit",
      subtitle: "Say what you mean—and hear what they’re really saying.",
      desc: "Most couples don’t have a communication problem. They have a safety problem. This toolkit teaches you to express needs without blame.",
      includes: ["Attachment style deep-dive", "Needs expression framework", "Active listening techniques", "The SPARK repair process", "Guided practice exercises"]
    },
    {
      title: "Toxic Pattern Breaker",
      subtitle: "Name it. Trace it. Break the cycle.",
      desc: "Some patterns erode trust at the foundation. Gaslighting, manipulation, emotional immaturity. We give you the vocabulary to see these patterns clearly.",
      includes: ["Gaslighting identification guide", "Manipulation pattern analysis", "Projection and shadow work", "Emotional maturity assessment", "Action plan"]
    },
    {
      title: "Spark & Intimacy Bundle",
      subtitle: "From roommates back to lovers.",
      desc: "You share a bed. You coordinate schedules. But somewhere along the way, the spark went dark. This bundle addresses the full spectrum of intimacy.",
      includes: ["The 6 Levels of Intimacy framework", "Desire and connection assessment", "Rebuilding physical safety", "Emotional vulnerability exercises", "30-day reset plan"]
    },
    {
      title: "Financial Unity System",
      subtitle: "Because money fights are never really about money.",
      desc: "Stop fighting about money and start building with it. Understand how your financial childhoods shaped your spending identities.",
      includes: ["Budget meeting framework", "Debt reduction strategies", "Financial childhood exploration", "Spending personality assessment", "Decision-making toolbox"]
    }
  ];

  return (
    <div ref={containerRef} className="w-full bg-background pt-32 md:pt-48 pb-24">
      
      {/* Header */}
      <section className="relative w-full max-w-5xl mx-auto px-6 text-center mb-32 z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] bg-accent/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        <p className="programs-reveal font-sans text-primary/60 tracking-widest uppercase text-sm mb-6 relative z-10">Our Programs</p>
        <h1 className="programs-reveal font-drama italic text-5xl md:text-7xl lg:text-8xl text-primary leading-tight mb-8 relative z-10">
          Every couple enters at a different place.
        </h1>
        <p className="programs-reveal font-sans text-foreground/80 md:text-xl leading-relaxed font-light mx-auto relative z-10 max-w-3xl">
          Whether you’re in crisis or just feeling the slow drift, we meet you where you are. Our programs are designed to stand alone or build on each other—so you can start with what you need most and go deeper when you’re ready.
        </p>
      </section>

      {/* The Full Journey */}
      <section className="max-w-6xl mx-auto px-6 mb-32">
        <div className="bg-primary text-background rounded-[3rem] p-10 md:p-16 lg:p-20 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:items-start">
            <div>
              <div className="inline-block bg-amber-100 text-primary font-outfit font-bold px-5 py-2 rounded-full text-xs uppercase tracking-widest shadow-md mb-6">
                 Premium Flagship Offering
              </div>
              <h2 className="font-outfit font-bold text-4xl md:text-5xl mb-6">Healing Hearts <span className="font-drama italic font-normal">Program</span></h2>
              <p className="font-sans text-background/80 text-lg leading-relaxed font-light mb-8">
                Our complete 8-module program takes you from the foundations of understanding yourself and your partner all the way through nervous system regulation, subconscious healing, and building a legacy marriage. 
              </p>
              <p className="font-sans text-background/80 text-lg leading-relaxed font-light mb-12">
                This is the deep work—the kind that doesn’t just improve your relationship but transforms the people in it.
              </p>
              
              <blockquote className="border-l-2 border-accent pl-6 py-2 mb-12 hidden lg:block">
                <p className="font-drama italic text-2xl text-background leading-tight">
                  “This isn’t a weekend workshop. It’s a transformation. Give it 32 weeks and we’ll give you a different marriage.”
                </p>
              </blockquote>

              <MagneticButton className="bg-white text-primary px-10 py-4 rounded-full text-sm font-bold shadow-xl w-full md:w-auto hover:bg-gray-100 hover:scale-105 transition-all duration-300">
                Enroll in the Full Program
              </MagneticButton>
            </div>

            <div className="bg-background/10 p-10 md:p-14 rounded-[2.5rem] border border-background/20 mt-0 lg:-mt-2">
              <h3 className="font-outfit font-bold text-2xl mb-8 text-white">What's Inside (8 Modules)</h3>
              <div className="space-y-8">
                <div>
                   <h4 className="font-sans font-semibold text-orange-100 text-lg">1. Love's Foundation</h4>
                   <p className="font-sans text-sm font-light text-white/80 mt-1">Personality blueprint, attachment style, and love language.</p>
                </div>
                <div>
                   <h4 className="font-sans font-semibold text-orange-100 text-lg">2. Invisible Chains</h4>
                   <p className="font-sans text-sm font-light text-white/80 mt-1">Recognize toxic patterns hiding in plain sight.</p>
                </div>
                <div>
                   <h4 className="font-sans font-semibold text-orange-100 text-lg">3. The Deep Roots</h4>
                   <p className="font-sans text-sm font-light text-white/80 mt-1">Understand how your childhood wrote a Mindprint.</p>
                </div>
                 <div>
                   <h4 className="font-sans font-semibold text-orange-100 text-lg">4. Breakthrough Communication</h4>
                   <p className="font-sans text-sm font-light text-white/80 mt-1">Express needs without blame, listen without defending.</p>
                </div>
                <div className="pt-4 border-t border-white/20 mt-8">
                   <h4 className="font-sans text-sm font-medium text-white/90 italic leading-relaxed">
                       + 4 advanced modules on Nervous System, Emotional Zones, Subconscious Core Wounds, and Legacy Building.
                   </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Standalone Packages */}
      <section className="bg-[#F7F6F2] py-24 rounded-[4rem]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="font-outfit font-bold text-4xl md:text-5xl text-primary mb-6">Standalone Packages</h2>
            <p className="font-sans text-foreground/70 text-lg leading-relaxed font-light">
              Not ready for the full program? Start with one of our focused packages. Each one tackles a specific pain point with the same depth and science that drives our flagship program.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {standalonePackages.map((pkg, idx) => (
              <div key={idx} className="program-card bg-background p-8 rounded-[2rem] shadow-sm border border-primary/5 flex flex-col h-full hover:border-accent/30 transition-colors duration-500">
                <h3 className="font-drama italic text-3xl text-primary mb-2 line-clamp-2">{pkg.title}</h3>
                <h4 className="font-outfit font-bold text-sm text-accent mb-4">{pkg.subtitle}</h4>
                <p className="font-sans text-base text-foreground/80 font-normal leading-relaxed mb-8 flex-grow">
                  {pkg.desc}
                </p>
                
                <h5 className="font-outfit font-bold text-sm text-primary/70 uppercase tracking-widest mb-4">Includes</h5>
                <ul className="space-y-3 mb-10">
                  {pkg.includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="font-sans text-sm text-foreground/90 font-medium leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>

                <button className="w-full py-3 rounded-full border border-primary/20 text-primary font-sans text-sm font-medium hover:bg-primary hover:text-background transition-colors mt-auto">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
