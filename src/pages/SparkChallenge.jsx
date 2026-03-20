import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  HeroSection,
  DailyBreakdownGrid,
  TestimonialCard,
  FAQAccordion,
  Card,
  Input,
  Button,
} from '@scoria/ui'

gsap.registerPlugin(ScrollTrigger)

const DAYS = [
  {
    day: 1,
    title: 'The Pause',
    description:
      'Learn the 5-second pause that transforms reactive arguments into real conversations.',
  },
  {
    day: 2,
    title: 'Curiosity Over Criticism',
    description: 'Replace "you always..." with one powerful question.',
  },
  {
    day: 3,
    title: 'The 10-Minute Check-In',
    description:
      'A simple daily ritual that rebuilds emotional safety.',
  },
  {
    day: 4,
    title: 'Naming Your Needs',
    description:
      'Move from hints and resentment to clear, kind requests.',
  },
  {
    day: 5,
    title: 'Repair Attempts',
    description:
      'What to do in the first 60 seconds after things go wrong.',
  },
  {
    day: 6,
    title: 'Appreciation Flooding',
    description:
      'The science behind why gratitude physically rewires your relationship.',
  },
  {
    day: 7,
    title: 'Your Connection Blueprint',
    description:
      'Build a personalized plan to keep the spark alive.',
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
      "That's okay. Many of our exercises are designed so that one person can start the shift. You'd be surprised how quickly your partner notices the change.",
  },
  {
    question: 'How much time does each day take?',
    answer:
      'Each exercise takes 10-15 minutes. Some days less. We designed this for busy couples — especially those in demanding careers.',
  },
  {
    question: 'What happens after the 7 days?',
    answer:
      "You'll have a personalized Connection Blueprint and an invitation to explore our full Healing Hearts program — but there's zero pressure.",
  },
]

export default function SparkChallenge() {
  const pageRef = useRef(null)

  useEffect(() => {
    document.title = 'Spark Challenge | Healing Hearts'

    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute(
        'content',
        'Join the free 7-Day Spark Challenge. Daily exercises that help couples move from disconnection to deep, meaningful connection.'
      )
    }
  }, [])

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReduced) return

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const email = formData.get('email')

    try {
      await fetch('/api/spark-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch {
      // Handler not built yet
    }
  }

  const scrollToSignup = (e) => {
    e.preventDefault()
    document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div ref={pageRef}>
      {/* Section 1: Hero */}
      <HeroSection
        headline="7 Days to Reignite Your Connection"
        subheadline="The Spark Challenge — free daily exercises that help couples move from disconnection to deep, meaningful connection."
        ctaText="Start the Challenge"
        ctaHref="#signup"
        onCtaClick={scrollToSignup}
        align="left"
        backgroundVariant="gradient"
      >
        <img
          src="https://picsum.photos/seed/spark-hero-couple/800/600"
          alt="Couple holding hands while walking through a sunlit park"
          className="rounded-2xl"
        />
      </HeroSection>

      {/* Section 2: Daily Breakdown */}
      <div className="spark-reveal">
        <DailyBreakdownGrid
          heading="Your 7-Day Journey"
          days={DAYS}
        />
      </div>

      {/* Section 3: Testimonial */}
      <div className="spark-reveal mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <TestimonialCard
          quote="After 15 years of marriage, I thought we'd lost something that couldn't come back. The Spark Challenge showed us it was just buried — not gone."
          name="Sarah"
          role="married 15 years"
        />
      </div>

      {/* Section 4: Email Capture */}
      <section id="signup" className="spark-reveal mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <Card className="rounded-2xl bg-neutral-50 p-8 text-center shadow-[0_4px_20px_-4px_rgba(7,58,71,0.08)]">
          <h2 className="font-heading text-2xl font-bold text-neutral-800 sm:text-3xl">
            Start Your Free 7-Day Challenge
          </h2>
          <p className="mx-auto mt-3 max-w-[65ch] font-body text-neutral-600">
            Enter your email and we'll send you Day 1 tomorrow morning.
          </p>
          <form
            onSubmit={handleSubmit}
            action="/api/spark-signup"
            method="POST"
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              aria-label="Email address"
              required
              className="flex-1"
            />
            <Button type="submit" size="lg">
              Begin the Challenge
            </Button>
          </form>
          <p className="mt-4 font-body text-sm text-neutral-400">
            We respect your inbox. Unsubscribe anytime.
          </p>
        </Card>
      </section>

      {/* Section 5: FAQ */}
      <div className="spark-reveal">
        <FAQAccordion
          heading="Common Questions"
          items={FAQ_ITEMS}
        />
      </div>
    </div>
  )
}
