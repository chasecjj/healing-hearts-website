import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import usePageMeta from '../hooks/usePageMeta';

gsap.registerPlugin(ScrollTrigger);

export default function Physicians() {
  usePageMeta('For Physicians', 'Healing Hearts coaching designed for physicians and their spouses — addressing emotional shutdown, burnout, and reconnection.');
  const container = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.phys-header', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.2
      });

      const reveals = gsap.utils.toArray('.scroll-reveal');
      reveals.forEach((sec) => {
        gsap.from(sec, {
          y: 60,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sec,
            start: 'top 80%',
          }
        });
      });
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={container} className="bg-primary text-background min-h-screen pt-40 pb-24 overflow-hidden relative">
      
      {/* Background Texture */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1542884748-2b87b3ee3af5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80" 
          alt="Dark textured background" 
          className="w-full h-full object-cover opacity-10 mix-blend-screen grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary/80 to-primary"></div>
      </div>

      <div className="relative z-10 px-6 md:px-16">
        
        {/* Header */}
        <section className="max-w-4xl mx-auto text-center mb-32">
          <div className="phys-header font-mono text-accent text-sm tracking-widest uppercase mb-8 opacity-80 border-b border-accent/20 pb-4 inline-block">
            // The Physician Marriage
          </div>
          <h1 className="phys-header font-sans font-bold text-5xl md:text-7xl lg:text-8xl tracking-tighter text-background leading-none mb-6">
            When healing others
          </h1>
          <h2 className="phys-header font-drama italic text-5xl md:text-7xl lg:text-[7rem] text-accent leading-none -mt-4 mb-8">
            Costs you.
          </h2>
          <p className="phys-header font-sans text-xl md:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            You trained for years to save lives. Nobody trained you for what it would do to your marriage.
          </p>
        </section>

        {/* The Unique Weight */}
        <section className="scroll-reveal max-w-5xl mx-auto mb-32 md:pl-16 md:border-l border-white/10">
          <p className="font-sans text-2xl md:text-4xl text-white/90 leading-relaxed font-medium mb-12">
            Physician marriages carry a unique weight. The emotional dissociation that keeps you functional in the OR follows you home.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-sans text-lg text-white/60 leading-relaxed">
            <p>
              The schedule chaos makes consistent connection nearly impossible. The power dynamics—the authority that serves you at work—creates friction at the dinner table. And the financial stress that nobody expects creates a pressure cooker underneath a polished surface.
            </p>
            <p>
              We know this world. Trisha's background in healthcare gave us a front-row seat to the specific ways high-performance medical environments erode the intimacy that keeps marriages alive.
            </p>
          </div>
        </section>

        {/* The 4 Dilemmas */}
        <section className="scroll-reveal max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-40">
          
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-sm">
            <h4 className="font-mono text-xs text-accent uppercase tracking-widest mb-6 border-b border-white/10 pb-4">01</h4>
            <h3 className="font-sans font-bold text-2xl mb-4">Clinical dissociation doesn't have an off switch.</h3>
            <p className="font-sans text-white/60 leading-relaxed">
              The emotional compartmentalization that lets you function during a code blue doesn't just shut off when you pull into the driveway. Your spouse isn't getting a different version of you—they're getting the version that learned to turn off feeling in order to function.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-sm">
            <h4 className="font-mono text-xs text-accent uppercase tracking-widest mb-6 border-b border-white/10 pb-4">02</h4>
            <h3 className="font-sans font-bold text-2xl mb-4">Your schedule is an intimacy killer by design.</h3>
            <p className="font-sans text-white/60 leading-relaxed">
              36-hour shifts. Overnight call. Weekends consumed by documentation. The residency schedule was built to train doctors, not to sustain marriages. And the patterns it creates don't end when training does.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-sm">
            <h4 className="font-mono text-xs text-accent uppercase tracking-widest mb-6 border-b border-white/10 pb-4">03</h4>
            <h3 className="font-sans font-bold text-2xl mb-4">High income doesn't mean low financial stress.</h3>
            <p className="font-sans text-white/60 leading-relaxed">
              Student loans in the hundreds of thousands. Lifestyle inflation. The financial reality of physician life is wildly misunderstood. And money conflicts carry extra shame when everyone assumes you shouldn't have them.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-sm">
            <h4 className="font-mono text-xs text-accent uppercase tracking-widest mb-6 border-b border-white/10 pb-4">04</h4>
            <h3 className="font-sans font-bold text-2xl mb-4">The authority problem.</h3>
            <p className="font-sans text-white/60 leading-relaxed">
              In the hospital, your decisions save lives. At home, that same posture feels like control. And the transition between the two is one of the most underexplored sources of marital friction in medicine.
            </p>
          </div>

        </section>

        {/* The Rescue Track */}
        <section className="scroll-reveal max-w-4xl mx-auto text-center bg-accent/10 border border-accent/20 rounded-[3rem] p-12 md:p-24 overflow-hidden relative">
          <div className="absolute inset-0 bg-accent mix-blend-overlay opacity-5 pointer-events-none"></div>
          <h2 className="font-sans font-bold text-4xl md:text-5xl tracking-tight mb-8">The Physician Marriage Rescue</h2>
          <p className="font-sans text-lg md:text-xl text-white/80 leading-relaxed mb-12">
            We've built a specialized track within the Healing Hearts program specifically for physician couples and their spouses. It contextualizes the core frameworks for the unique pressures of life in medicine.
          </p>
          <Link to="/contact" className="relative overflow-hidden rounded-[3rem] bg-accent text-primary px-10 py-5 font-sans font-bold text-lg hover:scale-[1.03] transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group inline-flex items-center">
            <span className="relative z-10 transition-colors duration-300 group-hover:text-background">
              Learn About the Physician Track
            </span>
            <span className="absolute inset-0 bg-primary translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"></span>
          </Link>
        </section>

      </div>
    </main>
  );
}
