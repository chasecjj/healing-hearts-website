import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Philosophy() {
  const container = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax background
      gsap.to('.philo-bg', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: container.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });

      // Text reveal
      const lines = gsap.utils.toArray('.reveal-line');
      lines.forEach((line) => {
        gsap.from(line, {
          y: 40,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: line,
            start: 'top 85%',
          }
        });
      });
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <section 
      id="philosophy"
      ref={container} 
      className="relative w-full min-h-[100dvh] bg-primary text-background overflow-hidden flex flex-col justify-center py-32 rounded-t-[3rem] -mt-10 z-30"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1623843519808-8e6e589ecba7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80" 
          alt="Dark textured marble"
          className="philo-bg w-full h-[130%] object-cover opacity-15 origin-top scale-105"
        />
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-16 w-full space-y-24">
        
        <div className="max-w-xl">
          <p className="font-mono text-accent text-sm tracking-widest uppercase mb-6 reveal-line opacity-80">
            The Problem We Solve
          </p>
          <h3 className="font-sans font-medium text-2xl md:text-3xl text-white/50 leading-relaxed reveal-line">
            You've tried everything. The late-night talks, the books, the therapy sessions. But most advice treats symptoms without touching the nervous system.
          </h3>
        </div>

        <div className="max-w-4xl ml-auto text-right">
          <p className="font-mono text-accent text-sm tracking-widest uppercase mb-6 reveal-line opacity-80">
            The Healing Hearts Approach
          </p>
          <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight reveal-line text-background">
            We help you understand why you shut down, and how to
          </h2>
          <h2 className="font-drama italic text-5xl md:text-7xl lg:text-8xl leading-none mt-2 reveal-line text-accent">
            come back to each other.
          </h2>
        </div>

      </div>
    </section>
  );
}
