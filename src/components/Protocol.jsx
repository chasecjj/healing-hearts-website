import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const RotatorGraphic = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-accent" fill="none" stroke="currentColor" strokeWidth="0.5">
    <circle cx="50" cy="50" r="40" className="opacity-20 stroke-[0.2]" />
    <circle cx="50" cy="50" r="30" className="opacity-40" strokeDasharray="4 4" />
    <path d="M50 10 L50 90 M10 50 L90 50" className="opacity-30" />
    <g className="anim-rotate transform-origin-center">
      <circle cx="50" cy="20" r="2" fill="currentColor" />
      <circle cx="50" cy="80" r="2" fill="currentColor" />
      <circle cx="80" cy="50" r="2" fill="currentColor" />
      <circle cx="20" cy="50" r="2" fill="currentColor" />
      <rect x="35" y="35" width="30" height="30" className="opacity-50" strokeDasharray="2 2" />
    </g>
  </svg>
);

const ScannerGraphic = () => (
  <div className="w-full h-full relative overflow-hidden bg-primary/5 rounded-xl border border-primary/10">
    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#2A2A35 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.1 }}></div>
    <div className="anim-laser absolute left-0 right-0 h-[2px] bg-accent shadow-[0_0_15px_#C9A84C] top-0"></div>
  </div>
);

const WaveformGraphic = () => (
  <svg viewBox="0 0 200 100" className="w-full h-full text-accent">
    <path 
      d="M0 50 Q25 50, 40 50 T60 20 T70 80 T80 40 T90 60 T100 50 T130 50 T140 30 T150 70 T160 50 T200 50" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
      className="anim-wave opacity-50"
    />
    <path 
      d="M0 50 Q25 50, 40 50 T60 20 T70 80 T80 40 T90 60 T100 50 T130 50 T140 30 T150 70 T160 50 T200 50" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      className="anim-wave-glow mix-blend-screen"
      strokeDasharray="400"
      strokeDashoffset="400"
      filter="drop-shadow(0 0 8px rgba(201,168,76,0.6))"
    />
  </svg>
);

const steps = [
  {
    num: "01",
    title: "Recognize the Hijack",
    desc: "Within the first module, couples learn to recognize when their survival brain has hijacked the conversation—and how to bring their thinking brain back online in real time.",
    Graphic: RotatorGraphic
  },
  {
    num: "02",
    title: "Restore Physical Safety",
    desc: "By month two, most couples report fewer explosive arguments, more repair after rupture, and a physical sense of safety they haven't felt in years.",
    Graphic: ScannerGraphic
  },
  {
    num: "03",
    title: "Build the Shared Language",
    desc: "By the time you finish the full program, you'll have tools for navigating conflict without destruction, and a relationship that finally feels like home again.",
    Graphic: WaveformGraphic
  }
];

export default function Protocol() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Internal SVG Animations
      gsap.to('.anim-rotate', { rotation: 360, duration: 20, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
      gsap.to('.anim-laser', { top: '100%', duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.anim-wave-glow', { strokeDashoffset: 0, duration: 2.5, repeat: -1, ease: 'power2.inOut' });

      // Stacking logic
      const cards = gsap.utils.toArray('.protocol-card');
      
      cards.forEach((card, index) => {
        if (index === cards.length - 1) return; // Last card doesn't need to scale down
        
        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: ".protocol-container",
          end: "bottom bottom",
          pin: true,
          pinSpacing: false,
        });

        const nextCard = cards[index + 1];
        
        gsap.to(card, {
          scale: 0.9,
          opacity: 0.5,
          filter: "blur(10px)",
          ease: "none",
          scrollTrigger: {
            trigger: nextCard,
            start: "top bottom",
            end: "top top",
            scrub: true,
          }
        });
      });
      
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="protocol" className="protocol-container relative w-full bg-primary" ref={containerRef}>
      {steps.map((step, idx) => (
        <div 
          key={step.num}
          className="protocol-card h-[100dvh] w-full flex items-center justify-center sticky top-0"
          style={{ zIndex: idx }}
        >
          <div className="w-full max-w-6xl mx-auto px-6 md:px-16 flex flex-col md:flex-row items-center gap-12 md:gap-24">
            
            <div className="flex-1 bg-background rounded-[3rem] p-12 aspect-square relative overflow-hidden shadow-2xl border border-black/5 flex items-center justify-center">
              <step.Graphic />
            </div>

            <div className="flex-1 space-y-6 text-background">
              <div className="font-mono text-accent text-lg opacity-80 border-b border-accent/20 pb-4 inline-block">
                // Month {step.num}
              </div>
              <h3 className="font-sans font-bold text-5xl md:text-7xl tracking-tighter text-background">
                {step.title}
              </h3>
              <p className="font-sans text-lg md:text-xl text-background/60 leading-relaxed max-w-md">
                {step.desc}
              </p>
            </div>

          </div>
        </div>
      ))}
    </section>
  );
}
