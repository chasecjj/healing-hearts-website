import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '../components/Layout';
import { ShieldAlert, Clock, Coins, Network } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function PhysicianMarriages() {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Header animations
      gsap.fromTo('.physician-reveal', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power3.out' }
      );
      
      const cards = gsap.utils.toArray('.pressure-card');
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

  return (
    <div ref={containerRef} className="w-full bg-[#F7F6F2]">
      
      {/* Hero */}
      <section className="relative w-full py-32 md:py-48 flex flex-col items-center justify-center overflow-hidden bg-primary text-background rounded-b-[4rem]">
         <div className="absolute inset-x-0 bottom-0 h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, #1191B1 0%, transparent 60%)' }}></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="physician-reveal font-sans text-accent tracking-widest uppercase text-sm mb-6 font-semibold">Specialized Track</p>
          <h1 className="physician-reveal font-drama italic text-5xl md:text-7xl lg:text-8xl leading-tight mb-8">
            The Physician Marriage
          </h1>
          <p className="physician-reveal font-outfit font-bold text-2xl md:text-4xl text-background/90 mx-auto max-w-2xl">
            When healing others costs you the person who loves you most.
          </p>
          <p className="physician-reveal font-sans text-background/70 md:text-xl leading-relaxed font-light mx-auto max-w-2xl mt-8">
            You trained for years to save lives. Nobody trained you for what it would do to your marriage.
          </p>
        </div>
      </section>

      {/* Intro Text */}
      <section className="py-24 max-w-3xl mx-auto px-6 text-center">
          <p className="font-sans text-foreground/80 text-lg md:text-xl leading-relaxed font-light mb-8">
            Physician marriages carry a unique weight. The emotional dissociation that keeps you functional in the OR follows you home. The schedule chaos makes consistent connection nearly impossible. The power dynamics—the authority that serves you at work—creates friction at the dinner table. 
          </p>
          <p className="font-sans text-foreground/80 text-lg md:text-xl leading-relaxed font-light">
            We know this world. Trisha’s background in healthcare gave us a front-row seat to the specific ways high-performance medical environments erode the intimacy that keeps marriages alive.
          </p>
      </section>

      {/* Why they need something different (Pressures) */}
      <section className="py-24 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20 max-w-3xl mx-auto">
             <h2 className="font-outfit font-bold text-4xl text-primary mb-4">Why Physician Marriages Need Something Different</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="pressure-card bg-[#F7F6F2] p-10 rounded-[2.5rem] border border-primary/5 hover:-translate-y-2 transition-transform duration-500">
              <ShieldAlert className="w-10 h-10 text-accent mb-6" />
              <h3 className="font-drama italic text-3xl text-primary mb-4">Clinical dissociation doesn’t have an off switch.</h3>
              <p className="font-sans text-foreground/70 font-light leading-relaxed">
                The emotional compartmentalization that lets you function during a code blue doesn’t just shut off when you pull into the driveway. Your spouse isn’t getting a different version of you—they’re getting the version that learned to turn off feeling in order to function.
              </p>
            </div>

            <div className="pressure-card bg-[#F7F6F2] p-10 rounded-[2.5rem] border border-primary/5 hover:-translate-y-2 transition-transform duration-500">
              <Clock className="w-10 h-10 text-accent mb-6" />
              <h3 className="font-drama italic text-3xl text-primary mb-4">Your schedule is an intimacy killer by design.</h3>
              <p className="font-sans text-foreground/70 font-light leading-relaxed">
                36-hour shifts. Overnight call. Weekends consumed by documentation. The residency schedule was built to train doctors, not to sustain marriages. And the patterns it creates don’t end when training does. They just get quieter.
              </p>
            </div>

            <div className="pressure-card bg-[#F7F6F2] p-10 rounded-[2.5rem] border border-primary/5 hover:-translate-y-2 transition-transform duration-500">
              <Coins className="w-10 h-10 text-accent mb-6" />
              <h3 className="font-drama italic text-3xl text-primary mb-4">High income doesn’t mean low financial stress.</h3>
              <p className="font-sans text-foreground/70 font-light leading-relaxed">
                Student loans in the hundreds of thousands. Lifestyle inflation. Peer pressure to project success. The financial reality of physician life is wildly misunderstood—and money conflicts carry extra shame when everyone assumes you shouldn’t have them.
              </p>
            </div>

            <div className="pressure-card bg-[#F7F6F2] p-10 rounded-[2.5rem] border border-primary/5 hover:-translate-y-2 transition-transform duration-500">
              <Network className="w-10 h-10 text-accent mb-6" />
              <h3 className="font-drama italic text-3xl text-primary mb-4">The authority problem.</h3>
              <p className="font-sans text-foreground/70 font-light leading-relaxed">
                In the hospital, your decisions save lives. You give orders and people follow them. That’s leadership. At home, that same posture feels like control. The transition between the two is an underexplored source of marital friction.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* The Rescue CTA */}
      <section className="py-32">
         <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="font-outfit font-bold text-4xl text-primary mb-6">The Physician Marriage Rescue</h2>
            <p className="font-sans text-foreground/80 md:text-xl leading-relaxed font-light mb-12">
               We’ve built a specialized track within the Healing Hearts program specifically for physician couples and their spouses. It uses the same core frameworks—Critter Brain, Zones, SPARK—but contextualizes them for the unique pressures of life in medicine.
            </p>
            <p className="font-sans text-foreground/80 md:text-xl leading-relaxed font-light mb-16 italic">
              This isn’t generic marriage advice with a stethoscope on the cover.
            </p>
            <MagneticButton className="bg-accent text-background px-10 py-4 rounded-full text-base font-bold shadow-xl mx-auto">
               Learn About the Physician Track
            </MagneticButton>
         </div>
      </section>

    </div>
  );
}
