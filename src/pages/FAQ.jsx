import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Plus, Minus } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

const faqData = [
  {
    q: "Is this therapy?",
    a: "No. We're a coaching program, not a licensed therapy practice. Our content is clinically informed—grounded in research from Gottman, polyvagal theory, and attachment science—but we're not providing clinical treatment. If one or both of you are dealing with untreated mental health conditions, active addiction, or domestic violence, we strongly encourage professional therapy as a first step."
  },
  {
    q: "Is this a Christian program?",
    a: "Our faith shapes everything we do. But if you're picturing someone quoting Bible verses at you while ignoring the real-world complexity of your marriage, that's not us. We integrate faith the way it was designed to work—as a foundation for grace, accountability, and hope."
  },
  {
    q: "Do we both have to participate?",
    a: "Ideally, yes. This program is built for couples. That said, we've seen remarkable things happen when even one partner begins doing the work. When you change your patterns, the dynamics of the relationship have to shift. If your spouse is hesitant, start yourself. Change is contagious."
  },
  {
    q: "How long does the full program take?",
    a: "The complete Healing Hearts program has 8 modules with 32 milestones and 36 coaching sessions. Each module moves at your pace — some couples take a few weeks, others sit with one for six weeks because it's touching something deep. We'd rather you go slow and integrate than rush through and forget."
  },
  {
    q: "What if we're already in a good place? Is this only for crisis?",
    a: "Some of our most enthusiastic couples came in with strong marriages that they wanted to make extraordinary. The frameworks we teach aren't crisis tools. They're life tools. Think of it as preventive medicine for your relationship."
  },
  {
    q: "What's the difference between the full program and standalone packages?",
    a: "The standalone packages are focused deep-dives into specific areas—conflict, communication, intimacy, finances. The full program weaves all of these together into a comprehensive journey. The packages are entry points. The full program is the transformation."
  },
  {
    q: "Can we work with you directly?",
    a: "Yes. We offer one-on-one coaching sessions for couples who want personalized guidance as they move through the program. These sessions are available as an add-on."
  },
  {
    q: "What if we start and it feels too hard?",
    a: "It will feel hard at times. That's not a sign you're failing—it's a sign you're touching something real. We've designed the program with built-in pacing, and permission to slow down. You're not doing this alone."
  }
];

export default function FAQ() {
  usePageMeta('FAQ', 'Common questions about Healing Hearts couples coaching — is this therapy, do both partners need to participate, how long does it take, and more.');
  const container = useRef(null);
  const [openIdx, setOpenIdx] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.faq-header', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.2
      });
      
      gsap.from('.faq-item', {
        x: -40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: 'power3.out',
        delay: 0.4
      });
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={container} className="bg-background min-h-screen pt-40 pb-24 px-6 md:px-16">
      
      <section className="max-w-4xl mx-auto text-center mb-24">
        <h1 className="faq-header font-sans font-bold text-5xl md:text-7xl tracking-tighter text-primary leading-none mb-6">
          Frequently Asked <span className="font-drama italic text-accent font-normal">Questions</span>
        </h1>
        <p className="faq-header font-sans text-xl text-textDark/70 max-w-2xl mx-auto">
          Everything you need to know about the Healing Hearts approach.
        </p>
      </section>

      <section className="max-w-4xl mx-auto space-y-4">
        {faqData.map((faq, idx) => (
          <div 
            key={idx} 
            className={`faq-item border border-black/5 rounded-[2rem] overflow-hidden transition-all duration-500 cursor-pointer ${openIdx === idx ? 'bg-primary text-background shadow-xl' : 'bg-white hover:bg-black/5'}`}
            onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
          >
            <div className="p-8 flex items-center justify-between gap-6">
              <h3 className={`font-sans font-bold text-xl md:text-2xl leading-tight ${openIdx === idx ? 'text-accent' : 'text-primary'}`}>
                {faq.q}
              </h3>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${openIdx === idx ? 'bg-white/10 text-white' : 'bg-black/5 text-primary'}`}>
                {openIdx === idx ? <Minus size={20} /> : <Plus size={20} />}
              </div>
            </div>
            
            <div 
              className="px-8 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              style={{ maxHeight: openIdx === idx ? '400px' : '0px', paddingBottom: openIdx === idx ? '2rem' : '0' }}
            >
              <p className="font-sans text-lg text-white/70 leading-relaxed border-t border-white/10 pt-6">
                {faq.a}
              </p>
            </div>
          </div>
        ))}
      </section>

    </main>
  );
}
