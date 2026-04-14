import React, { useEffect, useRef } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Tools() {
  usePageMeta('Tools & Frameworks', 'Explore the SPARK Method, Critter Brain vs. CEO Brain, Zones of Resilience, and other science-backed tools for couples.');
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Header animations
      gsap.fromTo('.tools-reveal', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power3.out' }
      );
      
      // Framework block animations
      const blocks = gsap.utils.toArray('.framework-block');
      blocks.forEach((block) => {
          gsap.fromTo(block, 
            { y: 50, opacity: 0 },
            { 
              y: 0, 
              opacity: 1, 
              duration: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: block,
                start: 'top 85%'
              }
            }
          );
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full bg-background pt-32 md:pt-48 pb-24">
      {/* Header */}
      <section className="max-w-4xl mx-auto px-6 text-center mb-24">
        <p className="tools-reveal font-sans text-primary/60 tracking-widest uppercase text-sm mb-6">Our Tools & Frameworks</p>
        <h1 className="tools-reveal font-drama italic text-5xl md:text-7xl lg:text-8xl text-primary leading-tight mb-8">
          Built from lived experience.
        </h1>
        <p className="tools-reveal font-sans text-foreground/80 md:text-xl leading-relaxed font-light mx-auto max-w-2xl">
          Proprietary methods you won’t find anywhere else. Designed to give you something usable when your emotions are running hot and your logic has left the building.
        </p>
      </section>

      {/* SPARK Method */}
      <section className="framework-block max-w-5xl mx-auto px-6 mb-32">
        <div className="bg-background rounded-[3rem] p-10 md:p-16 border border-primary/5 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
               <h2 className="font-outfit font-bold text-4xl text-primary mb-4">The SPARK Method™</h2>
               <p className="font-drama italic text-2xl text-accent mb-6 leading-tight">Your five-step rescue plan for any conflict.</p>
               <p className="font-sans text-foreground/70 font-light leading-relaxed mb-8">
                 SPARK works because it interrupts the biological cascade that turns a disagreement into a disaster. It gives your CEO Brain time to get back in the room.
               </p>
            </div>
            
            <div className="md:w-1/2 space-y-6">
               <div className="flex gap-4 items-start">
                 <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-outfit font-bold shrink-0">S</div>
                 <div>
                   <h4 className="font-outfit font-bold text-lg text-primary">See It</h4>
                   <p className="font-sans text-sm text-foreground/70 font-light mt-1">Notice the moment the conversation shifts from connecting to protecting.</p>
                 </div>
               </div>
               <div className="flex gap-4 items-start">
                 <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-outfit font-bold shrink-0">P</div>
                 <div>
                   <h4 className="font-outfit font-bold text-lg text-primary">Pause & Probe</h4>
                   <p className="font-sans text-sm text-foreground/70 font-light mt-1">Stop the momentum. Take a breath. "What am I actually feeling?"</p>
                 </div>
               </div>
               <div className="flex gap-4 items-start">
                 <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-outfit font-bold shrink-0">A</div>
                 <div>
                   <h4 className="font-outfit font-bold text-lg text-primary">Acknowledge</h4>
                   <p className="font-sans text-sm text-foreground/70 font-light mt-1">Before you defend, validate. It lets your partner's nervous system stand down.</p>
                 </div>
               </div>
               <div className="flex gap-4 items-start">
                 <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-outfit font-bold shrink-0">R</div>
                 <div>
                   <h4 className="font-outfit font-bold text-lg text-primary">Reconnect</h4>
                   <p className="font-sans text-sm text-foreground/70 font-light mt-1">Make a bid for repair. The signal: "I'm still here. We're still us."</p>
                 </div>
               </div>
               <div className="flex gap-4 items-start">
                 <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-outfit font-bold shrink-0">K</div>
                 <div>
                   <h4 className="font-outfit font-bold text-lg text-primary">Kindle</h4>
                   <p className="font-sans text-sm text-foreground/70 font-light mt-1">After the storm, revisit what happened to learn, not litigate.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Critter vs CEO */}
      <section className="framework-block max-w-5xl mx-auto px-6 mb-32">
        <div className="bg-primary text-background rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-xl">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/5 rounded-full blur-[120px]"></div>
           <div className="relative z-10 text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-outfit font-bold text-4xl mb-4">Critter Brain vs. CEO Brain</h2>
              <p className="font-drama italic text-2xl text-white/70 mb-6">The two minds running your marriage.</p>
           </div>

           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-background/10 p-8 rounded-3xl border border-background/20 backdrop-blur-sm">
                 <h3 className="font-outfit font-bold text-2xl mb-4 flex items-center gap-3">
                    <span className="text-3xl">🔥</span> The Critter Brain
                 </h3>
                 <p className="font-sans font-light text-background/80 leading-relaxed">
                   Like a smoke alarm—quick to react, but terrible at distinguishing between burnt toast and a house fire. It's the part of your nervous system that scans for danger, installed long before you could talk.
                 </p>
              </div>
              <div className="bg-background p-8 rounded-3xl text-primary border border-primary/5">
                 <h3 className="font-outfit font-bold text-2xl mb-4 flex items-center gap-3">
                    <span className="text-3xl">🏛️</span> The CEO Brain
                 </h3>
                 <p className="font-sans font-light text-foreground/80 leading-relaxed">
                   The thoughtful, wise part of you. It holds perspective, shows empathy, and chooses a response. When the Critter Brain sounds the alarm, the CEO Brain gets locked out of the control room.
                 </p>
              </div>
           </div>
           <p className="relative z-10 text-center font-sans font-light text-background/70 mt-12 max-w-2xl mx-auto">
             Most couples fight Critter-to-Critter. We teach you to recognize the moment your Critter takes over—and how to bring your CEO back online.
           </p>
        </div>
      </section>

      {/* Zones of Resilience */}
      <section className="framework-block max-w-5xl mx-auto px-6 mb-32">
         <div className="text-center mb-16">
            <h2 className="font-outfit font-bold text-4xl text-primary mb-4">The Zones of Resilience</h2>
            <p className="font-drama italic text-2xl text-accent mb-6">A shared language for the emotional weather inside your system.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-3xl border-t-8 border-green-500 shadow-sm hover:-translate-y-2 transition-transform">
               <h3 className="font-outfit font-bold text-xl text-primary mb-3">Green Zone</h3>
               <p className="font-sans text-sm text-foreground/70 font-light leading-relaxed">
                 Safe and connected. You can listen, empathize, and be present. Intimacy lives here.
               </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border-t-8 border-yellow-400 shadow-sm hover:-translate-y-2 transition-transform">
               <h3 className="font-outfit font-bold text-xl text-primary mb-3">Yellow Zone</h3>
               <p className="font-sans text-sm text-foreground/70 font-light leading-relaxed">
                 Activated and anxious. Defensive. Heart rate rising. Capacity for nuance is shrinking.
               </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border-t-8 border-red-500 shadow-sm hover:-translate-y-2 transition-transform">
               <h3 className="font-outfit font-bold text-xl text-primary mb-3">Red Zone</h3>
               <p className="font-sans text-sm text-foreground/70 font-light leading-relaxed">
                 Fight or flight. Full survival mode. You're attacking with words or looking for the exit.
               </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border-t-8 border-blue-500 shadow-sm hover:-translate-y-2 transition-transform">
               <h3 className="font-outfit font-bold text-xl text-primary mb-3">Blue Zone</h3>
               <p className="font-sans text-sm text-foreground/70 font-light leading-relaxed">
                 Shutdown and collapse. Numb. The lights are on but nobody's home. Emotionally checked out.
               </p>
            </div>
         </div>
      </section>

      {/* 90 Second Wave & Core Wounds */}
       <section className="framework-block max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-background rounded-[3rem] p-10 border border-primary/5 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-[40px]"></div>
             <h2 className="font-outfit font-bold text-3xl text-primary mb-2">The 90-Second Wave</h2>
             <p className="font-drama italic text-xl text-accent mb-6">The neurological truth.</p>
             <p className="font-sans text-foreground/70 font-light leading-relaxed mb-6">
                From a neurochemical standpoint, an emotion lasts about 90 seconds. The initial flood of cortisol and adrenaline peaks and passes in under two minutes—if you don’t re-trigger it.
             </p>
             <p className="font-sans text-foreground/70 font-light leading-relaxed">
                We teach you to ride the initial surge without adding fuel. Letting the wave move through your system while your CEO Brain watches from the shore.
             </p>
          </div>

          <div className="bg-background rounded-[3rem] p-10 border border-primary/5 shadow-sm relative overflow-hidden">
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px]"></div>
             <h2 className="font-outfit font-bold text-3xl text-primary mb-2">The 7 Core Wounds</h2>
             <p className="font-drama italic text-xl text-accent mb-6">The invisible injuries.</p>
             <p className="font-sans text-foreground/70 font-light leading-relaxed mb-6">
                Beneath every overreaction, there’s an older wound trying to protect itself: Abandonment, Rejection, Unworthiness, Betrayal, Neglect, Shame, and Powerlessness.
             </p>
             <p className="font-sans text-foreground/70 font-light leading-relaxed">
                Understanding your core wounds makes you precise. It helps you say, “That’s my Abandonment wound talking” instead of “You never care about me.”
             </p>
          </div>
       </section>
    </div>
  );
}
