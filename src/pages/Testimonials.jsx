import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import usePageMeta from '../hooks/usePageMeta';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "We were two weeks from filing when we found Healing Hearts. I'm not exaggerating when I say the SPARK Method saved us. Not because it was magic—but because it gave us something to DO when everything felt hopeless.",
    author: "K. & R.",
    meta: "Married 11 years"
  },
  {
    quote: "The Zones of Resilience concept was a game-changer for us. My husband is a physician and he'd come home in Blue Zone every night—completely shut down. I used to take it personally. Now I understand it's his nervous system, not his heart.",
    author: "S.",
    meta: "Physician's spouse, married 9 years"
  },
  {
    quote: "I always thought I was 'the logical one' in our marriage. Turns out I was just in Blue Zone so often that I'd convinced myself numbness was rationality. Learning about my Critter Brain cracked me open in the best way.",
    author: "T.",
    meta: "Married 16 years"
  },
  {
    quote: "What I love about this program is that it doesn't make you feel broken. Jeff and Trisha talk about patterns like they're outdated software, not character flaws. That distinction matters.",
    author: "L. & M.",
    meta: "Married 7 years"
  },
  {
    quote: "The Core Wounds module hit different. I finally understood why a simple comment from my wife about the dishes could send me into a spiral. It wasn't about the dishes. It was about the Unworthiness wound I've been carrying since I was eight.",
    author: "J.",
    meta: "Married 12 years"
  }
];

export default function Testimonials() {
  usePageMeta('Testimonials', 'Real stories from couples who transformed their relationships with Healing Hearts coaching and the SPARK Method.');
  const container = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.test-header', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.2
      });

      const cards = gsap.utils.toArray('.test-card');
      cards.forEach((card) => {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
          }
        });
      });
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={container} className="bg-primary text-background min-h-screen pt-40 pb-24 px-6 md:px-16 overflow-hidden">
      <section className="max-w-4xl mx-auto text-center mb-24">
        <div className="test-header font-mono text-white/70 text-sm tracking-widest uppercase mb-8 border-b border-white/20 pb-4 inline-block">
          Stories of Healing
        </div>
        <h1 className="test-header font-sans font-bold text-5xl md:text-7xl tracking-tighter text-background leading-none mb-6">
          Real couples. Real struggles. <span className="font-drama italic text-accent font-normal">Real transformation.</span>
        </h1>
        <p className="test-header font-sans text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
          We don't share these stories to sell you anything. We share them because when you're in the darkest season of your marriage, sometimes the most powerful thing you can hear is that someone else made it through.
        </p>
      </section>

      <section className="max-w-6xl mx-auto columns-1 md:columns-2 gap-8 space-y-8">
        {testimonials.map((test, idx) => (
          <div key={idx} className="test-card break-inside-avoid bg-white/5 border border-white/10 rounded-[3rem] p-10 md:p-14 hover:bg-white/10 transition-colors">
            <div className="font-drama text-6xl text-accent opacity-50 leading-none h-10">"</div>
            <p className="font-sans text-xl md:text-2xl text-white/90 leading-relaxed mb-10 font-medium">
              {test.quote}
            </p>
            <div className="flex items-center gap-4 border-t border-white/10 pt-6">
              <div className="w-12 h-12 rounded-full bg-accent text-primary flex items-center justify-center font-bold font-sans">
                {test.author.charAt(0)}
              </div>
              <div>
                <p className="font-sans font-bold text-background leading-tight">{test.author}</p>
                <p className="font-mono text-[10px] text-accent uppercase tracking-widest">{test.meta}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="scroll-trigger max-w-3xl mx-auto text-center mt-24 mb-8">
        <h2 className="font-drama italic text-3xl md:text-5xl text-primary mb-4">
          Ready to Write Your Own Story?
        </h2>
        <p className="font-sans text-lg text-foreground/70 mb-8 max-w-xl mx-auto">
          Every couple on this page started exactly where you are now. The only difference
          is they decided to take the next step.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/apply"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-accent text-white font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Apply for Healing Hearts
          </Link>
          <Link
            to="/spark-challenge"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-neutral-100 text-foreground font-medium hover:bg-neutral-200 transition-all"
          >
            Not ready yet? Try the Free Challenge
          </Link>
        </div>
      </section>

    </main>
  );
}
