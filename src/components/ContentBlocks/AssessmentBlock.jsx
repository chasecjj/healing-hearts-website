// AssessmentBlock — Zones of Resilience Self-Assessment for the Rescue Kit
//
// Block shape in content_json:
//   {
//     "type": "assessment",
//     "assessment_id": "zones-resilience",
//     "title": "Where Do You Live Right Now?",
//     "intro": "...",
//     "questions": [{"id", "text", "type": "likert-4", "options": [...]}, ...],
//     "directional_question": {"id", "text", "options": [{"id", "label"}, ...]},
//     "scoring": {"method", "bands": [...]},
//     "results": {"<zone>": {"title", "body", "next_step"}, ...}
//   }
//
// Props (flat, matching the existing LessonContent.jsx BLOCK_COMPONENTS convention
// where blocks are rendered via `<Renderer {...block} lessonId={...} userId={...} />`):
//   - assessment_id, title, intro, questions, directional_question, scoring, results
//   - lessonId: the lesson UUID (injected by LessonContent.jsx)
//   - userId:   the current user auth UID (injected by LessonContent.jsx)
//
// Persistence: Supabase direct client writes with RLS enforcement.
// Each submission creates a new row in assessment_results. History is readable.

import React, { useEffect, useState } from 'react';

import { supabase } from '../../lib/supabase';
import {
  loadLatestAssessmentResult,
  saveAssessmentResult,
} from '../../lib/rescue-kit-helpers';

export default function AssessmentBlock({
  assessment_id,
  title,
  intro,
  questions = [],
  directional_question,
  scoring,
  results = {},
  lessonId,
  userId,
}) {
  const [responses, setResponses] = useState({});
  const [direction, setDirection] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRetake, setShowRetake] = useState(false);

  // Load latest result on mount
  useEffect(() => {
    if (!userId || !lessonId || !assessment_id) {
      setLoading(false);
      return;
    }
    loadLatestAssessmentResult(supabase, {
      userId,
      lessonId,
      assessmentId: assessment_id,
    }).then(({ data }) => {
      if (data) {
        setResult({
          zone: data.result_zone,
          totalScore: data.total_score,
          createdAt: data.created_at,
          display: results[data.result_zone],
        });
      }
      setLoading(false);
    });
  }, [userId, lessonId, assessment_id, results]);

  function handleResponseChange(questionId, optionIndex) {
    setResponses((prev) => ({ ...prev, [questionId]: optionIndex + 1 }));
  }

  function computeZone() {
    const totalScore = Object.values(responses).reduce((a, b) => a + b, 0);
    const band = (scoring?.bands || []).find((b) => {
      if (totalScore < b.min || totalScore > b.max) return false;
      if (b.direction === 'any') return true;
      return b.direction === direction;
    });
    return { totalScore, zone: band?.zone ?? 'unknown' };
  }

  async function handleSubmit() {
    const answeredCount = Object.keys(responses).length;
    if (answeredCount < questions.length) {
      alert(`Please answer all ${questions.length} questions.`);
      return;
    }
    if (directional_question && !direction) {
      alert('Please answer the direction question.');
      return;
    }
    setSubmitting(true);
    const { totalScore, zone } = computeZone();
    const { data, error } = await saveAssessmentResult(supabase, {
      userId,
      lessonId,
      assessmentId: assessment_id,
      responses: { answers: responses, direction },
      totalScore,
      resultZone: zone,
    });
    if (error) {
      alert('Could not save your result. Please try again.');
      setSubmitting(false);
      return;
    }
    setResult({
      zone,
      totalScore,
      createdAt: data?.created_at,
      display: results[zone],
    });
    setShowRetake(false);
    setSubmitting(false);
  }

  function handleRetake() {
    setResponses({});
    setDirection(null);
    setShowRetake(true);
    setResult(null);
  }

  if (loading) {
    return <div className="py-8 text-center text-foreground/60">Loading...</div>;
  }

  // If we have a result and the user hasn't asked to retake, show it
  if (result && !showRetake) {
    return (
      <div className="my-8 rounded-3xl border border-primary/10 bg-background p-8 md:p-12">
        <p className="font-outfit text-xs font-bold uppercase tracking-widest text-primary/60">
          Your current zone
        </p>
        <h3 className="font-drama mt-2 text-4xl italic text-primary">
          {result.display?.title ?? result.zone}
        </h3>
        <p className="mt-6 font-sans text-base leading-relaxed text-foreground/80">
          {result.display?.body}
        </p>
        {result.display?.next_step && (
          <div className="mt-6 border-l-2 border-accent pl-4">
            <p className="font-outfit text-xs font-bold uppercase tracking-widest text-accent">
              One small next step
            </p>
            <p className="mt-2 font-sans text-base text-foreground/90">
              {result.display.next_step}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={handleRetake}
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary/20 px-5 py-2 text-sm font-medium text-primary hover:bg-primary/5"
        >
          Retake the assessment
        </button>
      </div>
    );
  }

  // Otherwise, show the questions
  return (
    <div className="my-8 rounded-3xl border border-primary/10 bg-white p-8 md:p-12">
      {title && (
        <h3 className="font-drama text-4xl italic text-primary">{title}</h3>
      )}
      {intro && (
        <p className="mt-4 font-sans text-base leading-relaxed text-foreground/80">
          {intro}
        </p>
      )}

      <div className="mt-8 space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="rounded-2xl border border-primary/5 p-5">
            <p className="font-sans text-base font-medium text-foreground/90">
              {idx + 1}. {q.text}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(q.options || []).map((opt, optIdx) => {
                const selected = responses[q.id] === optIdx + 1;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleResponseChange(q.id, optIdx)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      selected
                        ? 'border-primary bg-primary text-white'
                        : 'border-primary/20 text-foreground/70 hover:border-primary/40'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {directional_question && (
        <div className="mt-8 rounded-2xl border-2 border-accent/20 bg-accent/5 p-5">
          <p className="font-sans text-base font-medium text-foreground/90">
            {directional_question.text}
          </p>
          <div className="mt-4 space-y-2">
            {(directional_question.options || []).map((opt) => {
              const selected = direction === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDirection(opt.id)}
                  className={`block w-full rounded-xl border px-5 py-3 text-left text-sm font-medium transition-colors ${
                    selected
                      ? 'border-accent bg-accent text-white'
                      : 'border-accent/20 text-foreground/80 hover:border-accent/40'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 font-medium text-white shadow-lg transition-shadow hover:shadow-xl disabled:opacity-50"
      >
        {submitting ? 'Saving...' : 'See My Result'}
      </button>
    </div>
  );
}
