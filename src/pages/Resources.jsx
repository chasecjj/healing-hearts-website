import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '../components/Layout';
import { ArrowRight, Download } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

gsap.registerPlugin(ScrollTrigger);

export default function Resources() {
  usePageMeta('Resources', 'Free relationship guides, downloadable tools, and articles grounded in neuroscience and attachment theory.');
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Header animations
      gsap.fromTo('.resources-reveal',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power3.out' }
      );

      const cards = gsap.utils.toArray('.article-card');
      cards.forEach((card) => {
        gsap.fromTo(card,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%"
            }
          }
        )
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const articles = [
    {
      title: "Why Your Arguments Last Hours When the Emotion Only Lasts 90 Seconds",
      desc: "The neuroscience behind the 90-Second Wave and why most couples accidentally extend their own suffering."
    },
    {
      title: "The Critter Brain Guide: What Your Smoke Alarm Is Really Reacting To",
      desc: "An accessible deep-dive into polyvagal theory and why your nervous system treats tone of voice like a survival threat."
    },
    {
      title: "You’re Not “Too Sensitive.” You’re Carrying a Core Wound.",
      desc: "How childhood injuries create adult triggers—and why the partner who says “you’re overreacting” is usually bumping into a wound they can’t see."
    },
    {
      title: "The Roommate Marriage: When You’re Technically Together but Emotionally Alone",
      desc: "Why emotional distance is more dangerous than conflict, and the subtle signs your marriage has drifted from partnership to coexistence."
    },
    {
      title: "For the Physician’s Spouse: When Your Partner Heals Everyone but You",
      desc: "A letter to the partners of physicians who are carrying the weight of a marriage that looks perfect from the outside and feels hollow."
    },
    {
      title: "Manipulation Isn’t Always Malicious: What Most People Get Wrong",
      desc: "Why manipulation is usually a defense, not a decision—and how understanding that distinction changes everything about how you respond."
    }
  ];

  const downloads = [
    { name: "The 90-Second Wave Guide", desc: "A printable one-page reference for riding out emotional floods." },
    { name: "The Connection Map", desc: "Identify which Zone you and your partner default to under stress." },
    { name: "Know Your Blueprint", desc: "A personality + attachment discovery worksheet for couples." },
    { name: "The SPARK Pact", desc: "A one-page printable agreement to use SPARK during your next conflict." }
  ];

  return (
    <div ref={containerRef} className="w-full bg-background pt-32 md:pt-48 pb-24">
      
      {/* Header */}
      <section className="max-w-4xl mx-auto px-6 text-center mb-24">
        <p className="resources-reveal font-sans text-primary/60 tracking-widest uppercase text-sm mb-6">Blog & Resources</p>
        <h1 className="resources-reveal font-drama italic text-5xl md:text-7xl lg:text-8xl text-primary leading-tight mb-8">
          Honest conversations.
        </h1>
        <p className="resources-reveal font-sans text-foreground/80 md:text-xl leading-relaxed font-light mx-auto max-w-2xl">
          About the things most marriage content is afraid to say. Our resource library isn’t a content mill. It’s where we go deep on the science, the spirituality, and the raw reality of doing this work.
        </p>
      </section>

      {/* Free Downloads */}
      <section className="max-w-6xl mx-auto px-6 mb-32">
        <div className="bg-primary text-background rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px]"></div>
           <div className="relative z-10 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                 <h2 className="font-outfit font-bold text-4xl mb-4 text-background">Free Downloads</h2>
                 <p className="font-sans font-light text-background/80 max-w-xl">
                    Practical tools you can start using tonight. No commitment required.
                 </p>
              </div>
           </div>

           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              {downloads.map((item, idx) => (
                 <div key={idx} className="bg-background/10 backdrop-blur-sm p-6 rounded-3xl border border-background/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-background/20 transition-colors">
                    <div>
                       <h3 className="font-outfit font-bold text-lg mb-2">{item.name}</h3>
                       <p className="font-sans text-sm font-light text-background/70">{item.desc}</p>
                    </div>
                    <button
                       onClick={() => navigate('/coming-soon')}
                       className="flex-shrink-0 w-12 h-12 rounded-full bg-background/20 text-background flex items-center justify-center hover:bg-background hover:text-primary transition-colors border border-background/30"
                    >
                       <Download className="w-5 h-5" />
                    </button>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="font-outfit font-bold text-4xl text-primary">Featured Articles</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, idx) => (
            <div
              key={idx}
              className="article-card group bg-background p-8 rounded-[2rem] shadow-sm border border-primary/5 flex flex-col h-full hover:-translate-y-2 transition-transform duration-500 cursor-pointer"
              onClick={() => navigate('/coming-soon')}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/coming-soon')}
            >
               <h3 className="font-outfit font-bold text-xl text-primary mb-4 leading-snug group-hover:text-accent transition-colors">
                  {article.title}
               </h3>
               <p className="font-sans text-sm text-foreground/70 font-light leading-relaxed mb-8 flex-grow">
                  {article.desc}
               </p>
               <div className="flex items-center gap-2 text-accent font-sans text-sm font-medium mt-auto group-hover:translate-x-2 transition-transform">
                  Read Article <ArrowRight className="w-4 h-4" />
               </div>
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center">
           <MagneticButton
              className="bg-primary/5 text-primary hover:bg-primary hover:text-background px-10 py-4 rounded-full text-base font-medium transition-colors mx-auto"
              onClick={() => navigate('/coming-soon')}
           >
              Load More Articles
           </MagneticButton>
        </div>
      </section>

    </div>
  );
}
