import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowDownRight } from 'lucide-react';

export default function Hero() {
  const container = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-elem', {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.2
      });
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={container} className="relative h-[100dvh] w-full overflow-hidden bg-primary text-background flex flex-col justify-end pb-24 px-6 md:px-16">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1541888078233-01bc035540ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80" 
          alt="Dark architectural interior with luxury ambient"
          className="w-full h-full object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-5xl flex flex-col items-start gap-4">
        <p className="hero-elem font-mono text-accent text-sm md:text-base uppercase tracking-widest mb-4">
          Relationship Coaching
        </p>
        <h1 className="hero-elem font-sans font-bold text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-none">
          Your marriage isn't
        </h1>
        <h2 className="hero-elem font-drama italic text-6xl md:text-8xl lg:text-[9rem] text-accent leading-none -mt-4 mb-6">
          Broken.
        </h2>
        <p className="hero-elem font-sans text-lg md:text-xl text-white/70 max-w-2xl mt-4 mb-8 leading-relaxed">
          It's buried under everything you were never taught. We help you understand why you shut down, blow up, or disappear—and how to come back to each other when you do.
        </p>
        <div className="hero-elem flex flex-col sm:flex-row items-center gap-6">
          <Link to="/programs" className="relative overflow-hidden rounded-[2rem] bg-accent text-primary px-8 py-4 font-sans font-semibold text-lg flex items-center gap-2 hover:scale-[1.03] transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group">
            <span className="relative z-10 transition-colors duration-300 group-hover:text-background flex items-center gap-2">
              Start Your Healing Journey <ArrowDownRight size={20} />
            </span>
            <span className="absolute inset-0 bg-primary translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"></span>
          </Link>
          <p className="font-mono text-white/40 text-xs hidden sm:block max-w-[200px] leading-tight mt-2 sm:mt-0">
            CLINICALLY INFORMED <br/> 
            FAITH-GROUNDED
          </p>
        </div>
      </div>
    </section>
  );
}
