import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-background rounded-t-[4rem] pt-24 pb-12 px-6 md:px-16 relative z-30 mt-[-2rem]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
        
        <div className="col-span-1 md:col-span-2 space-y-6">
          <h2 className="font-sans font-bold text-3xl tracking-tight text-background">
            Healing Hearts
          </h2>
          <p className="font-sans text-white/50 max-w-sm text-sm leading-relaxed">
            A clinically informed, faith-grounded relationship coaching program helping couples move from survival to connection. Founded by Jeff & Trisha Jamison.
          </p>
          <div className="flex items-center gap-3 mt-8">
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_#10B981]"></div>
            <span className="font-mono text-[10px] text-white/70 uppercase tracking-widest">
              Every marriage has a story worth fighting for.
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="font-mono text-xs text-accent uppercase tracking-widest mb-6">Directory</h4>
          <ul className="space-y-4 font-sans text-sm text-white/70">
            <li><Link to="/programs" className="hover:text-background transition-colors">Programs</Link></li>
            <li><Link to="/about" className="hover:text-background transition-colors">About Us</Link></li>
            <li><Link to="/resources" className="hover:text-background transition-colors">Resources</Link></li>
            <li><Link to="/faq" className="hover:text-background transition-colors">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-background transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="font-mono text-xs text-accent uppercase tracking-widest mb-6">Legal</h4>
          <ul className="space-y-4 font-sans text-sm text-white/70">
            <li><Link to="/privacy" className="hover:text-background transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-background transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
          © {currentYear} Healing Hearts LLC. All rights reserved.
        </p>
        <p className="font-sans italic text-xs text-white/40">
          Crafted with absolute precision.
        </p>
      </div>
    </footer>
  );
}
