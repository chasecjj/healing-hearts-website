import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
  const navRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 'top -100px',
        onUpdate: (self) => {
          setIsScrolled(self.scroll() > 100);
        }
      });
    }, navRef);
    return () => ctx.revert();
  }, []);

  const navLinks = [
    { name: 'About', path: '/about' },
    { name: 'Programs', path: '/programs' },
    { name: 'Frameworks', path: '/frameworks' },
    { name: 'Physicians', path: '/physicians' },
    { name: 'Stories', path: '/testimonials' }
  ];

  return (
    <nav
      ref={navRef}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 rounded-[2rem] transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
        isScrolled || location.pathname !== '/'
          ? 'bg-background/80 backdrop-blur-xl text-primary shadow-sm border border-black/5 w-[90%] md:w-[75%]'
          : 'bg-transparent text-background w-[95%] md:w-[85%]'
      }`}
    >
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
        <img src="/logo.png" alt="Healing Hearts Logo" className="h-8 md:h-10 w-auto object-contain" />
      </Link>
      
      <div className="hidden md:flex items-center gap-8 font-mono text-sm uppercase tracking-widest">
        {navLinks.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="hover:-translate-y-[1px] hover:text-accent transition-all duration-300"
          >
            {item.name}
          </Link>
        ))}
      </div>

      <Link to="/contact" className="relative overflow-hidden rounded-[2rem] bg-accent text-primary px-6 py-2 font-sans font-semibold text-sm hover:scale-[1.03] transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group inline-block">
        <span className="relative z-10 transition-colors duration-300 group-hover:text-background">Get Started</span>
        <span className="absolute inset-0 bg-primary translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"></span>
      </Link>
    </nav>
  );
}
