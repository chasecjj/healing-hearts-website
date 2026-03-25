import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Calendar, Shield, Clock, Heart } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const CALENDLY_URL = 'https://calendly.com/trishajamison/30min';

export default function BookCall() {
  usePageMeta(
    'Schedule a Conversation | Healing Hearts',
    'Book a free conversation with Jeff and Trisha to explore whether Healing Hearts is right for you.'
  );
  const containerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.reveal-el', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power3.out' });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  return (
    <div ref={containerRef} className="w-full bg-background pt-32 md:pt-48 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="reveal-el mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="reveal-el font-drama italic text-4xl md:text-6xl text-primary mb-4">
            Schedule a Conversation
          </h1>
          <p className="reveal-el font-sans text-lg text-foreground/70 max-w-xl mx-auto leading-relaxed">
            This is not a sales call. It is a chance for Jeff and Trisha to hear your story
            and for you to experience what coaching with us feels like.
          </p>
        </div>

        <div className="reveal-el flex flex-wrap justify-center gap-8 mb-12">
          <div className="flex items-center gap-2 text-foreground/60 font-sans text-sm">
            <Clock className="w-4 h-4 text-primary" /> 30 minutes
          </div>
          <div className="flex items-center gap-2 text-foreground/60 font-sans text-sm">
            <Heart className="w-4 h-4 text-primary" /> No pressure, no pitch
          </div>
          <div className="flex items-center gap-2 text-foreground/60 font-sans text-sm">
            <Shield className="w-4 h-4 text-primary" /> Completely confidential
          </div>
        </div>

        <div className="reveal-el">
          <div
            className="calendly-inline-widget rounded-3xl overflow-hidden shadow-lg"
            data-url={`${CALENDLY_URL}?hide_gdpr_banner=1&background_color=fafafa&text_color=2D2D2D&primary_color=1191B1`}
            style={{ minWidth: '320px', height: '700px' }}
          />
        </div>

        <div className="reveal-el text-center mt-8">
          <p className="font-sans text-sm text-foreground/50">
            Having trouble with the calendar?{' '}
            <a href="mailto:hello@healingheartscourse.com?subject=Consultation%20Request" className="text-primary underline">
              Email us directly
            </a>{' '}
            and we will find a time that works.
          </p>
        </div>
      </div>
    </div>
  );
}
