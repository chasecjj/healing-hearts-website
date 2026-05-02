import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CheckCircle } from 'lucide-react'
import usePageMeta from '../hooks/usePageMeta'
import {
  TeardropImage,
  OrganicDivider,
  DailyBreakdownGrid,
  FAQAccordion,
  Input,
} from '@scoria/ui'

gsap.registerPlugin(ScrollTrigger)

/* ------------------------------------------------------------------ */
/*  Page-scoped palette (amber redesign — /spark-challenge only)       */
/* ------------------------------------------------------------------ */
const P = {
  gold: '#D4963A',
  coral: '#C4614E',
  cream: '#FAF4EA',
  teal: '#4A9DB5',
  charcoal: '#2D2D2D',
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
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
      'Each practice takes 10-15 minutes. Some days less. We designed this for busy couples -- especially those in demanding careers.',
  },
  {
    question: 'What happens after the 7 days?',
    answer:
      "You'll have practiced 7 powerful connection tools and had the Spark Conversation with your partner -- a direct, loving exchange about what makes each of you feel truly loved. From there, you're welcome to explore our full Healing Hearts program, but there's zero pressure.",
  },
  {
    question: 'When do I start receiving emails?',
    answer:
      "You'll get a welcome email right away, then Day 1 arrives the next morning. One email per day for seven days.",
  },
  {
    question: 'Do we have to do it together?',
    answer:
      "While it's wonderful if you both sign up, many people start this journey on their own. The shift in one partner often sparks a positive reaction in the other.",
  },
  {
    question: 'What if I miss a day?',
    answer:
      "Life happens. The emails will be waiting in your inbox. Just pick up where you left off. This is a guilt-free zone.",
  },
  {
    question: 'Is my information kept private?',
    answer:
      'Absolutely. Your email and your journey are private. We never share your data with anyone. Unsubscribe anytime.',
  },
]

const PAIN_POINTS = [
  'You go to bed on your side of the bed and the silence feels heavier than any argument.',
  "You can't remember the last time you laughed together -- really laughed, from your soul.",
  'Every conversation feels like a logistics update rather than a moment of real connection.',
  'You love each other deeply, but somewhere along the way, you stopped truly connecting.',
  'You feel more like roommates managing a household than partners sharing a life.',
]

const TESTIMONIALS = [
  {
    quote:
      "I didn't think a text message could change my marriage, but Day 1 opened a door we had kept locked for years.",
    name: 'Amanda L.',
    detail: 'Married 8 years',
  },
  {
    quote:
      'Trisha has a way of making hard things feel possible. We feel like a team again.',
    name: 'David R.',
    detail: 'Married 22 years',
  },
  {
    quote:
      'Simple, profound, and deeply human. This challenge was the reset button we desperately needed.',
    name: 'Jessica & Tom',
    detail: 'Partners for 5 years',
  },
]

const OBJECTIONS = [
  {
    question: "What if my partner won't participate?",
    answer:
      "Most of these shifts can be initiated by just one person. As you change the dance, your partner will eventually change their steps too. It starts with you.",
  },
  {
    question: "What if we're too far gone?",
    answer:
      "We've worked with couples on the brink of divorce. Hope is rarely dead -- it's often just buried under layers of fatigue and hurt. Let's start uncovering it together.",
  },
  {
    question: "I don't have time for this.",
    answer:
      "Each day takes 5-10 minutes -- less than a coffee break. We designed this for lives that are already full.",
  },
]

const QUALIFIERS = [
  'You feel more like roommates than partners sharing a life.',
  'You love each other but the romantic connection has faded into the background.',
  "You've tried talking but it always seems to turn into the same repetitive loop.",
  'The silence in your house feels loud and heavy with unspoken things.',
  'You miss the version of "us" that existed when you first started.',
]

/* ------------------------------------------------------------------ */
/*  Shared signup form (used in mid-page CTA and final CTA)            */
/* ------------------------------------------------------------------ */
function SignupForm({ formState, onSubmit, variant }) {
  if (formState === 'success') {
    return (
      <div className="py-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${P.gold}18` }}
        >
          <svg
            className="w-8 h-8"
            style={{ color: P.gold }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3
          className="font-drama italic text-2xl mb-2"
          style={{ color: P.gold }}
        >
          You're in!
        </h3>
        <p className="font-sans text-lg" style={{ color: `${P.charcoal}B3` }}>
          Check your inbox for a welcome message from Trisha. Day 1 arrives
          the next morning.
        </p>
      </div>
    )
  }

  const isOnDark = variant === 'dark'

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
      >
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
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
          className="px-8 py-3 rounded-full font-medium text-base text-white shadow-lg hover:opacity-90 hover:shadow-xl transition-all whitespace-nowrap disabled:opacity-60 disabled:cursor-wait"
          style={{ backgroundColor: P.coral }}
        >
          {formState === 'loading' ? 'Signing up...' : 'Begin the Challenge'}
        </button>
      </form>
      {formState === 'error' && (
        <p className="mt-3 font-sans text-sm text-red-500">
          Something went wrong. Please try again or email us at
          hello@healingheartscourse.com.
        </p>
      )}
      <p
        className={`mt-5 font-sans text-sm ${isOnDark ? 'text-white/50' : ''}`}
        style={isOnDark ? undefined : { color: `${P.charcoal}66` }}
      >
        We respect your inbox. Unsubscribe anytime.
      </p>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Main page component                                                */
/* ------------------------------------------------------------------ */
export default function SparkChallenge() {
  const pageRef = useRef(null)
  const [formState, setFormState] = useState('idle')

  usePageMeta(
    'Free 7-Day Spark Challenge',
    'Join the free 7-Day Spark Challenge. Daily practices that help couples move from disconnection to deep, meaningful connection.'
  )

  /* GSAP scroll animations */
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
            scrollTrigger: { trigger: el, start: 'top 85%' },
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
            scrollTrigger: { trigger: container, start: 'top 85%' },
          }
        )
      })
    }, pageRef)

    return () => ctx.revert()
  }, [])

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
      {/* SECTION 1: HERO SPLIT                                        */}
      {/* Amber wash background, teardrop image right, coral CTA       */}
      {/* ============================================================ */}
      <section className="relative w-full min-h-[90dvh] flex items-center overflow-hidden mt-[-6rem] pt-[6rem]">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 20% 30%, ${P.cream} 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${P.gold}0F 0%, transparent 40%), radial-gradient(circle at 50% 50%, ${P.cream} 0%, transparent 100%)`,
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text + CTA */}
            <div className="flex flex-col items-start text-left gap-6">
              <span
                className="spark-reveal font-sans font-medium text-sm tracking-widest uppercase opacity-80"
                style={{ color: P.gold }}
              >
                Free 7-Day Challenge
              </span>

              <h1 className="spark-reveal flex flex-col">
                <span
                  className="font-drama italic text-5xl md:text-7xl lg:text-[5rem] leading-[1.05] tracking-tight"
                  style={{ color: P.charcoal }}
                >
                  7 Days to Reignite
                </span>
                <span
                  className="font-drama italic text-5xl md:text-7xl lg:text-[5rem] leading-[1.05] tracking-tight"
                  style={{ color: P.gold }}
                >
                  Your Connection
                </span>
              </h1>

              <p
                className="spark-reveal font-sans text-lg md:text-xl max-w-[50ch] font-light leading-relaxed"
                style={{ color: `${P.charcoal}CC` }}
              >
                The Spark Challenge -- free daily practices that help couples
                move from disconnection to deep, meaningful connection.
              </p>

              <div className="spark-reveal mt-4">
                <button
                  onClick={scrollToSignup}
                  className="text-white px-10 py-4 rounded-full text-base font-medium shadow-xl hover:shadow-2xl hover:opacity-90 transition-all"
                  style={{ backgroundColor: P.coral }}
                >
                  Start the Challenge
                </button>
              </div>

              <p
                className="spark-reveal font-sans text-sm font-light"
                style={{ color: `${P.charcoal}80` }}
              >
                100% free &mdash; no credit card required
              </p>
            </div>

            {/* Hero Photo */}
            <div className="spark-reveal hidden lg:flex justify-center items-center -mt-8">
              <div className="relative w-full max-w-sm">
                <img
                  src="/images/team/jeff-and-trisha.jpg"
                  alt="Jeff and Trisha Jamison, founders of Healing Hearts"
                  className="w-full aspect-[3/4] object-cover object-top rounded-3xl shadow-2xl"
                  loading="lazy"
                />
                <div
                  className="absolute -bottom-6 -left-6 w-44 h-44 rounded-full flex items-center justify-center p-6 shadow-xl"
                  style={{
                    backgroundColor: '#FFFAF3',
                    border: `2px solid ${P.gold}40`,
                  }}
                >
                  <p
                    className="font-drama italic text-sm leading-snug text-center"
                    style={{ color: P.coral }}
                  >
                    "It was just buried -- not gone."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave into pain validation */}
        <div
          className="absolute bottom-0 left-0 w-full leading-[0] pointer-events-none"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 1440 80"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full h-auto block"
          >
            <path
              d="M0,40L120,48C240,56,480,72,720,72C960,72,1200,56,1320,48L1440,40L1440,80L1320,80C1200,80,960,80,720,80C480,80,240,80,120,80L0,80Z"
              fill={P.cream}
            />
          </svg>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2: PAIN VALIDATION                                   */}
      {/* "Sound familiar?" — asymmetric bento layout                  */}
      {/* ============================================================ */}
      <section style={{ backgroundColor: P.cream }} className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <div className="spark-reveal text-center mb-14">
            <h2
              className="font-drama italic text-4xl md:text-5xl mb-4"
              style={{ color: P.charcoal }}
            >
              Sound familiar?
            </h2>
            <p
              className="font-sans font-light text-lg max-w-xl mx-auto"
              style={{ color: `${P.charcoal}99` }}
            >
              The distance didn't happen overnight, and neither will the healing
              -- but the shift can start now.
            </p>
          </div>

          {/* Bento grid: 2-col asymmetric with validation bridge */}
          <div className="spark-stagger grid grid-cols-1 md:grid-cols-2 gap-5">
            {PAIN_POINTS.slice(0, 2).map((text, i) => (
              <div
                key={i}
                className="spark-stagger-item bg-white p-8 md:p-10 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                style={{ borderLeft: `3px solid ${P.gold}40` }}
              >
                <p
                  className="font-sans text-lg leading-relaxed"
                  style={{ color: P.charcoal }}
                >
                  {text}
                </p>
              </div>
            ))}

            {/* Validation bridge — breaks the pain-point stack */}
            <p
              className="spark-stagger-item md:col-span-2 text-center font-drama italic text-lg py-3"
              style={{ color: P.gold }}
            >
              If you nodded at any of these -- you're not alone, and this isn't
              your fault.
            </p>

            {PAIN_POINTS.slice(2, 4).map((text, i) => (
              <div
                key={i + 2}
                className="spark-stagger-item bg-white p-8 md:p-10 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                style={{ borderLeft: `3px solid ${P.gold}40` }}
              >
                <p
                  className="font-sans text-lg leading-relaxed"
                  style={{ color: P.charcoal }}
                >
                  {text}
                </p>
              </div>
            ))}
            <div
              className="spark-stagger-item md:col-span-2 bg-white p-8 md:p-10 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center"
              style={{ borderLeft: `3px solid ${P.coral}40` }}
            >
              <p
                className="font-sans text-lg leading-relaxed max-w-2xl mx-auto"
                style={{ color: P.charcoal }}
              >
                {PAIN_POINTS[4]}
              </p>
            </div>
          </div>
        </div>
      </section>

      <OrganicDivider variant="wave-2" fillClass="text-white" />

      {/* ============================================================ */}
      {/* SECTION 3: COACH INTRO — Meet Trisha                         */}
      {/* Card format inspired by Team page, amber palette             */}
      {/* ============================================================ */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <div
            className="spark-reveal bg-white/70 backdrop-blur-sm rounded-3xl border overflow-hidden transition-shadow duration-500 hover:shadow-xl"
            style={{
              borderColor: `${P.gold}20`,
              boxShadow: `0 8px 32px -8px ${P.gold}14`,
            }}
          >
            {/* Shimmer bar */}
            <div className="relative h-1.5 w-full overflow-hidden rounded-t-3xl">
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${P.gold}80 15%, ${P.coral}66 35%, ${P.gold}4D 55%, ${P.coral}33 75%, transparent 100%)`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 6s ease-in-out infinite alternate',
                }}
              />
              <style>{`@keyframes shimmer { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }`}</style>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 p-8 md:p-12 lg:p-16">
              {/* Photo with offset gradient shadow */}
              <div className="relative w-56 md:w-64 lg:w-72 flex-shrink-0">
                <div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: `linear-gradient(135deg, ${P.gold}33 0%, ${P.gold}14 50%, ${P.coral}1A 100%)`,
                    transform: 'translate(12px, 14px) rotate(2.5deg)',
                  }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: `linear-gradient(135deg, ${P.gold}33 0%, ${P.gold}14 50%, ${P.coral}1A 100%)`,
                    opacity: 0.4,
                    transform: 'translate(22px, 24px) rotate(4deg)',
                  }}
                  aria-hidden="true"
                />
                <div
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl"
                  style={{
                    boxShadow: `0 16px 40px -8px ${P.charcoal}2E`,
                  }}
                >
                  <img
                    src="/images/team/trisha.jpg"
                    alt="Trisha Jamison, Founder and Lead Coach of Healing Hearts"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'top' }}
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="flex-1 text-center md:text-left">
                <p
                  className="font-sans font-medium text-sm tracking-wider uppercase mb-3"
                  style={{ color: P.gold }}
                >
                  Founder & Lead Coach
                </p>
                <h2
                  className="font-drama italic text-4xl md:text-5xl mb-6"
                  style={{ color: P.charcoal }}
                >
                  Hi, I'm Trisha
                </h2>
                <p
                  className="font-sans text-lg leading-relaxed mb-6"
                  style={{ color: `${P.charcoal}B3` }}
                >
                  I built Healing Hearts from two decades of coaching couples
                  through their hardest moments. My own marriage to Jeff wasn't
                  always the sanctuary it is today -- we had to learn how to
                  choose connection over convenience. This challenge isn't about
                  grand gestures; it's about the microscopic shifts that turn a
                  spark back into a flame.
                </p>

                {/* Highlight quote from real coaching session */}
                <div
                  className="rounded-r-xl px-6 py-4 mb-6"
                  style={{
                    backgroundColor: `${P.gold}0A`,
                    borderLeft: `4px solid ${P.gold}`,
                  }}
                >
                  <p
                    className="italic text-base leading-relaxed"
                    style={{ color: `${P.charcoal}CC` }}
                  >
                    "It just feels more hopeful. I feel like it will be easier
                    to bring compassion into these moments."
                  </p>
                  <p
                    className="text-sm mt-2"
                    style={{ color: `${P.charcoal}66` }}
                  >
                    -- Coaching session participant
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wave into daily breakdown */}
      <div
        className="w-full leading-[0] pointer-events-none"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-auto block"
        >
          <path
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            fill={P.cream}
          />
        </svg>
      </div>

      {/* ============================================================ */}
      {/* SECTION 4: DAILY BREAKDOWN                                   */}
      {/* DailyBreakdownGrid component with existing DAYS data         */}
      {/* ============================================================ */}
      <section style={{ backgroundColor: P.cream }}>
        <div className="spark-reveal">
          <DailyBreakdownGrid
            heading="Your 7-Day Journey"
            days={DAYS}
            style={{ backgroundColor: P.cream }}
          />
        </div>
      </section>

      <OrganicDivider variant="wave-2" fillClass="text-white" />

      {/* ============================================================ */}
      {/* SECTION 5: MID-PAGE CTA                                      */}
      {/* Amber-gold card with coral CTA button                        */}
      {/* ============================================================ */}
      <section className="bg-white py-16 lg:py-24">
        <div
          id="signup"
          className="spark-reveal mx-auto max-w-2xl px-6 sm:px-8"
        >
          <div
            className="rounded-3xl p-10 sm:p-14 text-center"
            style={{
              backgroundColor: P.cream,
              border: `1px solid ${P.gold}0D`,
              boxShadow: `0 10px 40px -10px ${P.gold}1A`,
            }}
          >
            <h2
              className="font-drama italic text-3xl sm:text-4xl mb-4"
              style={{ color: P.charcoal }}
            >
              Ready to Start?
            </h2>
            <p
              className="font-sans font-light text-lg max-w-[55ch] mx-auto mb-8"
              style={{ color: `${P.charcoal}B3` }}
            >
              Enter your email and we'll send you Day 1 tomorrow morning. No
              fluff, just connection.
            </p>
            <SignupForm
              formState={formState}
              onSubmit={handleSubmit}
              variant="light"
            />
          </div>
        </div>
      </section>

      {/* Wave into social proof */}
      <div
        className="w-full leading-[0] pointer-events-none"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-auto block"
        >
          <path
            d="M0,40L120,48C240,56,480,72,720,72C960,72,1200,56,1320,48L1440,40L1440,80L1320,80C1200,80,960,80,720,80C480,80,240,80,120,80L0,80Z"
            fill={P.cream}
          />
        </svg>
      </div>

      {/* ============================================================ */}
      {/* SECTION 6: SOCIAL PROOF                                      */}
      {/* Masonry-style testimonials — NOT 3-col equal                 */}
      {/* ============================================================ */}
      <section style={{ backgroundColor: P.cream }} className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <h2
            className="spark-reveal font-drama italic text-4xl md:text-5xl text-center mb-16"
            style={{ color: P.charcoal }}
          >
            Voices from the Journey
          </h2>

          {/* Asymmetric: 1 large + 2 stacked */}
          <div className="spark-stagger grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Featured testimonial — spans 3 cols */}
            <div
              className="spark-stagger-item lg:col-span-3 bg-white p-10 lg:p-12 rounded-3xl shadow-sm flex flex-col justify-between"
              style={{ borderTop: `3px solid ${P.gold}` }}
            >
              <p
                className="font-drama italic text-2xl leading-snug mb-8"
                style={{ color: P.charcoal }}
              >
                "{TESTIMONIALS[0].quote}"
              </p>
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm"
                  style={{ backgroundColor: `${P.gold}33` }}
                >
                  <span style={{ color: P.gold }}>
                    {TESTIMONIALS[0].name[0]}
                  </span>
                </div>
                <div>
                  <p
                    className="font-sans font-medium"
                    style={{ color: P.charcoal }}
                  >
                    {TESTIMONIALS[0].name}
                  </p>
                  <p
                    className="text-xs uppercase tracking-widest"
                    style={{ color: `${P.charcoal}80` }}
                  >
                    {TESTIMONIALS[0].detail}
                  </p>
                </div>
              </div>
            </div>

            {/* Stacked pair — spans 2 cols */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {TESTIMONIALS.slice(1).map((t, i) => (
                <div
                  key={i}
                  className="spark-stagger-item bg-white p-8 rounded-3xl shadow-sm flex-1 flex flex-col justify-between"
                  style={{ borderTop: `3px solid ${P.coral}60` }}
                >
                  <p
                    className="font-drama italic text-xl leading-snug mb-6"
                    style={{ color: P.charcoal }}
                  >
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
                      style={{
                        backgroundColor: `${P.coral}20`,
                        color: P.coral,
                      }}
                    >
                      {t.name[0]}
                    </div>
                    <div>
                      <p
                        className="font-sans font-medium text-sm"
                        style={{ color: P.charcoal }}
                      >
                        {t.name}
                      </p>
                      <p
                        className="text-xs uppercase tracking-widest"
                        style={{ color: `${P.charcoal}80` }}
                      >
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

      <OrganicDivider variant="wave-2" fillClass="text-white" />

      {/* ============================================================ */}
      {/* SECTION 7: OBJECTION HANDLER                                 */}
      {/* Stacked cards — NOT 3-col equal grid                         */}
      {/* ============================================================ */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <div className="spark-stagger space-y-6">
            {OBJECTIONS.map((obj, i) => (
              <div
                key={i}
                className="spark-stagger-item rounded-2xl p-8 md:p-10"
                style={{
                  backgroundColor: P.cream,
                  borderLeft: `4px solid ${P.gold}`,
                }}
              >
                <h3
                  className="font-drama italic text-2xl mb-3"
                  style={{ color: P.charcoal }}
                >
                  {obj.question}
                </h3>
                <p
                  className="font-sans leading-relaxed text-lg"
                  style={{ color: `${P.charcoal}CC` }}
                >
                  {obj.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave into qualifier */}
      <div
        className="w-full leading-[0] pointer-events-none"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-auto block"
        >
          <path
            d="M0,40L120,48C240,56,480,72,720,72C960,72,1200,56,1320,48L1440,40L1440,80L1320,80C1200,80,960,80,720,80C480,80,240,80,120,80L0,80Z"
            fill={P.cream}
          />
        </svg>
      </div>

      {/* ============================================================ */}
      {/* SECTION 8: QUALIFIER                                         */}
      {/* "This is for you if..." checklist                            */}
      {/* ============================================================ */}
      <section style={{ backgroundColor: P.cream }} className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <h2
            className="spark-reveal font-drama italic text-4xl md:text-5xl text-center mb-14"
            style={{ color: P.charcoal }}
          >
            This is for you if...
          </h2>

          <div className="spark-stagger space-y-4">
            {QUALIFIERS.map((text, i) => (
              <div
                key={i}
                className="spark-stagger-item flex items-start gap-5 p-5 rounded-2xl bg-white hover:shadow-sm transition-shadow"
              >
                <CheckCircle
                  className="w-6 h-6 flex-shrink-0 mt-0.5"
                  style={{ color: P.gold }}
                />
                <p
                  className="font-sans text-lg"
                  style={{ color: P.charcoal }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OrganicDivider variant="wave-2" fillClass="text-white" />

      {/* ============================================================ */}
      {/* SECTION 9: FINAL CTA                                         */}
      {/* Emotional headline + second email form                       */}
      {/* ============================================================ */}
      <section className="bg-white py-24 lg:py-36">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 text-center">
          <h2
            className="spark-reveal font-drama italic text-4xl md:text-6xl mb-6"
            style={{ color: P.charcoal }}
          >
            Your connection is worth 7 days.
          </h2>

          <div
            className="spark-reveal rounded-[2rem] p-10 sm:p-14 mt-10 mx-auto max-w-2xl"
            style={{
              backgroundColor: P.cream,
              border: `1px solid ${P.gold}0D`,
              boxShadow: `0 16px 48px -12px ${P.gold}1A`,
            }}
          >
            <p
              className="font-drama italic text-xl mb-8"
              style={{ color: P.coral }}
            >
              "Change doesn't have to be hard. Sometimes it just starts with
              showing up."
            </p>
            <SignupForm
              formState={formState}
              onSubmit={handleSubmit}
              variant="light"
            />
            <p
              className="mt-6 text-sm font-sans italic"
              style={{ color: `${P.charcoal}80` }}
            >
              -- Trisha, Your Guide
            </p>
          </div>
        </div>
      </section>

      {/* Wave into FAQ */}
      <div
        className="w-full leading-[0] pointer-events-none"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-auto block"
        >
          <path
            d="M0,40L120,48C240,56,480,72,720,72C960,72,1200,56,1320,48L1440,40L1440,80L1320,80C1200,80,960,80,720,80C480,80,240,80,120,80L0,80Z"
            fill={P.cream}
          />
        </svg>
      </div>

      {/* ============================================================ */}
      {/* SECTION 10: FAQ EXPANDED                                     */}
      {/* FAQAccordion with 8 questions                                */}
      {/* ============================================================ */}
      <section style={{ backgroundColor: P.cream }} className="pb-24">
        <div className="spark-reveal">
          <FAQAccordion
            heading="Frequently Asked Questions"
            items={FAQ_ITEMS}
            style={{ backgroundColor: P.cream }}
          />
        </div>
      </section>
    </div>
  )
}
