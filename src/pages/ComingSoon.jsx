import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { MagneticButton } from '../components/Layout';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ComingSoon = () => {
  usePageMeta('Coming Soon', 'This feature is on the way. Try our free 7-Day Spark Challenge in the meantime.');
  const ref = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.cs-reveal', { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1.2, stagger: 0.12, ease: 'power3.out',
      });
      gsap.to('.float-heart', {
        y: -15, duration: 3, ease: 'power1.inOut', repeat: -1, yoyo: true,
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 30% 40%, rgba(17,145,177,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(185,106,95,0.06) 0%, transparent 60%), linear-gradient(180deg, #fbf3e4 0%, #faf9f6 50%, #ffffff 100%)',
        }}
        aria-hidden="true"
      />

      {/* Floating hearts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <Heart className="float-heart absolute top-[20%] left-[12%] w-8 h-8 text-primary/[0.06] fill-primary/[0.04]" />
        <Heart className="float-heart absolute top-[30%] right-[15%] w-6 h-6 text-accent/[0.08] fill-accent/[0.05]" style={{ animationDelay: '1s' }} />
        <Heart className="float-heart absolute bottom-[25%] left-[20%] w-10 h-10 text-primary/[0.05] fill-primary/[0.03]" style={{ animationDelay: '2s' }} />
        <Heart className="float-heart absolute bottom-[35%] right-[10%] w-7 h-7 text-accent/[0.06] fill-accent/[0.04]" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center px-6">
        {/* Icon */}
        <div className="cs-reveal inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-8">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>

        <h1 className="cs-reveal font-drama italic text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] mb-6">
          Something Beautiful<br />Is Coming
        </h1>

        <p className="cs-reveal text-lg md:text-xl text-foreground/60 max-w-lg mx-auto leading-relaxed mb-4">
          We're putting the finishing touches on this part of the experience.
          Great things take time — and we want this to be great for you.
        </p>

        <p className="cs-reveal text-base text-foreground/50 max-w-md mx-auto leading-relaxed mb-10">
          In the meantime, try our free 7-Day Spark Challenge — it's the perfect
          way to start reconnecting with your partner right now.
        </p>

        <div className="cs-reveal flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/spark-challenge">
            <MagneticButton className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-primary/90 transition-colors">
              Try the Free Challenge
              <ArrowRight className="w-5 h-5" />
            </MagneticButton>
          </Link>
          <Link
            to="/team"
            className="text-primary/70 hover:text-primary font-medium transition-colors underline underline-offset-4"
          >
            Meet the team
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ComingSoon;
