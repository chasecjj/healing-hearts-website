// PracticePlanBlock — The 7-Day SPARK Practice (Chapter 6 of the Rescue Kit)
//
// Block shape in content_json:
//   {
//     "type": "practice_plan",
//     "plan_id": "7-day-spark-practice",
//     "title": "The 7-Day SPARK Practice",
//     "intro": "...",
//     "days": [
//       {"day": 1, "title": "Just notice", "body": "...", "prompt": "...", "prompt_rows": 2}
//     ],
//     "closing": "..."
//   }
//
// Props (flat, matching the LessonContent.jsx BLOCK_COMPONENTS convention):
//   - plan_id, title, intro, days, closing
//   - lessonId: the lesson UUID (injected by LessonContent.jsx)
//   - userId:   the current user auth UID (injected by LessonContent.jsx)
//
// Persistence: Supabase upsert via direct client writes with RLS.
// One row per (user_id, lesson_id, plan_id).
// days_completed: jsonb array of day numbers that are checked off
// notes_per_day: jsonb object mapping day number (as string) to note text
//
// v1: no date-gating — any day can be checked any time.
// v1.1: date-gated unlock (Day 3 unlocks on the 3rd calendar day).

import React, { useEffect, useMemo, useState } from 'react';

import { supabase } from '../../lib/supabase';
import {
  loadPracticePlanProgress,
  savePracticePlanProgress,
} from '../../lib/rescue-kit-helpers';

export default function PracticePlanBlock({
  plan_id,
  title,
  intro,
  days = [],
  closing,
  lessonId,
  userId,
}) {
  const [daysCompleted, setDaysCompleted] = useState([]);
  const [notesPerDay, setNotesPerDay] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Load existing progress on mount
  useEffect(() => {
    if (!userId || !lessonId || !plan_id) {
      setLoading(false);
      return;
    }
    loadPracticePlanProgress(supabase, {
      userId,
      lessonId,
      planId: plan_id,
    }).then(({ data }) => {
      if (data) {
        setDaysCompleted(data.days_completed || []);
        setNotesPerDay(data.notes_per_day || {});
        setLastSaved(data.updated_at);
      }
      setLoading(false);
    });
  }, [userId, lessonId, plan_id]);

  const totalDays = days.length || 7;
  const completedCount = daysCompleted.length;

  const progressPercent = useMemo(() => {
    return Math.round((completedCount / totalDays) * 100);
  }, [completedCount, totalDays]);

  function toggleDay(day) {
    setDaysCompleted((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day].sort((a, b) => a - b);
      }
    });
  }

  function updateNote(day, text) {
    setNotesPerDay((prev) => ({ ...prev, [String(day)]: text }));
  }

  async function handleSave() {
    setSaving(true);
    const { data, error } = await savePracticePlanProgress(supabase, {
      userId,
      lessonId,
      planId: plan_id,
      daysCompleted,
      notesPerDay,
    });
    if (error) {
      alert('Could not save your progress. Please try again.');
      setSaving(false);
      return;
    }
    setLastSaved(data?.updated_at || new Date().toISOString());
    setSaving(false);
  }

  if (loading) {
    return <div className="py-8 text-center text-foreground/60">Loading...</div>;
  }

  return (
    <div className="my-8 rounded-3xl border border-primary/10 bg-white p-8 md:p-12">
      {title && (
        <h3 className="font-drama text-3xl italic text-primary">{title}</h3>
      )}
      {intro && (
        <p className="mt-4 font-sans text-base leading-relaxed text-foreground/80">
          {intro}
        </p>
      )}

      {/* Progress bar */}
      <div className="mt-6 rounded-full bg-primary/5 p-1">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-accent to-primary transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="mt-2 font-sans text-sm text-foreground/60">
        {completedCount} of {totalDays} days complete
      </p>

      {/* Day cards */}
      <div className="mt-8 space-y-4">
        {days.map((dayData) => {
          const isComplete = daysCompleted.includes(dayData.day);
          return (
            <div
              key={dayData.day}
              className={`rounded-2xl border p-6 transition-colors ${
                isComplete
                  ? 'border-accent/40 bg-accent/5'
                  : 'border-primary/10 bg-[#F9F8F5]'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => toggleDay(dayData.day)}
                  aria-label={`Mark day ${dayData.day} ${isComplete ? 'incomplete' : 'complete'}`}
                  className={`mt-1 h-8 w-8 flex-shrink-0 rounded-full border-2 transition-colors ${
                    isComplete
                      ? 'border-accent bg-accent text-white'
                      : 'border-primary/30 hover:border-primary'
                  }`}
                >
                  {isComplete ? '\u2713' : ''}
                </button>
                <div className="flex-1">
                  <p className="font-outfit text-xs font-bold uppercase tracking-widest text-primary/60">
                    Day {dayData.day}
                  </p>
                  <h4 className="font-drama mt-1 text-xl italic text-primary">
                    {dayData.title}
                  </h4>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-foreground/80">
                    {dayData.body}
                  </p>

                  {dayData.prompt && (
                    <div className="mt-4">
                      <p className="font-outfit text-xs font-semibold text-primary/70">
                        {dayData.prompt}
                      </p>
                      <textarea
                        rows={dayData.prompt_rows || 2}
                        value={notesPerDay[String(dayData.day)] || ''}
                        onChange={(e) => updateNote(dayData.day, e.target.value)}
                        className="mt-2 w-full rounded-xl border border-primary/10 bg-white px-3 py-2 font-sans text-sm text-foreground/90 focus:border-primary focus:outline-none"
                        placeholder="Write a sentence or two..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save + closing */}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-white shadow-lg transition-shadow hover:shadow-xl disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save progress'}
        </button>
        {lastSaved && (
          <span className="font-sans text-xs text-foreground/50">
            Last saved {new Date(lastSaved).toLocaleString()}
          </span>
        )}
      </div>

      {closing && (
        <p className="mt-8 font-drama text-xl italic text-primary/80">
          {closing}
        </p>
      )}
    </div>
  );
}
