import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Shield, Heart, Brain, Sparkles } from 'lucide-react'
import usePageMeta from '../hooks/usePageMeta'

/* ------------------------------------------------------------------ */
/*  ConferenceHome — lightweight expo landing page                     */
/*  Designed for QR code scans at Be Healthy Utah (April 17-18, 2026) */
/*  Target: <350KB, <2s load on congested cellular                    */
/*  Research: Projects/healing-hearts/research/2026-03-26-conference-  */
/*            landing-page-research.md                                */
/* ------------------------------------------------------------------ */

const P = {
  teal: '#1191B1',
  tealDark: '#0D7A96',
  coral: '#B96A5F',
  cream: '#FAF4EA',
  warmWhite: '#FFFDF8',
  charcoal: '#2D2D2D',
  muted: '#6B7280',
}

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
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ backgroundColor: `${P.teal}15` }}
        >
          <CheckCircle2 size={28} color={P.teal} />
        </div>
        <p className="font-heading font-semibold text-lg" style={{ color: P.charcoal }}>
          You're in!
        </p>
        <p className="text-sm mt-1" style={{ color: P.muted }}>
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
          className="w-full rounded-xl border border-gray-200 px-4 font-body text-base
                     focus:outline-none focus:ring-2 focus:border-transparent transition-all"
          style={{
            height: '56px',
            focusRingColor: P.teal,
          }}
          onFocus={(e) => (e.target.style.boxShadow = `0 0 0 2px ${P.teal}40`)}
          onBlur={(e) => (e.target.style.boxShadow = 'none')}
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="w-full rounded-xl font-heading font-semibold text-white text-base
                     transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
          style={{
            height: '56px',
            backgroundColor: P.coral,
            opacity: state === 'loading' ? 0.7 : 1,
          }}
        >
          {state === 'loading' ? 'Sending...' : 'Start my free challenge'}
        </button>
      </div>
      {state === 'error' && (
        <p className="text-red-500 text-sm text-center mt-2">
          Something went wrong. Try again?
        </p>
      )}
      <p className="text-center text-xs mt-3" style={{ color: P.muted }}>
        Free. 7 days. No credit card. Unsubscribe anytime.
      </p>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/*  Sticky mobile CTA bar                                             */
/* ------------------------------------------------------------------ */
function StickyBar() {
  const scrollToSignup = () => {
    document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3 lg:hidden"
      style={{
        background: 'linear-gradient(to top, white 80%, transparent)',
      }}
    >
      <button
        onClick={scrollToSignup}
        className="w-full rounded-xl font-heading font-semibold text-white text-sm py-3
                   shadow-lg active:scale-[0.98] transition-transform"
        style={{ backgroundColor: P.coral }}
      >
        Start the free 7-day challenge
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function ConferenceHome() {
  usePageMeta(
    'The Secret Behind How Your Brain Hijacks Relationships',
    'Relationship stress is a health crisis. Discover how to tame your critter brain with science-backed tools. Start the free 7-Day Spark Challenge.'
  )

  return (
    <div className="w-full" style={{ backgroundColor: P.warmWhite }}>

      {/* ============================================================ */}
      {/* HERO — Talk echo + email capture                             */}
      {/* Split layout on desktop, stacked on mobile                   */}
      {/* ============================================================ */}
      <section
        className="relative w-full min-h-[85dvh] flex items-center overflow-hidden mt-[-6rem] pt-[6rem]"
        style={{
          background: `radial-gradient(circle at 20% 30%, ${P.cream} 0%, transparent 50%),
                       radial-gradient(circle at 80% 70%, ${P.teal}08 0%, transparent 40%),
                       radial-gradient(circle at 50% 50%, ${P.warmWhite} 0%, transparent 100%)`,
        }}
      >
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Text + CTA */}
            <div className="flex flex-col items-start text-left gap-5">
              {/* Conference badge */}
              <span
                className="inline-flex items-center gap-1.5 text-xs font-heading font-medium tracking-wide uppercase rounded-full px-3 py-1"
                style={{ backgroundColor: `${P.teal}12`, color: P.teal }}
              >
                Be Healthy Utah 2026
              </span>

              <h1 className="flex flex-col gap-2">
                <span
                  className="font-accent italic text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.1] tracking-tight"
                  style={{ color: P.charcoal }}
                >
                  Your brain learned to
                  <br />protect you.
                </span>
                <span
                  className="font-heading font-bold text-2xl md:text-3xl"
                  style={{ color: P.teal }}
                >
                  Now it's getting in the way.
                </span>
              </h1>

              <p
                className="font-body text-base md:text-lg leading-relaxed max-w-[44ch]"
                style={{ color: P.muted }}
              >
                That stress response hijacking your closest relationship?
                It has a name — your Critter Brain. And you can learn to
                tame it in 7 days.
              </p>

              {/* Form — above fold on mobile */}
              <div id="signup" className="w-full mt-2">
                <CaptureForm source="hero" />
              </div>
            </div>

            {/* Image — Trisha (real photo, not stock) */}
            <div className="hidden lg:flex justify-center">
              <div
                className="relative w-[380px] h-[440px] rounded-3xl overflow-hidden shadow-2xl"
                style={{ backgroundColor: P.cream }}
              >
                <img
                  src="/images/team/trisha.jpg"
                  alt="Trisha Jamison — Healing Hearts founder and keynote speaker"
                  className="w-full h-full object-cover"
                  loading="eager"
                  width="380"
                  height="440"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* WHAT YOU'LL DISCOVER — 4 bullet points                       */}
      {/* ============================================================ */}
      <section className="w-full py-16 lg:py-20" style={{ backgroundColor: 'white' }}>
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <h2
            className="font-accent italic text-2xl md:text-3xl text-center mb-10"
            style={{ color: P.charcoal }}
          >
            In 7 days, you'll understand why you fight — and how to stop.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                className="flex gap-4 p-5 rounded-2xl"
                style={{ backgroundColor: `${P.teal}06` }}
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: `${P.teal}12` }}
                >
                  <Icon size={20} color={P.teal} />
                </div>
                <div>
                  <h3
                    className="font-heading font-semibold text-sm mb-1"
                    style={{ color: P.charcoal }}
                  >
                    {title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed" style={{ color: P.muted }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SOCIAL PROOF — One powerful testimonial                       */}
      {/* ============================================================ */}
      <section
        className="w-full py-14 lg:py-16"
        style={{
          background: `linear-gradient(135deg, ${P.teal} 0%, ${P.tealDark} 100%)`,
        }}
      >
        <div className="max-w-2xl mx-auto px-6 sm:px-10 text-center">
          <p className="font-accent italic text-xl md:text-2xl text-white/95 leading-relaxed mb-6">
            "I didn't realize I'd been in freeze mode for years. By day 3, I had my first
            real conversation with my husband in longer than I can remember."
          </p>
          <p className="font-body text-sm text-white/60 tracking-wide uppercase">
            — Challenge Participant
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CREDENTIALS — Trisha + Jeff, compact                          */}
      {/* ============================================================ */}
      <section className="w-full py-14 lg:py-16" style={{ backgroundColor: P.cream }}>
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
              <h3
                className="font-heading font-bold text-lg mb-2"
                style={{ color: P.charcoal }}
              >
                Trisha & Dr. Jeff Jamison
              </h3>
              <p className="font-body text-sm leading-relaxed mb-3" style={{ color: P.muted }}>
                Trisha is a relationship coach who lived this work — her own marriage
                crisis became the foundation for the Healing Hearts program. Together
                with her husband Jeff, a board-certified family physician (DO, FAAFP),
                they bridge the gap between what your body feels and what your
                relationship needs.
              </p>
              <p
                className="font-body text-xs"
                style={{ color: `${P.teal}` }}
              >
                8 modules · 32 milestones · 36 coaching sessions · Backed by nervous system science
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FINAL CTA — Repeat form                                      */}
      {/* ============================================================ */}
      <section className="w-full py-16 lg:py-20" style={{ backgroundColor: 'white' }}>
        <div className="max-w-md mx-auto px-6 sm:px-10 text-center">
          <h2
            className="font-accent italic text-2xl md:text-3xl mb-3"
            style={{ color: P.charcoal }}
          >
            Ready to meet your Critter Brain?
          </h2>
          <p className="font-body text-base mb-6" style={{ color: P.muted }}>
            7 days. One small step each morning. Try it with your partner tonight.
          </p>
          <CaptureForm source="bottom" />
        </div>
      </section>

      {/* Minimal footer — no nav links (research: zero exit links) */}
      <footer
        className="w-full py-6 text-center"
        style={{ backgroundColor: P.cream }}
      >
        <p className="font-body text-xs" style={{ color: `${P.muted}80` }}>
          &copy; 2026 Healing Hearts &middot;{' '}
          <Link to="/privacy" className="underline hover:no-underline">
            Privacy
          </Link>{' '}
          &middot;{' '}
          <Link to="/terms" className="underline hover:no-underline">
            Terms
          </Link>
        </p>
      </footer>

      {/* Sticky mobile CTA bar */}
      <StickyBar />

      {/* Bottom padding so sticky bar doesn't cover content */}
      <div className="h-16 lg:hidden" />
    </div>
  )
}
