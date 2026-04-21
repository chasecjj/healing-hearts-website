import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import usePageMeta from '../hooks/usePageMeta';

gsap.registerPlugin(ScrollTrigger);

const frameworks = [
  {
    title: "Trisha's SPARK Method™",
    subtitle: "Your five-step rescue plan for any conflict.",
    desc: "SPARK works because it interrupts the biological cascade that turns a disagreement into a disaster. It gives your CEO Brain time to get back in the room.",
    points: [
      "S — See It. Notice the shift from connecting to protecting.",
      "P — Pause & Probe. Stop the momentum. Take a breath.",
      "A — Acknowledge. Before you defend, validate.",
      "R — Reconnect. Make a bid for repair.",
      "K — Kindle. After the storm, fan the ember."
    ]
  },
  {
    title: "Critter Brain vs. CEO Brain",
    subtitle: "The two minds running your marriage.",
    desc: "Your Critter Brain is like a smoke alarm—quick to react, but terrible at distinguishing between burnt toast and a house fire. Your CEO Brain is the thoughtful part of you. We teach you to recognize the moment your Critter takes over.",
    points: []
  },
  {
    title: "The Zones of Resilience",
    subtitle: "A shared language for the emotional weather inside your system.",
    desc: "Imagine if you could instantly communicate your emotional state. The Zones replace blame with biology.",
    points: [
      "Green Zone — Safe and connected.",
      "Yellow Zone — Activated and anxious.",
      "Red Zone — Fight or flight.",
      "Blue Zone — Shutdown and collapse."
    ]
  },
  {
    title: "The 90-Second Wave",
    subtitle: "The neurological truth that changes arguments.",
    desc: "From a neurochemical standpoint, an emotion lasts about 90 seconds. The reason arguments last hours is because we keep re-triggering it. We teach you to ride the initial surge without adding fuel.",
    points: []
  },
  {
    title: "The 7 Core Wounds",
    subtitle: "The invisible injuries your marriage keeps bumping into.",
    desc: "Beneath every overreaction, there's usually an older wound trying to protect itself. When your partner brushes against it, your Critter Brain reacts. Understanding core wounds gives your partner a map of places to tread gently.",
    points: [
      "Abandonment, Rejection, Unworthiness",
      "Betrayal, Neglect, Shame, Powerlessness"
    ]
  }
];

export default function Frameworks() {
  usePageMeta('Frameworks', 'Discover the SPARK Method, Zones of Resilience, 90-Second Wave, and Core Wounds — the science-backed frameworks behind Healing Hearts.');
  const container = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.fw-header', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.2
      });

      const items = gsap.utils.toArray('.fw-item');
      items.forEach((item) => {
        gsap.from(item, {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
          }
        });
      });
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={container} className="bg-background min-h-screen pt-40 pb-24 px-6 md:px-16 overflow-hidden">
      
      {/* Header */}
      <section className="max-w-4xl mx-auto text-center mb-32">
        <h1 className="fw-header font-sans font-bold text-5xl md:text-7xl lg:text-8xl tracking-tighter text-primary leading-none mb-6">
          Proprietary methods you won't find <br className="hidden md:block"/>
          <span className="font-drama italic text-accent font-normal">anywhere else.</span>
        </h1>
        <h2 className="fw-header font-sans text-xl md:text-2xl text-textDark/70 max-w-3xl mx-auto leading-relaxed">
          Because we built them from lived experience and hard science. These aren't theories. They're tools.
        </h2>
      </section>

      {/* Frameworks List */}
      <section className="max-w-5xl mx-auto space-y-16">
        {frameworks.map((fw, idx) => (
          <div key={idx} className="fw-item bg-white border border-black/5 rounded-[3rem] p-10 md:p-16 shadow-xl flex flex-col md:flex-row gap-10 md:gap-16 items-start">
            
            <div className="md:w-1/3">
              <div className="w-16 h-16 rounded-full bg-primary text-accent flex items-center justify-center font-mono text-2xl mb-8">
                {String(idx + 1).padStart(2, '0')}
              </div>
              <h3 className="font-sans font-bold text-3xl md:text-4xl text-primary leading-tight mb-4">{fw.title}</h3>
              <p className="font-mono text-xs text-accent uppercase tracking-widest leading-relaxed">{fw.subtitle}</p>
            </div>

            <div className="md:w-2/3 space-y-6 pt-4 md:pt-24 md:border-l border-black/10 md:pl-16">
              <p className="font-sans text-lg md:text-xl text-textDark/80 leading-relaxed font-medium">
                {fw.desc}
              </p>
              
              {fw.points.length > 0 && (
                <ul className="space-y-4 font-sans text-textDark/60 mt-8">
                  {fw.points.map((point, p_idx) => (
                    <li key={p_idx} className="flex gap-4">
                      <span className="text-accent">—</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        ))}
      </section>

    </main>
  );
}
