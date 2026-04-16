import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Shield, Heart, Brain, Sparkles, ArrowRight } from 'lucide-react'
import { OrganicDivider } from '@scoria/ui'
import usePageMeta from '../hooks/usePageMeta'

/* ------------------------------------------------------------------ */
/*  ConferenceHome — lightweight expo landing page                     */
/*  Designed for QR code scans at Be Healthy Utah (April 17-18, 2026) */
/*  Target: <350KB, <2s load on congested cellular                    */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Email capture form — single field, autocomplete, inline feedback  */
/* ------------------------------------------------------------------ */
function CaptureForm({ source = 'conference' }) {
  const [state, setState] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const email = new FormData(e.target).get('email')
    if (!email) return

    setState('loading')
    try {
      const res = await fetch('/api/spark-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: `expo-${source}`,
          utm_source: 'expo',
          utm_medium: 'qr',
          utm_campaign: 'be-healthy-utah',
        }),
      })
      setState(res.ok ? 'success' : 'error')
    } catch {
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="py-4 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={28} className="text-primary" />
        </div>
        <p className="font-outfit font-semibold text-lg text-foreground">
          You're in!
        </p>
        <p className="font-sans text-sm mt-1 text-foreground/60">
          Check your inbox — Day 1 is on its way.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
      <div className="flex flex-col gap-3">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          name="email"
          placeholder="Your email"
          required
          className="w-full h-14 rounded-xl border border-foreground/15 px-4 font-sans text-base
                     text-foreground bg-white placeholder:text-foreground/40
                     focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="w-full h-14 rounded-xl font-outfit font-semibold text-white text-base
                     bg-accent transition-all duration-200 hover:bg-accent/90 hover:shadow-lg
                     active:scale-[0.98] disabled:opacity-70"
        >
          {state === 'loading' ? 'Sending…' : 'Start my free challenge'}
        </button>
      </div>
      {state === 'error' && (
        <p className="text-red-500 text-sm text-center mt-2">
          Something went wrong. Try again?
        </p>
      )}
      <p className="text-center font-sans text-xs mt-3 text-foreground/50">
        Free. 7 days. No credit card. Unsubscribe anytime.
      </p>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/*  Sticky mobile CTA bar                                             */
/*  pb-safe ensures it doesn't cover the Layout footer.              */
/* ------------------------------------------------------------------ */
function StickyBar() {
  const scrollToSignup = () => {
    document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 py-3 lg:hidden"
      style={{ background: 'linear-gradient(to top, white 80%, transparent)' }}
    >
      <button
        onClick={scrollToSignup}
        className="w-full rounded-xl font-outfit font-semibold text-white text-sm py-3
                   bg-accent shadow-lg active:scale-[0.98] transition-transform"
      >
        Start the free 7-day challenge
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Testimonials data — named, with context                           */
/* ------------------------------------------------------------------ */
const TESTIMONIALS = [
  {
    quote:
      "I didn't realize I'd been in freeze mode for years. By day 3, I had my first real conversation with my husband in longer than I can remember.",
    name: 'Rachel M.',
    detail: 'Married 11 years',
  },
  {
    quote:
      'Trisha has a way of making hard things feel possible. We tried Day 1 that night and it cracked something open between us.',
    name: 'David & Carla P.',
    detail: 'Together 6 years',
  },
  {
    quote:
      'Simple, science-backed, and deeply human. This challenge was the reset button we desperately needed.',
    name: 'Jessica K.',
    detail: 'Married 14 years',
  },
]

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function ConferenceHome() {
  usePageMeta(
    'The Secret Behind How Your Brain Hijacks Relationships',
    'Relationship stress is a health crisis. Discover how to tame your critter brain with science-backed tools. Start the free 7-Day Spark Challenge.',
    {
      ogTitle: 'Free 7-Day Spark Challenge — Healing Hearts',
      ogDescription: 'Meet Jeff & Trisha Jamison at Be Healthy Utah. Discover neuroscience-backed tools to move from disconnection to deep connection. Start the free 7-Day Spark Challenge.',
      ogUrl: 'https://healingheartscourse.com/conference',
    }
  )

  return (
    <div className="w-full bg-background">

      {/* ============================================================ */}
      {/* HERO — Talk echo + email capture                             */}
      {/* Split layout: text left, Trisha photo right (visible mobile) */}
      {/* ============================================================ */}
      <section className="relative w-full min-h-[85dvh] flex items-center overflow-hidden mt-[-6rem] pt-[6rem]">
        {/* Soft radial wash matching site brand */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse at 15% 30%, oklch(96% 0.018 200) 0%, transparent 55%), ' +
              'radial-gradient(ellipse at 85% 75%, oklch(96% 0.012 30) 0%, transparent 45%)',
          }}
        />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Text + CTA */}
            <div className="flex flex-col items-start text-left gap-5">
              {/* Conference badge */}
              <span className="inline-flex items-center gap-1.5 font-outfit text-xs font-medium tracking-wide uppercase rounded-full px-3 py-1 bg-primary/10 text-primary">
                Be Healthy Utah 2026
              </span>

              <h1 className="flex flex-col gap-2">
                <span className="font-drama italic text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.1] tracking-tight text-foreground">
                  Your brain learned to
                  <br />protect you.
                </span>
                <span className="font-outfit font-bold text-2xl md:text-3xl text-primary">
                  Now it's getting in the way.
                </span>
              </h1>

              <p className="font-sans text-base md:text-lg leading-relaxed max-w-[44ch] text-foreground/65">
                That stress response hijacking your closest relationship?
                It has a name — your Critter Brain. And you can learn to
                tame it in 7 days.
              </p>

              {/* Form — above fold on mobile */}
              <div id="signup" className="w-full mt-2">
                <CaptureForm source="hero" />
              </div>
            </div>

            {/* Trisha photo — visible on all screen sizes */}
            <div className="flex justify-center">
              <div className="relative w-[300px] sm:w-[340px] lg:w-[380px]">
                {/* Offset shadow layer */}
                <div
                  className="absolute inset-0 rounded-3xl bg-primary/10"
                  aria-hidden="true"
                  style={{ transform: 'translate(10px, 12px) rotate(2deg)' }}
                />
                <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/5]">
                  <img
                    src="/images/team/trisha.jpg"
                    alt="Trisha Jamison — Healing Hearts founder and keynote speaker"
                    className="w-full h-full object-cover object-top"
                    loading="eager"
                    width="380"
                    height="475"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wave into discovery section */}
      <OrganicDivider variant="wave-2" fillClass="text-white" />

      {/* ============================================================ */}
      {/* WHAT YOU'LL DISCOVER — 4 feature cards                       */}
      {/* ============================================================ */}
      <section className="w-full py-16 lg:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <h2 className="font-drama italic text-2xl md:text-3xl text-center mb-10 text-foreground">
            In 7 days, you'll understand why you fight — and how to stop.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                icon: Brain,
                title: 'Meet your Critter Brain',
                desc: 'The part of your nervous system that triggers fight, flight, or freeze — even with the person you love most.',
              },
              {
                icon: Shield,
                title: 'Ride the 90-Second Wave',
                desc: 'Learn to pause in the exact moment your body wants to react. The flood peaks and passes in 90 seconds.',
              },
              {
                icon: Heart,
                title: 'Reconnect without a script',
                desc: 'No rehearsed lines. Just simple, body-based tools that help you come back to each other after a shutdown.',
              },
              {
                icon: Sparkles,
                title: 'One small step each day',
                desc: 'A daily micro-challenge delivered to your inbox. Try it with your partner tonight — results by morning.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex gap-4 p-5 rounded-2xl bg-background"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/12 flex items-center justify-center mt-0.5">
                  <Icon size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-outfit font-semibold text-sm mb-1 text-foreground">
                    {title}
                  </h3>
                  <p className="font-sans text-sm leading-relaxed text-foreground/60">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave into testimonials */}
      <OrganicDivider variant="wave-2" fillClass="text-primary" />

      {/* ============================================================ */}
      {/* SOCIAL PROOF — 3 named testimonials, site-standard pattern   */}
      {/* ============================================================ */}
      <section className="w-full py-14 lg:py-16 bg-primary">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <h2 className="font-drama italic text-2xl md:text-3xl text-center mb-10 text-white/90">
            Voices from the challenge
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Featured testimonial — wider on desktop */}
            <div className="lg:col-span-2 bg-white/10 rounded-3xl p-8 flex flex-col justify-between">
              <p className="font-drama italic text-xl md:text-2xl text-white/95 leading-snug mb-6">
                "{TESTIMONIALS[0].quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-outfit font-semibold text-sm text-white">
                  {TESTIMONIALS[0].name[0]}
                </div>
                <div>
                  <p className="font-outfit font-medium text-sm text-white">
                    {TESTIMONIALS[0].name}
                  </p>
                  <p className="font-sans text-xs uppercase tracking-widest text-white/50">
                    {TESTIMONIALS[0].detail}
                  </p>
                </div>
              </div>
            </div>

            {/* Stacked pair */}
            <div className="flex flex-col gap-5">
              {TESTIMONIALS.slice(1).map((t) => (
                <div
                  key={t.name}
                  className="bg-white/10 rounded-3xl p-6 flex-1 flex flex-col justify-between"
                >
                  <p className="font-drama italic text-base text-white/90 leading-snug mb-4">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-outfit text-xs text-white">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-outfit font-medium text-xs text-white">
                        {t.name}
                      </p>
                      <p className="font-sans text-xs uppercase tracking-widest text-white/50">
                        {t.detail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Wave into credentials */}
      <OrganicDivider variant="wave-2" fillClass="text-background" />

      {/* ============================================================ */}
      {/* CREDENTIALS — Trisha + Jeff, compact                          */}
      {/* ============================================================ */}
      <section className="w-full py-14 lg:py-16 bg-background">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Photo */}
            <div className="flex-shrink-0">
              <img
                src="/images/team/jeff-and-trisha.jpg"
                alt="Jeff and Trisha Jamison"
                className="w-28 h-28 rounded-2xl object-cover shadow-md"
                loading="lazy"
                width="112"
                height="112"
              />
            </div>

            {/* Bio */}
            <div>
              <h3 className="font-outfit font-bold text-lg mb-2 text-foreground">
                Trisha & Dr. Jeff Jamison
              </h3>
              <p className="font-sans text-sm leading-relaxed mb-3 text-foreground/65">
                Trisha is a relationship coach who lived this work — her own marriage
                crisis became the foundation for the Healing Hearts program. Together
                with her husband Jeff, a board-certified family physician (DO, FAAFP),
                they bridge the gap between what your body feels and what your
                relationship needs.
              </p>
              <p className="font-sans text-xs text-primary">
                8 modules · 32 milestones · 36 coaching sessions · Backed by nervous system science
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wave into final CTA */}
      <OrganicDivider variant="wave-2" fillClass="text-white" />

      {/* ============================================================ */}
      {/* FINAL CTA — Repeat form                                      */}
      {/* ============================================================ */}
      <section className="w-full py-16 lg:py-20 bg-white">
        <div className="max-w-md mx-auto px-6 sm:px-10 text-center">
          <h2 className="font-drama italic text-2xl md:text-3xl mb-3 text-foreground">
            Ready to meet your Critter Brain?
          </h2>
          <p className="font-sans text-base mb-6 text-foreground/60">
            7 days. One small step each morning. Try it with your partner tonight.
          </p>
          <CaptureForm source="bottom" />
        </div>
      </section>

      {/* ============================================================ */}
      {/* RESCUE KIT CTA — Secondary, below-fold                       */}
      {/* "Want tools you can use tonight?"                            */}
      {/* ============================================================ */}
      <section className="w-full py-10 lg:py-12 bg-white border-t border-foreground/8">
        <div className="max-w-md mx-auto px-6 sm:px-10">
          <div className="rounded-2xl bg-background p-6 text-center">
            <p className="font-outfit font-semibold text-sm text-foreground/50 uppercase tracking-wide mb-2">
              Want tools you can use tonight?
            </p>
            <h3 className="font-drama italic text-xl text-foreground mb-2">
              The Conflict Rescue Kit
            </h3>
            <p className="font-sans text-sm text-foreground/60 mb-4 leading-relaxed">
              5 de-escalation tools for couples in a hard moment — instant
              access after purchase.
            </p>
            <Link
              to="/rescue-kit"
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 font-outfit font-semibold text-sm text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm"
            >
              Get the Rescue Kit · $39 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom padding so sticky bar doesn't obscure content on mobile */}
      <div className="h-20 lg:hidden" />

      {/* Sticky mobile CTA bar */}
      <StickyBar />
    </div>
  )
}
