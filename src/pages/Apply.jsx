import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Heart, ChevronLeft, Loader2, Shield, Clock } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const INITIAL_DATA = {
  name: '',
  email: '',
  phone: '',
  relationship_status: '',
  years_together: '',
  relationship_rating: 5,
  biggest_challenge: '',
  tried_before: '',
  partner_aware: null,
  partner_willing: null,
  ideal_outcome: '',
  urgency: '',
  investment_readiness: '',
  faith_role: '',
  how_heard: '',
  additional_notes: '',
};

const TOTAL_STEPS = 6; // 0=intro, 1-5=form steps

/* ------------------------------------------------------------------ */
/*  Reusable sub-components                                            */
/* ------------------------------------------------------------------ */

function RadioPills({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-5 py-3 rounded-full border-2 font-sans text-sm cursor-pointer transition-all ${
            value === opt
              ? 'border-primary bg-primary/10 text-primary font-medium'
              : 'border-neutral-200 bg-white text-foreground/70 hover:border-primary/30'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="block font-outfit font-bold text-sm text-primary mb-2">
      {children}
      {required && ' *'}
    </label>
  );
}

const INPUT_CLASS =
  'w-full px-5 py-4 rounded-2xl bg-background border border-primary/10 font-sans text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all';

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function Apply() {
  usePageMeta(
    'Apply',
    'Apply for the Healing Hearts relationship coaching program. A short, confidential application to help us understand where you are.'
  );

  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState(INITIAL_DATA);
  const [errors, setErrors] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | sending
  const stepRef = useRef(null);

  /* -- field updater -- */
  const update = (field, value) => setData((prev) => ({ ...prev, [field]: value }));

  /* -- GSAP reveal on step change -- */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.step-reveal',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );
    }, stepRef);
    return () => ctx.revert();
  }, [step]);

  /* -- validation -- */
  const validateStep = () => {
    const errs = [];
    if (step === 1) {
      if (!data.name.trim()) errs.push("We'd love to know your name so we can greet you properly.");
      if (!data.email.trim()) errs.push("We need your email so we can follow up with you personally.");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.push("That email doesn't look quite right. Could you double-check it?");
    }
    if (step === 2) {
      if (!data.relationship_status) errs.push('Let us know where your relationship is right now so we can understand your starting point.');
    }
    if (step === 3) {
      if (!data.biggest_challenge.trim()) errs.push("Share whatever feels safe. Even a sentence helps us understand what you're facing.");
    }
    setErrors(errs);
    return errs.length === 0;
  };

  /* -- navigation -- */
  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const back = () => {
    setErrors([]);
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* -- submit -- */
  const submit = async () => {
    if (!validateStep()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        navigate('/apply/success');
      } else {
        const result = await res.json().catch(() => ({}));
        setErrors(result.details || ["We weren't able to submit your application. Please try once more, or reach out to us directly."]);
        setStatus('idle');
      }
    } catch {
      setErrors(["We're having trouble connecting right now. Please try again in a moment, or email us at hello@healingheartscourse.com"]);
      setStatus('idle');
    }
  };

  /* -- progress fraction (steps 1-5) -- */
  const progress = step === 0 ? 0 : step / (TOTAL_STEPS - 1);

  /* ---------------------------------------------------------------- */
  /*  Step renderers                                                   */
  /* ---------------------------------------------------------------- */

  const renderIntro = () => (
    <div className="text-center max-w-lg mx-auto">
      <div className="step-reveal w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
        <Heart className="w-10 h-10 text-primary" />
      </div>
      <h1 className="step-reveal font-drama italic text-4xl md:text-5xl text-primary leading-tight mb-6">
        Apply for Healing Hearts
      </h1>
      <p className="step-reveal font-sans text-foreground/70 font-light text-lg leading-relaxed mb-10">
        This short application helps us understand where you are so we can recommend the right path forward for your relationship.
      </p>

      <div className="step-reveal flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
        <div className="flex items-center gap-2 text-foreground/50 font-sans text-sm">
          <Shield className="w-4 h-4" />
          <span>100% confidential</span>
        </div>
        <div className="flex items-center gap-2 text-foreground/50 font-sans text-sm">
          <Clock className="w-4 h-4" />
          <span>Takes about 5 minutes</span>
        </div>
      </div>

      <button
        onClick={next}
        className="step-reveal px-10 py-4 rounded-full bg-primary text-background font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
      >
        Begin Application
      </button>
    </div>
  );

  const renderContact = () => (
    <div className="max-w-lg mx-auto">
      <h2 className="step-reveal font-drama italic text-3xl md:text-4xl text-primary mb-2">
        Let's start with the basics.
      </h2>
      <p className="step-reveal font-sans text-foreground/50 font-light mb-8">Step 1 of 5</p>

      <div className="space-y-6">
        <div className="step-reveal">
          <FieldLabel required>Your Name</FieldLabel>
          <input
            type="text"
            value={data.name}
            onChange={(e) => update('name', e.target.value)}
            className={INPUT_CLASS}
            placeholder="Jeff & Trisha"
          />
        </div>
        <div className="step-reveal">
          <FieldLabel required>Email Address</FieldLabel>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={data.email}
            onChange={(e) => update('email', e.target.value)}
            className={INPUT_CLASS}
            placeholder="you@example.com"
          />
        </div>
        <div className="step-reveal">
          <FieldLabel>Phone (optional)</FieldLabel>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => update('phone', e.target.value)}
            className={INPUT_CLASS}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>
    </div>
  );

  const renderRelationship = () => (
    <div className="max-w-lg mx-auto">
      <h2 className="step-reveal font-drama italic text-3xl md:text-4xl text-primary mb-2">
        Where is your relationship right now?
      </h2>
      <p className="step-reveal font-sans text-foreground/50 font-light mb-2">Step 2 of 5</p>
      <p className="step-reveal font-sans text-foreground/40 font-light text-sm mb-8">
        Think about your Zones of Resilience -- where do you and your partner spend most of your time together?
      </p>

      <div className="space-y-8">
        <div className="step-reveal">
          <FieldLabel required>Relationship Status</FieldLabel>
          <RadioPills
            options={['Married', 'Separated', 'Engaged', 'Dating']}
            value={data.relationship_status}
            onChange={(v) => update('relationship_status', v)}
          />
        </div>
        <div className="step-reveal">
          <FieldLabel>How long have you been together?</FieldLabel>
          <input
            type="text"
            value={data.years_together}
            onChange={(e) => update('years_together', e.target.value)}
            className={INPUT_CLASS}
            placeholder="e.g. 12 years"
          />
        </div>
        <div className="step-reveal">
          <FieldLabel>How would you rate your relationship right now? (1-10)</FieldLabel>
          <div className="mt-2">
            <input
              type="range"
              min="1"
              max="10"
              value={data.relationship_rating}
              onChange={(e) => update('relationship_rating', parseInt(e.target.value, 10))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="font-sans text-sm text-foreground/50">Struggling</span>
              <span className="font-outfit font-bold text-2xl text-primary">{data.relationship_rating}</span>
              <span className="font-sans text-sm text-foreground/50">Thriving</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChallenge = () => (
    <div className="max-w-lg mx-auto">
      <h2 className="step-reveal font-drama italic text-3xl md:text-4xl text-primary mb-2">
        What keeps coming up between you?
      </h2>
      <p className="step-reveal font-sans text-foreground/50 font-light mb-8">Step 3 of 5</p>

      <div className="space-y-8">
        <div className="step-reveal">
          <FieldLabel required>What is the biggest challenge in your relationship right now?</FieldLabel>
          <textarea
            rows={4}
            value={data.biggest_challenge}
            onChange={(e) => update('biggest_challenge', e.target.value)}
            className={`${INPUT_CLASS} resize-none`}
            placeholder="Maybe it's the same argument on repeat, or a distance that crept in quietly..."
          />
        </div>
        <div className="step-reveal">
          <FieldLabel>Have you tried counseling or coaching before?</FieldLabel>
          <RadioPills
            options={['Yes, it helped', 'Yes, but it didn\'t stick', 'No, this is our first step']}
            value={data.tried_before}
            onChange={(v) => update('tried_before', v)}
          />
        </div>
        <div className="step-reveal">
          <FieldLabel>Is your partner aware you're exploring this?</FieldLabel>
          <RadioPills
            options={['Yes', 'No']}
            value={data.partner_aware}
            onChange={(v) => update('partner_aware', v)}
          />
        </div>
        <div className="step-reveal">
          <FieldLabel>Is your partner willing to participate?</FieldLabel>
          <RadioPills
            options={['Yes', 'Not yet', 'Not sure']}
            value={data.partner_willing}
            onChange={(v) => update('partner_willing', v)}
          />
        </div>
      </div>
    </div>
  );

  const renderReadiness = () => (
    <div className="max-w-lg mx-auto">
      <h2 className="step-reveal font-drama italic text-3xl md:text-4xl text-primary mb-2">
        Imagine your relationship six months from now.
      </h2>
      <p className="step-reveal font-sans text-foreground/50 font-light mb-8">Step 4 of 5</p>

      <div className="space-y-8">
        <div className="step-reveal">
          <FieldLabel>If things could change, what would matter most to you?</FieldLabel>
          <RadioPills
            options={[
              'We communicate without it turning into a fight',
              'We feel close and connected again',
              'We rebuild the trust that was broken',
              'We learn to support each other through stress',
              'We understand each other\'s deeper needs',
            ]}
            value={data.ideal_outcome}
            onChange={(v) => update('ideal_outcome', v)}
          />
        </div>
        <div className="step-reveal">
          <FieldLabel>How soon are you looking to start?</FieldLabel>
          <RadioPills
            options={['ASAP', 'Within 3 months', 'No rush']}
            value={data.urgency}
            onChange={(v) => update('urgency', v)}
          />
        </div>
      </div>
    </div>
  );

  const renderFinal = () => (
    <div className="max-w-lg mx-auto">
      <h2 className="step-reveal font-drama italic text-3xl md:text-4xl text-primary mb-2">
        Almost there.
      </h2>
      <p className="step-reveal font-sans text-foreground/50 font-light mb-8">Step 5 of 5</p>

      <div className="space-y-8">
        <div className="step-reveal">
          <FieldLabel>Does faith play a role in your relationship? If so, how?</FieldLabel>
          <textarea
            rows={3}
            value={data.faith_role}
            onChange={(e) => update('faith_role', e.target.value)}
            className={`${INPUT_CLASS} resize-none`}
            placeholder="Optional — helps us tailor the experience."
          />
        </div>
        <div className="step-reveal">
          <FieldLabel>How did you hear about Healing Hearts?</FieldLabel>
          <input
            type="text"
            value={data.how_heard}
            onChange={(e) => update('how_heard', e.target.value)}
            className={INPUT_CLASS}
            placeholder="e.g. Instagram, a friend, Google..."
          />
        </div>
        <div className="step-reveal">
          <FieldLabel>What does your relationship look like at its best?</FieldLabel>
          <textarea
            rows={3}
            value={data.additional_notes}
            onChange={(e) => update('additional_notes', e.target.value)}
            className={`${INPUT_CLASS} resize-none`}
            placeholder="Think back to your happiest season together. What made it work?"
          />
        </div>
      </div>
    </div>
  );

  const STEPS = [renderIntro, renderContact, renderRelationship, renderChallenge, renderReadiness, renderFinal];

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="w-full min-h-screen bg-background pb-24">
      {/* Progress bar — visible on steps 1-5 */}
      {step > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary/10">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      <div ref={stepRef} className="pt-24 md:pt-32 px-6">
        {/* Error box */}
        {errors.length > 0 && (
          <div className="max-w-lg mx-auto mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl">
            <ul className="list-disc list-inside font-sans text-red-700 text-sm space-y-1">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Current step */}
        {STEPS[step]()}

        {/* Navigation — hidden on intro (intro has its own CTA) */}
        {step > 0 && (
          <div className="max-w-lg mx-auto mt-12 flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              className="flex items-center gap-1 font-sans text-foreground/60 hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {step < TOTAL_STEPS - 1 ? (
              <button
                type="button"
                onClick={next}
                className="px-8 py-4 rounded-full bg-primary text-background font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={status === 'sending'}
                className="px-8 py-4 rounded-full bg-accent text-background font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 flex items-center gap-2"
              >
                {status === 'sending' && <Loader2 className="w-5 h-5 animate-spin" />}
                {status === 'sending' ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
