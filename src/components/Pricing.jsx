import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

export default function Pricing() {
  const container = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.membership-elem', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container.current,
          start: 'top 75%'
        }
      });
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={container} 
      className="py-32 px-6 md:px-16 bg-background relative z-20 flex flex-col items-center justify-center text-center"
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="membership-elem font-mono text-accent text-sm tracking-widest uppercase mb-4 opacity-80">
          The Full Journey
        </div>
        
        <h2 className="membership-elem font-sans font-bold text-5xl md:text-6xl lg:text-7xl tracking-tighter text-primary">
          Healing Hearts Program
        </h2>
        
        <p className="membership-elem font-sans text-lg md:text-xl text-textDark/70 leading-relaxed max-w-2xl mx-auto">
          Our complete 8-module program takes you from the foundations of understanding yourself and your partner all the way through nervous system regulation, subconscious healing, and building a legacy marriage.
        </p>
        
        <div className="membership-elem pt-8 flex justify-center gap-6">
          <Link to="/programs" className="relative overflow-hidden rounded-[3rem] bg-primary text-background px-10 py-5 font-sans font-bold text-lg hover:scale-[1.03] transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group inline-flex items-center gap-3">
            <span className="relative z-10 transition-colors duration-300 group-hover:text-primary">
              Enroll in the Full Program
            </span>
            <span className="absolute inset-0 bg-accent translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"></span>
          </Link>
        </div>
        
        <div className="membership-elem font-mono text-xs text-textDark/50 pt-12 uppercase tracking-widest">
          This isn't a weekend workshop. It's a transformation.
        </div>
      </div>
    </section>
  );
}
