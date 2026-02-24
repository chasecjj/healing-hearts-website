import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { MousePointer2, Save } from 'lucide-react';

const pillars = [
  { id: 1, label: "Science That Makes Sense", sub: "POLYVAGAL & NEUROSCIENCE" },
  { id: 2, label: "Faith Woven In", sub: "SACRED COVENANT" },
  { id: 3, label: "Built by a Couple", sub: "LIVED EXPERIENCE" }
];

function DiagnosticShuffler() {
  const [cards, setCards] = useState(pillars);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards(prev => {
        const newCards = [...prev];
        const last = newCards.pop();
        newCards.unshift(last);
        return newCards;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-between self-stretch bg-background border border-black/5 rounded-[2rem] p-8 shadow-xl min-h-[360px]">
      <div>
        <h3 className="font-sans font-bold text-2xl tracking-tighter text-primary">A Different Kind of Help</h3>
        <p className="font-sans text-sm text-textDark/70 mt-2">Tested in the trenches of real life.</p>
      </div>
      <div className="relative h-40 mt-8">
        {cards.map((card, idx) => {
          let yOffset = idx * 16;
          let scale = 1 - idx * 0.05;
          let opacity = 1 - idx * 0.2;
          let zIndex = 10 - idx;
          
          return (
            <div 
              key={card.id}
              className="absolute left-0 right-0 h-[80px] bg-primary rounded-[1rem] p-4 flex flex-col justify-center transition-all duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{
                transform: `translateY(${yOffset}px) scale(${scale})`,
                opacity: opacity,
                zIndex: zIndex
              }}
            >
              <div className="font-mono text-accent text-[10px] tracking-widest">{card.sub}</div>
              <div className="font-sans font-medium text-background text-sm">{card.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

function TelemetryTypewriter() {
  const messages = [
    "Adrenaline peaking...",
    "Cortisol dropping...",
    "Riding the emotional wave...",
    "CEO Brain coming online.",
    "Repair sequence initiated."
  ];
  
  const [text, setText] = useState("");
  const [msgIdx, setMsgIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (charIdx < messages[msgIdx].length) {
      const timeout = setTimeout(() => {
        setText(prev => prev + messages[msgIdx][charIdx]);
        setCharIdx(c => c + 1);
      }, 50 + Math.random() * 50);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setText("");
        setCharIdx(0);
        setMsgIdx(m => (m + 1) % messages.length);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [charIdx, msgIdx]);

  return (
    <div className="flex-1 flex flex-col justify-between self-stretch bg-background border border-black/5 rounded-[2rem] p-8 shadow-xl min-h-[360px]">
      <div className="flex items-center justify-between">
        <h3 className="font-sans font-bold text-2xl tracking-tighter text-primary">The 90-Second Wave</h3>
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-accent bg-primary px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
          Live Feed
        </div>
      </div>
      <p className="font-sans text-sm text-textDark/70 mt-2 mb-8">Every emotional storm peaks and passes if you can ride it out.</p>
      
      <div className="mt-auto bg-primary rounded-[1rem] p-6 text-background font-mono text-xs md:text-sm min-h-[140px] flex flex-col justify-end">
        <div className="text-textDark break-words mb-2">&gt; monitor.system()</div>
        <div className="flex relative">
          <span className="text-accent">&gt; {text}</span>
          <span className="w-[8px] h-[16px] bg-accent ml-1 animate-pulse"></span>
        </div>
      </div>
    </div>
  );
}

function CursorProtocolScheduler() {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      
      // Initial state
      tl.set('.anim-cursor', { x: 0, y: 150, opacity: 0 });
      tl.set('.anim-cell', { backgroundColor: 'transparent', color: '#2A2A35' });
      tl.set('.anim-save', { scale: 1 });

      // Enter
      tl.to('.anim-cursor', { opacity: 1, duration: 0.3 })
        .to('.anim-cursor', { x: 95, y: 35, duration: 1, ease: 'power2.inOut' })
        
      // Click Cell
        .to('.anim-cursor', { scale: 0.8, duration: 0.1 })
        .to('.anim-cell-active', { 
            backgroundColor: '#C9A84C', 
            color: '#FAF8F5', 
            duration: 0.1 
        }, "<")
        .to('.anim-cursor', { scale: 1, duration: 0.1 })
        
      // Move to Save
        .to('.anim-cursor', { x: 180, y: 105, duration: 0.8, ease: 'power2.inOut', delay: 0.2 })
      // Click Save
        .to('.anim-cursor', { scale: 0.8, duration: 0.1 })
        .to('.anim-save', { scale: 0.95, duration: 0.1 }, "<")
        .to('.anim-cursor', { scale: 1, duration: 0.1 })
        .to('.anim-save', { scale: 1, duration: 0.1 }, "<")
        
      // Exit
        .to('.anim-cursor', { opacity: 0, y: 150, duration: 0.4, delay: 0.2 });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  const letters = ['S', 'P', 'A', 'R', 'K'];

  return (
    <div ref={containerRef} className="flex-1 flex flex-col justify-between self-stretch bg-background border border-black/5 rounded-[2rem] p-8 shadow-xl min-h-[360px] relative overflow-hidden">
      <div>
        <h3 className="font-sans font-bold text-2xl tracking-tighter text-primary">The SPARK Method™</h3>
        <p className="font-sans text-sm text-textDark/70 mt-2 mb-8">Your five-step rescue plan to stop the momentum of any conflict.</p>
      </div>

      <div className="relative border border-black/10 rounded-2xl p-6 bg-white flex-1 flex flex-col justify-center">
        <div className="flex justify-between mb-6">
          {letters.map((d, i) => (
            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-sans font-medium text-xs border border-black/5 transition-colors ${i === 3 ? 'anim-cell anim-cell-active' : 'text-textDark bg-background'}`}>
              {d}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center bg-background rounded-lg p-3">
          <div className="font-mono text-[10px] text-textDark">Repair Initiated</div>
          <button className="anim-save bg-primary text-background font-sans text-xs px-4 py-1.5 rounded-full flex items-center gap-1">
            <Save size={12} className="text-accent" /> Save
          </button>
        </div>

        {/* The Animated Cursor */}
        <div className="anim-cursor absolute left-0 top-0 pointer-events-none drop-shadow-xl z-10 w-6 h-6 text-primary">
          <MousePointer2 fill="#0D0D12" stroke="#FAF8F5" strokeWidth={1.5} size={24} />
        </div>
      </div>
    </div>
  );
}

export default function Features() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out'
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-6 md:px-16 bg-background relative z-20 -mt-10 rounded-t-[3rem]">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-stretch mb-12">
        <div className="feature-card flex-1"><DiagnosticShuffler /></div>
        <div className="feature-card flex-1"><TelemetryTypewriter /></div>
        <div className="feature-card flex-1"><CursorProtocolScheduler /></div>
      </div>
      
      <div className="text-center">
        <Link to="/frameworks" className="font-sans font-semibold text-primary hover:text-accent transition-colors underline underline-offset-4 decoration-accent/30">
          Explore All Our Frameworks
        </Link>
      </div>
    </section>
  );
}
