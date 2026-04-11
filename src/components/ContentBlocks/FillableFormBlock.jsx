// FillableFormBlock — Persistent fillable form for Rescue Kit artifacts
//
// Used by: Conflict Recovery Plan, SPARK Pact, reflection prompts, post-reset
// journal, and Module 7 retrofit fake-form replacements.
//
// Block shape in content_json:
//   {
//     "type": "fillable_form",
//     "form_id": "conflict-recovery-plan",
//     "title": "The Conflict Recovery Plan",
//     "intro": "...",
//     "fields": [
//       {"id", "label", "type": "textarea" | "radio" | "text", "rows"?, "options"?, "placeholder"?}
//     ],
//     "instructions": "..."  (optional, shown after the form)
//   }
//
// Props (flat, matching the LessonContent.jsx BLOCK_COMPONENTS convention):
//   - form_id, title, intro, fields, instructions
//   - lessonId: the lesson UUID (injected by LessonContent.jsx)
//   - userId:   the current user auth UID (injected by LessonContent.jsx)
//
// Persistence: Supabase upsert via direct client writes with RLS.
// One row per (user_id, lesson_id, form_id). Save replaces the whole fields object.
// v1: manual Save button. v1.1 will add autosave.

import React, { useEffect, useState } from 'react';

import { supabase } from '../../lib/supabase';
import {
  loadFormResponse,
  saveFormResponse,
} from '../../lib/rescue-kit-helpers';

export default function FillableFormBlock({
  form_id,
  title,
  intro,
  fields = [],
  instructions,
  lessonId,
  userId,
}) {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [dirty, setDirty] = useState(false);

  // Load existing response on mount
  useEffect(() => {
    if (!userId || !lessonId || !form_id) {
      setLoading(false);
      return;
    }
    loadFormResponse(supabase, {
      userId,
      lessonId,
      formId: form_id,
    }).then(({ data }) => {
      if (data) {
        setValues(data.fields || {});
        setLastSaved(data.updated_at);
      }
      setLoading(false);
    });
  }, [userId, lessonId, form_id]);

  function handleChange(fieldId, value) {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    const { data, error } = await saveFormResponse(supabase, {
      userId,
      lessonId,
      formId: form_id,
      fields: values,
    });
    if (error) {
      alert('Could not save. Please try again.');
      setSaving(false);
      return;
    }
    setLastSaved(data?.updated_at || new Date().toISOString());
    setDirty(false);
    setSaving(false);
  }

  function handleClear() {
    if (
      !confirm(
        'Clear everything you have written here? This cannot be undone.'
      )
    ) {
      return;
    }
    setValues({});
    setDirty(true);
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

      <div className="mt-8 space-y-6">
        {fields.map((field) => (
          <div key={field.id}>
            <label
              htmlFor={field.id}
              className="font-outfit text-sm font-bold text-primary"
            >
              {field.label}
            </label>

            {field.type === 'textarea' && (
              <textarea
                id={field.id}
                rows={field.rows || 3}
                value={values[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="mt-2 w-full rounded-xl border border-primary/10 bg-[#F9F8F5] px-4 py-3 font-sans text-base text-foreground/90 placeholder:text-foreground/40 focus:border-primary focus:outline-none"
              />
            )}

            {field.type === 'text' && (
              <input
                id={field.id}
                type="text"
                value={values[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="mt-2 w-full rounded-xl border border-primary/10 bg-[#F9F8F5] px-4 py-3 font-sans text-base text-foreground/90 placeholder:text-foreground/40 focus:border-primary focus:outline-none"
              />
            )}

            {field.type === 'radio' && (
              <div className="mt-3 flex flex-wrap gap-2">
                {(field.options || []).map((opt) => {
                  const selected = values[field.id] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleChange(field.id, opt)}
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
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-white shadow-lg transition-shadow hover:shadow-xl disabled:opacity-50"
        >
          {saving ? 'Saving...' : dirty ? 'Save' : 'Saved'}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center rounded-full border border-primary/20 px-5 py-2 text-sm font-medium text-primary/70 hover:bg-primary/5"
        >
          Clear and start fresh
        </button>
        {lastSaved && !dirty && (
          <span className="font-sans text-xs text-foreground/50">
            Last saved {new Date(lastSaved).toLocaleString()}
          </span>
        )}
      </div>

      {instructions && (
        <div className="mt-8 rounded-2xl border-l-2 border-accent bg-[#F9F8F5] p-5">
          <p className="font-sans text-sm leading-relaxed text-foreground/80">
            {instructions}
          </p>
        </div>
      )}
    </div>
  );
}
