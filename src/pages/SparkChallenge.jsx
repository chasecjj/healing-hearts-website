import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePageMeta from '../hooks/usePageMeta'
import {
  TeardropImage,
  OrganicDivider,
  TealQuoteBlock,
  DailyBreakdownGrid,
  FAQAccordion,
  Input,
  Button,
} from '@scoria/ui'

gsap.registerPlugin(ScrollTrigger)

/* ------------------------------------------------------------------ */
/*  Shared: reduced-motion check                                       */
/* ------------------------------------------------------------------ */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const DAYS = [
  {
    day: 1,
    title: "The 'I Noticed' Text",
    description:
      "Send your partner a text noticing something positive -- a quiet act, a kind word, a little thing that made you smile.",
  },
  {
    day: 2,
    title: 'The Specific Spark Compliment',
    description:
      "Move beyond 'you look nice' to a detailed, heartfelt compliment that names exactly what you noticed and how it made you feel.",
  },
  {
    day: 3,
    title: 'The 2-Minute Check-In',
    description:
      "Ask 'What was the best part of your day?' and just listen. No fixing, no advising -- just two minutes of loving presence.",
  },
  {
    day: 4,
    title: 'The Pause Experiment',
    description:
      "When tension rises, try a 10-second pause before responding. Let your thoughtful CEO Brain step in before your Critter Brain reacts.",
  },
  {
    day: 5,
    title: 'The Gratitude Text',
    description:
      "Send an unexpected mid-day text starting with 'I'm grateful you...' and watch a small spark of appreciation shift your whole day.",
  },
  {
    day: 6,
    title: 'The Memory Lane Moment',
    description:
      "Share a favorite memory from early in your relationship and tell your partner why that moment still matters to you today.",
  },
  {
    day: 7,
    title: 'The Spark Conversation',
    description:
      "Sit together and take turns asking: 'What's one small thing I could do this week to make you feel loved?' Then commit to doing it.",
  },
]

const FAQ_ITEMS = [
  {
    question: 'Is this really free?',
    answer:
      'Yes, completely. The 7-Day Spark Challenge is our gift to you. No credit card, no catch.',
  },
  {
    question: "What if my partner won't participate?",
    answer:
      "That's okay. Many of our practices are designed so that one person can start the shift. You'd be surprised how quickly your partner notices the change.",
  },
  {
    question: 'How much time does each day take?',
    answer:
      'Each practice takes 10-15 minutes. Some days less. We designed this for busy couples — especially those in demanding careers.',
  },
  {
    question: 'What happens after the 7 days?',
    answer:
      "You'll have practiced 7 powerful connection tools and had the Spark Conversation with your partner -- a direct, loving exchange about what makes each of you feel truly loved. From there, you're welcome to explore our full Healing Hearts program, but there's zero pressure.",
  },
]

export default function SparkChallenge() {
  const pageRef = useRef(null)

  usePageMeta('Free 7-Day Spark Challenge', 'Join the free 7-Day Spark Challenge. Daily practices that help couples move from disconnection to deep, meaningful connection.')

  useEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      gsap.utils.toArray('.spark-reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
            },
          }
        )
      })

      gsap.utils.toArray('.spark-stagger').forEach((container) => {
        const children = container.querySelectorAll('.spark-stagger-item')
        gsap.fromTo(
          children,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: container,
              start: 'top 85%',
            },
          }
        )
      })
    }, pageRef)

    return () => ctx.revert()
  }, [])

  const [formState, setFormState] = React.useState('idle') // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const email = formData.get('email')
    if (!email) return

    setFormState('loading')
    try {
      const res = await fetch('/api/spark-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setFormState('success')
      } else {
        setFormState('error')
      }
    } catch {
      setFormState('error')
    }
  }

  const scrollToSignup = (e) => {
    e.preventDefault()
    document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div ref={pageRef}>

      {/* ============================================================ */}
      {/* Section 1: Hero — Organic Flow variant                       */}
      {/* Cream watercolor background, teardrop image, serif headline  */}
      {/* ============================================================ */}
      <section className="relative w-full min-h-[90dvh] flex items-center overflow-hidden mt-[-6rem] pt-[6rem]">
        {/* Watercolor wash background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 20% 30%, #fff8ef 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(17,145,177,0.06) 0%, transparent 40%), radial-gradient(circle at 50% 50%, #fbf3e4 0%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Text + CTA — Left */}
            <div className="flex flex-col items-start text-left gap-6">
              {/* Eyebrow */}
              <span className="spark-reveal font-sans font-medium text-sm tracking-widest uppercase text-primary opacity-80">
                Free 7-Day Challenge
              </span>

              {/* Headline */}
              <h1 className="flex flex-col text-primary">
                <span className="spark-reveal font-drama italic text-5xl md:text-7xl lg:text-[5rem] leading-[1.05] tracking-tight text-primary">
                  7 Days to Reignite Your Connection
                </span>
              </h1>

              <p className="spark-reveal font-sans text-foreground/80 text-lg md:text-xl max-w-[50ch] font-light leading-relaxed">
                The Spark Challenge — free daily practices that help couples move from disconnection to deep, meaningful connection.
              </p>

              <div className="spark-reveal mt-4">
                <button
                  onClick={scrollToSignup}
                  className="bg-accent text-white px-10 py-4 rounded-full text-base font-medium shadow-xl hover:shadow-2xl hover:opacity-90 transition-all"
                >
                  Start the Challenge
                </button>
              </div>

              {/* Trust badge */}
              <p className="spark-reveal font-sans text-sm text-foreground/50 font-light">
                100% free &mdash; no credit card required
              </p>
            </div>

            {/* Teardrop Image — Right */}
            <div className="spark-reveal hidden lg:flex justify-center items-center">
              <div className="relative w-full max-w-sm">
                <TeardropImage
                  src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop"
                  alt="Couple holding hands while walking through a sunlit park"
                  overlayClass="bg-primary/10"
                  className="w-full aspect-[3/4]"
                />

                {/* Floating accent bubble */}
                <div className="absolute -bottom-6 -left-6 w-44 h-44 bg-primary/5 backdrop-blur-lg rounded-full flex items-center justify-center p-6 border border-primary/10 shadow-lg">
                  <p className="font-drama italic text-sm text-primary leading-snug text-center">
                    "It was just buried — not gone."
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Wave transition into Daily Breakdown (cream → cream, subtle) */}
        <div className="absolute bottom-0 left-0 w-full leading-[0] pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-auto block">
            <path
              d="M0,40L120,48C240,56,480,72,720,72C960,72,1200,56,1320,48L1440,40L1440,80L1320,80C1200,80,960,80,720,80C480,80,240,80,120,80L0,80Z"
              fill="#F9F8F5"
            />
          </svg>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Section 2: Daily Breakdown — cream background                */}
      {/* ============================================================ */}
      <section className="bg-[#F9F8F5] relative z-10">
        <div className="spark-reveal">
          <DailyBreakdownGrid
            heading="Your 7-Day Journey"
            days={DAYS}
            className="bg-[#F9F8F5]"
          />
        </div>

        {/* Wave into teal quote */}
        <div className="w-full leading-[0] pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-auto block">
            <path
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
              className="fill-primary"
            />
          </svg>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Section 3: Testimonial — TealQuoteBlock                      */}
      {/* ============================================================ */}
      <div className="spark-reveal">
        <TealQuoteBlock className="!bg-primary"
          quote="After 15 years of marriage, I thought we'd lost something that couldn't come back. The Spark Challenge showed us it was just buried — not gone."
          attribution="— Sarah, married 15 years"
        />
      </div>

      {/* Wave from teal into white signup */}
      <div className="bg-white leading-[0] pointer-events-none -mt-1" aria-hidden="true">
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-auto block">
          <path
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
            className="fill-primary"
          />
        </svg>
      </div>

      {/* ============================================================ */}
      {/* Section 4: Email Capture — white background                  */}
      {/* Rounded-3xl card, warm shadow, salmon CTA                    */}
      {/* ============================================================ */}
      <section className="bg-white py-16 lg:py-24">
        <div
          id="signup"
          className="spark-reveal mx-auto max-w-2xl px-6 sm:px-8"
        >
          <div
            className="rounded-3xl bg-[#F9F8F5] p-10 sm:p-14 text-center border border-primary/5"
            style={{ boxShadow: '0 10px 40px -10px rgba(17, 145, 177, 0.10)' }}
          >
            <h2 className="font-drama italic text-3xl sm:text-4xl text-primary mb-4">
              Start Your Free 7-Day Challenge
            </h2>
            <p className="font-sans text-foreground/70 font-light text-lg max-w-[55ch] mx-auto mb-8">
              Enter your email and we'll send you Day 1 tomorrow morning.
            </p>
            {formState === 'success' ? (
              <div className="py-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-drama italic text-2xl text-primary mb-2">You're in!</h3>
                <p className="font-sans text-foreground/70 text-lg">
                  Check your inbox for a welcome message from Trisha. Day 1 arrives tomorrow morning.
                </p>
              </div>
            ) : (
              <>
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                >
                  <Input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    aria-label="Email address"
                    required
                    disabled={formState === 'loading'}
                    className="flex-1"
                  />
                  <button
                    type="submit"
                    disabled={formState === 'loading'}
                    className="bg-accent text-white px-8 py-3 rounded-full font-medium text-base shadow-lg hover:opacity-90 hover:shadow-xl transition-all whitespace-nowrap disabled:opacity-60 disabled:cursor-wait"
                  >
                    {formState === 'loading' ? 'Signing up...' : 'Begin the Challenge'}
                  </button>
                </form>
                {formState === 'error' && (
                  <p className="mt-3 font-sans text-sm text-red-500">
                    Something went wrong. Please try again or email us at hello@healingheartscourse.com.
                  </p>
                )}
                <p className="mt-5 font-sans text-sm text-foreground/40">
                  We respect your inbox. Unsubscribe anytime.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* OrganicDivider into cream FAQ */}
      <OrganicDivider variant="wave-2" fillClass="text-[#F9F8F5]" />

      {/* ============================================================ */}
      {/* Section 5: FAQ — cream background                            */}
      {/* ============================================================ */}
      <section className="bg-[#F9F8F5] pb-24">
        <div className="spark-reveal">
          <FAQAccordion
            heading="Common Questions"
            items={FAQ_ITEMS}
            className="bg-[#F9F8F5]"
          />
        </div>
      </section>

    </div>
  )
}
