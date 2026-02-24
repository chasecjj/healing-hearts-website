import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Menu, X, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// --- Magnetic Button (Global) ---
export const MagneticButton = ({ children, className = '', onClick }) => {
  const buttonRef = React.useRef(null);
  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={`relative overflow-hidden group transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-[1.02] hover:-translate-y-[1px] ${className}`}
    >
      <span className="absolute inset-0 w-full h-full bg-foreground/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] z-0"></span>
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};

// --- Navbar with Advanced Animation Overlay ---
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);

      // Hide if scrolling down and past the top area
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    if (menuOpen) toggleMenu();
  }, [location.pathname]);

  const toggleMenu = () => {
    if (!menuOpen) {
      setMenuOpen(true);
      document.body.style.overflow = 'hidden'; // prevent scrolling
      
      const tl = gsap.timeline();
      tl.to('.menu-overlay', { y: '0%', duration: 0.8, ease: 'power4.inOut' })
        .fromTo('.menu-link', 
           { y: 50, opacity: 0 }, 
           { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.2)' },
           "-=0.4"
         )
         .fromTo('.menu-footer',
           { opacity: 0 },
           { opacity: 1, duration: 0.5 },
           "-=0.2"
         );
    } else {
      const tl = gsap.timeline({
        onComplete: () => {
          setMenuOpen(false);
          document.body.style.overflow = 'auto';
        }
      });
      tl.to('.menu-overlay', { y: '-100%', duration: 0.6, ease: 'power3.inOut' });
    }
  };

  return (
    <>
      <nav
        className={`fixed left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 ease-in-out w-[95%] max-w-6xl rounded-full px-6 py-4 flex items-center justify-between \${
          isVisible || menuOpen ? 'top-4 opacity-100' : '-top-32 opacity-0'
        } \${
          menuOpen 
            ? 'bg-transparent text-background border border-transparent'
            : 'bg-background shadow-md border border-primary/20 text-foreground'
        }`}
      >
        <Link to="/" className={`font-outfit font-bold text-xl tracking-wide flex-shrink-0 transition-colors duration-500 ${menuOpen ? 'text-background' : 'text-foreground'}`}>
          Healing Hearts.
        </Link>
        <div className="hidden md:flex items-center gap-10 font-sans text-sm font-medium">
          <Link to="/about" className={`transition-colors duration-500 ${menuOpen ? 'text-background/70 hover:text-background' : location.pathname === '/about' ? 'text-accent font-semibold' : 'text-foreground/70 hover:text-accent'}`}>About Us</Link>
          <Link to="/programs" className={`transition-colors duration-500 ${menuOpen ? 'text-background/70 hover:text-background' : location.pathname === '/programs' ? 'text-accent font-semibold' : 'text-foreground/70 hover:text-accent'}`}>Programs</Link>
          <Link to="/tools" className={`transition-colors duration-500 ${menuOpen ? 'text-background/70 hover:text-background' : location.pathname === '/tools' ? 'text-accent font-semibold' : 'text-foreground/70 hover:text-accent'}`}>Tools</Link>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="hidden md:flex items-center gap-4">
              {isAdmin && (
                <Link to="/admin" className={`text-sm font-sans font-medium transition-colors duration-500 ${menuOpen ? 'text-background/70 hover:text-background' : 'text-foreground/70 hover:text-accent'}`}>
                  Admin
                </Link>
              )}
              <Link to="/portal" className={`text-sm font-sans font-medium transition-colors duration-500 ${menuOpen ? 'text-background/70 hover:text-background' : 'text-foreground hover:text-accent'}`}>
                My Portal
              </Link>
              <button onClick={handleLogout} className={`text-sm font-sans font-medium transition-colors duration-500 ${menuOpen ? 'text-background/70 hover:text-background' : 'text-foreground/70 hover:text-accent'}`}>
                Log out
              </button>
            </div>
          ) : (
            <Link to="/login" className={`hidden md:block text-sm font-sans font-medium transition-colors duration-500 ${menuOpen ? 'text-background/70 hover:text-background' : 'text-foreground hover:text-accent'}`}>
              Member Login
            </Link>
          )}
          <button 
            onClick={toggleMenu} 
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-500 ${
              menuOpen ? 'bg-background/20 hover:bg-background/30 text-background border border-background/20' : 'bg-primary/5 hover:bg-primary/10 text-primary'
            }`}
          >
            {menuOpen ? <X className="w-5 h-5 pointer-events-none" /> : <Menu className="w-5 h-5 pointer-events-none" />}
          </button>
        </div>
      </nav>

      {/* Full Screen Overlay Menu */}
      <div 
        className={`menu-overlay fixed inset-0 bg-primary z-50 flex flex-col justify-center px-8 md:px-24 transform -translate-y-full \${menuOpen ? 'block' : 'hidden md:flex'}`}
        style={{ display: menuOpen ? 'flex' : 'none' }} // Ensure it stays hidden initially
      >
        <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-16 md:gap-32">
          <div className="flex flex-col gap-6 md:w-2/3">
            <Link to="/" className="menu-link font-drama italic text-5xl md:text-7xl text-background hover:text-accent transition-colors flex items-center gap-4 group">
              Home <ArrowRight className="w-8 h-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-4 transition-all" />
            </Link>
            <Link to="/about" className="menu-link font-drama italic text-5xl md:text-7xl text-background hover:text-accent transition-colors flex items-center gap-4 group">
              About Us <ArrowRight className="w-8 h-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-4 transition-all" />
            </Link>
            <Link to="/programs" className="menu-link font-drama italic text-5xl md:text-7xl text-background hover:text-accent transition-colors flex items-center gap-4 group">
              Programs <ArrowRight className="w-8 h-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-4 transition-all" />
            </Link>
            <Link to="/tools" className="menu-link font-drama italic text-5xl md:text-7xl text-background hover:text-accent transition-colors flex items-center gap-4 group">
              Tools & Frameworks <ArrowRight className="w-8 h-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-4 transition-all" />
            </Link>
            <Link to="/physician" className="menu-link font-drama italic text-5xl md:text-7xl text-background hover:text-accent transition-colors flex items-center gap-4 group">
              Physician Marriages <ArrowRight className="w-8 h-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-4 transition-all" />
            </Link>
            <Link to="/resources" className="menu-link font-drama italic text-5xl md:text-7xl text-background hover:text-accent transition-colors flex items-center gap-4 group">
              Resources <ArrowRight className="w-8 h-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-4 transition-all" />
            </Link>
            <Link to="/contact" className="menu-link font-drama italic text-5xl md:text-7xl text-background hover:text-accent transition-colors flex items-center gap-4 group">
              Contact <ArrowRight className="w-8 h-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-4 transition-all" />
            </Link>
          </div>
          
          <div className="menu-footer flex flex-col justify-end gap-12 md:w-1/3 pb-12">
            <div>
              <h4 className="font-outfit font-bold text-sm tracking-widest uppercase text-background/50 mb-6">Healing Hearts</h4>
              <p className="font-sans font-light text-background/80 leading-relaxed max-w-sm">
                Built by a couple who’ve walked through their own fire—and came out holding hands on the other side.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {user ? (
                <>
                  <Link to="/portal" className="font-sans font-semibold text-accent hover:text-background transition-colors flex items-center gap-2">
                    My Portal <ArrowRight className="w-4 h-4" />
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="font-sans font-semibold text-accent hover:text-background transition-colors flex items-center gap-2">
                      Admin Panel <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  <button onClick={handleLogout} className="font-sans text-background/80 hover:text-background transition-colors flex items-center gap-2 text-left">
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </>
              ) : (
                <Link to="/login" className="font-sans font-semibold text-accent hover:text-background transition-colors flex items-center gap-2">
                  Member Login <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <a href="mailto:hello@healingheartscoaching.com" className="font-sans text-background/80 hover:text-background transition-colors">
                hello@healingheartscoaching.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
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
              <Link to="/programs" className="font-sans font-light text-sm text-background/80 hover:text-accent transition-colors">Programs</Link>
              <Link to="/about" className="font-sans font-light text-sm text-background/80 hover:text-accent transition-colors">About</Link>
              <Link to="/physician" className="font-sans font-light text-sm text-background/80 hover:text-accent transition-colors">Physician Marriages</Link>
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

export const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow w-full bg-background pt-24 md:pt-32">
         {/* Page content injected here */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
