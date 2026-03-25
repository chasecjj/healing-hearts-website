import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Radio, Clock, ArrowRight } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';
import { supabase } from '../lib/supabase';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const formatDate = (iso) =>
  new Date(iso).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Denver',
    timeZoneName: 'short',
  });

export default function WebinarLive() {
  usePageMeta(
    'Live Workshop | Healing Hearts',
    'Watch the Healing Hearts live workshop.'
  );

  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [webinar, setWebinar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWebinar() {
      const { data } = await supabase
        .from('webinars')
        .select('*')
        .in('status', ['scheduled', 'live'])
        .order('starts_at', { ascending: true })
        .limit(1)
        .single();

      if (!data) {
        navigate('/webinar', { replace: true });
        return;
      }

      setWebinar(data);
      setLoading(false);
    }

    fetchWebinar();
  }, [navigate]);

  useEffect(() => {
    if (loading || !webinar || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.reveal-el',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [loading, webinar]);

  if (loading) {
    return (
      <div className="w-full bg-background pt-32 md:pt-48 pb-24 text-center">
        <div className="w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!webinar) return null;

  // State 1: Webinar is LIVE
  if (webinar.status === 'live') {
    return (
      <div ref={containerRef} className="w-full bg-background pt-28 md:pt-40 pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="reveal-el flex items-center justify-center gap-2 mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="font-sans text-sm font-medium text-red-600 uppercase tracking-wide">
              Live Now
            </span>
          </div>

          <h1 className="reveal-el font-drama italic text-3xl md:text-5xl text-primary text-center mb-8">
            Healing Hearts Live Workshop
          </h1>

          <div className="reveal-el">
            <iframe
              src={webinar.riverside_audience_url}
              className="w-full rounded-2xl shadow-lg"
              style={{ height: '70vh', minHeight: '500px' }}
              allow="camera; microphone; fullscreen; display-capture"
              allowFullScreen
              title="Healing Hearts Live Workshop"
            />
          </div>

          <div className="reveal-el text-center mt-6">
            <p className="font-sans text-sm text-foreground/50">
              Having trouble?{' '}
              <a
                href={webinar.riverside_audience_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Open in a new tab
              </a>
            </p>
          </div>

          <div className="reveal-el text-center mt-10">
            <p className="font-sans text-foreground/60 mb-4">
              After the workshop:
            </p>
            <a
              href="/apply"
              className="inline-flex items-center gap-2 font-sans text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Apply for Healing Hearts <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Webinar is SCHEDULED (not yet live)
  return (
    <div ref={containerRef} className="w-full bg-background pt-32 md:pt-48 pb-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="reveal-el mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h1 className="reveal-el font-drama italic text-4xl md:text-5xl text-primary mb-6">
          The Workshop Hasn't Started Yet
        </h1>

        <p className="reveal-el font-sans text-lg text-foreground/70 leading-relaxed mb-2">
          We go live on:
        </p>

        <p className="reveal-el font-sans text-xl font-medium text-foreground mb-8">
          {formatDate(webinar.starts_at)}
        </p>

        <p className="reveal-el font-sans text-foreground/60 mb-10">
          Come back at that time, or we'll send you an email reminder.
        </p>

        <div className="reveal-el">
          <a
            href="/webinar"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-sans font-medium rounded-full hover:bg-primary/90 transition-colors"
          >
            <Radio className="w-4 h-4" />
            Register for the Workshop
          </a>
        </div>
      </div>
    </div>
  );
}
