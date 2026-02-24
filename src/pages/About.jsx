import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '../components/Layout';
import { Heart, Activity, RefreshCw, Link2, Target } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo('.about-reveal', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power3.out' }
      );
      
      // Image parallax
      gsap.to('.hero-image', {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
      
      // Story section fade ins
      const storyElements = gsap.utils.toArray('.story-content p');
      storyElements.forEach((el, index) => {
          gsap.fromTo(el, 
            { y: 30, opacity: 0 },
            { 
              y: 0, 
              opacity: 1, 
              duration: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: 'top 85%'
              }
            }
          );
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      {/* Hero */}
      <section className="relative w-full py-32 md:py-48 flex flex-col items-center justify-center overflow-hidden bg-background">
         <div className="absolute inset-x-0 bottom-0 h-[40dvh] hero-image" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1543807535-eceef0bc6599?q=80&w=2574&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center 40%', opacity: 0.15 }}></div>
         <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="about-reveal font-sans text-primary/60 tracking-widest uppercase text-sm mb-6">About Us</p>
          <h1 className="about-reveal font-drama italic text-5xl md:text-7xl lg:text-8xl text-primary leading-tight mb-8">
            We’re not experts who studied marriage.
          </h1>
          <h2 className="about-reveal font-outfit font-bold text-3xl md:text-5xl text-primary">
            We’re a marriage that studied its way back.
          </h2>
        </div>
      </section>

      {/* The Honest Version */}
      <section className="py-32 bg-[#F7F6F2] overflow-hidden relative">
         {/* Decorative blobbies */}
         <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] translate-x-1/2"></div>
         
        <div className="max-w-6xl mx-auto px-6 story-content">
          <div className="flex items-center gap-4 mb-16">
             <div className="h-px w-16 bg-accent"></div>
             <h3 className="font-outfit font-bold text-2xl tracking-wide text-primary uppercase">The Honest Version</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">
             <div className="order-last lg:order-first relative">
                {/* Image Placeholder wrapper */}
                <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-xl border border-primary/10">
                   <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10"></div>
                   <img 
                      src="https://images.unsplash.com/photo-1616016664949-0145c25dbcb7?q=80&w=1287&auto=format&fit=crop" 
                      alt="Jeff and Trisha Jamison" 
                      className="w-full h-full object-cover"
                   />
                </div>
                {/* Label box */}
                <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-background p-6 rounded-[2rem] shadow-lg border border-primary/5 z-20 hidden md:block max-w-[250px]">
                   <p className="font-outfit font-bold text-primary mb-1">Jeff & Trisha Jamison</p>
                   <p className="font-sans text-xs text-foreground/60 font-light">Founders & Guides at Healing Hearts</p>
                </div>
             </div>

             <div className="relative z-10">
                <blockquote className="border-l-4 border-accent pl-6 lg:pl-8 py-2 mb-12 relative">
                    <span className="absolute -top-6 -left-2 text-[4rem] text-accent/20 font-serif leading-none">"</span>
                    <p className="font-drama italic text-3xl md:text-4xl text-primary leading-[1.2]">
                        We didn’t set out to build a coaching program. We set out to save our own marriage.
                    </p>
                </blockquote>

                <div className="space-y-6">
                    <p className="font-sans text-foreground/80 text-lg leading-relaxed font-light">
                    There was a season when Jeff and Trisha looked like any other successful couple on the outside—careers moving, kids growing, calendar full. But behind closed doors, they were two strangers sharing a house. The kind of quiet disconnection that doesn’t shout but slowly suffocates.
                    </p>
                    <p className="font-sans text-foreground/80 text-lg leading-relaxed font-light">
                    Trisha felt invisible. Jeff felt criticized. And both of them were running survival patterns they’d carried since childhood without ever knowing it.
                    </p>
                    <p className="font-sans text-foreground/80 text-lg leading-relaxed font-light">
                    They didn’t just survive it. They studied it. They dug into the neuroscience of why their nervous systems hijacked every hard conversation. They learned why Trisha’s need for connection triggered Jeff’s impulse to withdraw. They discovered that their worst patterns weren’t character flaws—they were protection strategies written by a much younger version of themselves.
                    </p>
                    <p className="font-sans text-foreground/80 text-lg leading-relaxed font-light font-medium text-primary/80 pt-4">
                    Healing Hearts is what grew from the wreckage—and the rebuilding.
                    </p>
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* What We Believe (List) */}
      <section className="py-32 bg-background">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-outfit font-bold text-4xl md:text-5xl text-primary">What We Believe</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16 lg:gap-y-24">
            <div className="group">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                     <Activity className="w-6 h-6" />
                 </div>
                 <div className="text-accent font-mono text-sm tracking-widest px-3 py-1 bg-accent/5 rounded-full">01</div>
              </div>
              <h3 className="font-drama italic text-3xl text-primary mb-4">Your body holds the story your mind forgot.</h3>
              <p className="font-sans text-foreground/70 font-light leading-relaxed">
                Most couples try to think their way out of relationship pain. But your nervous system is faster than your thoughts, and it learned its lessons long before you could reason with it. Real change starts when you learn to work with your biology, not against it.
              </p>
            </div>
            
            <div className="group">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                     <Target className="w-6 h-6" />
                 </div>
                 <div className="text-accent font-mono text-sm tracking-widest px-3 py-1 bg-accent/5 rounded-full">02</div>
              </div>
              <h3 className="font-drama italic text-3xl text-primary mb-4">Every pattern made sense once.</h3>
              <p className="font-sans text-foreground/70 font-light leading-relaxed">
                The way you shut down, lash out, people-please, or disappear—none of it is random. Every pattern was a brilliant survival strategy for a younger version of you. We don’t shame your patterns. We honor what they protected. Then we gently help you outgrow them.
              </p>
            </div>

            <div className="group">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                     <RefreshCw className="w-6 h-6" />
                 </div>
                 <div className="text-accent font-mono text-sm tracking-widest px-3 py-1 bg-accent/5 rounded-full">03</div>
              </div>
              <h3 className="font-drama italic text-3xl text-primary mb-4">Repair is more important than perfection.</h3>
              <p className="font-sans text-foreground/70 font-light leading-relaxed">
                You’re going to hurt each other. That’s not the measure of your marriage. What matters is whether you can come back—whether rupture leads to deeper connection or just another wall. We teach repair as a skill, not a miracle.
              </p>
            </div>

            <div className="group">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                     <Link2 className="w-6 h-6" />
                 </div>
                 <div className="text-accent font-mono text-sm tracking-widest px-3 py-1 bg-accent/5 rounded-full">04</div>
              </div>
              <h3 className="font-drama italic text-3xl text-primary mb-4">Faith is the foundation, not the formula.</h3>
              <p className="font-sans text-foreground/70 font-light leading-relaxed">
                Our work is Christ-centered, but it’s never simplistic. We don’t believe “just pray harder” is a relationship strategy. We believe God designed the nervous system, wrote attachment into our DNA, and invites us into the honest, sometimes messy work of becoming safe for the people we love.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="py-24 bg-primary text-background rounded-[4rem] mb-12 mx-4 md:mx-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-background/5 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-outfit font-bold text-3xl md:text-4xl mb-8">Clinical Frameworks + Lived Experience</h2>
          <p className="font-sans text-background/80 text-lg leading-relaxed font-light mb-8 text-left md:text-center">
            Jeff and Trisha’s approach is informed by the work of Dr. John Gottman (relationship research), Dr. Stephen Porges (polyvagal theory), Dr. Sue Johnson (Emotionally Focused Therapy), and Dr. Andrew Huberman (neuroscience of emotional regulation)—translated through their own lived experience and refined through years of coaching real couples.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mt-16 border-t border-background/20 pt-16">
            <div>
              <h4 className="font-drama italic text-2xl text-accent mb-4">Trisha's Background</h4>
              <p className="font-sans text-background/70 font-light text-sm leading-relaxed">
                Trisha brings a background in healthcare and a deep understanding of how high-stress, high-performance environments erode intimacy—particularly in physician marriages, where emotional detachment becomes a survival skill that follows you home.
              </p>
            </div>
            <div>
              <h4 className="font-drama italic text-2xl text-accent mb-4">Jeff's Background</h4>
              <p className="font-sans text-background/70 font-light text-sm leading-relaxed">
                Jeff brings strategic clarity, a gift for frameworks, and the rare willingness to talk honestly about the ways men learn to armor themselves against vulnerability.
              </p>
            </div>
          </div>
          
          <div className="mt-20 flex justify-center">
             <MagneticButton className="bg-background text-primary px-10 py-4 rounded-full text-sm font-bold shadow-xl">
               Work With Us
             </MagneticButton>
          </div>
        </div>
      </section>

    </div>
  );
}
