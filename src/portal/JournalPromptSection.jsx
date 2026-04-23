import React, { useState } from 'react';
import { Textarea } from '@scoria/ui';
import { PenLine, Check, ChevronDown } from 'lucide-react';
import { useJournal } from '../hooks/useJournal';
import MoodSelector from './MoodSelector';

/**
 * JournalPromptSection — prompted reflection journal tied to lesson curriculum.
 * Only rendered when a lesson has a `reflection` block type.
 * UX role: curriculum-driven prompted writing (distinct from Notes = private scratchpad).
 */
export default function JournalPromptSection({ lessonId, moduleId, prompt }) {
  const { entries, loading, saveEntry } = useJournal({ lessonId, moduleId });
  const [expanded, setExpanded] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [draftMood, setDraftMood] = useState(null);
  const [saving, setSaving] = useState(false);

  const hasEntries = entries && entries.length > 0;
  const shouldShow = expanded || hasEntries;

  async function handleSave() {
    if (!draftText.trim()) return;
    setSaving(true);
    try {
      await saveEntry({
        lessonId,
        moduleId,
        promptText: prompt,
        entryText: draftText.trim(),
        mood: draftMood,
      });
      setDraftText('');
      setDraftMood(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)',
        border: '1px solid var(--pt-elevation-2-hex, #d6d3d1)',
      }}
      data-lesson-animate
    >
      {/* Toggle header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-200/60 transition-colors"
        aria-expanded={shouldShow}
      >
        <div className="flex items-center gap-3">
          <PenLine
            className="w-5 h-5"
            style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)', opacity: 0.7 }}
          />
          <span className="font-outfit font-semibold text-sm text-foreground/80">
            Reflection Journal
          </span>
          {hasEntries && (
            <span className="text-xs text-foreground/40 font-sans">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-foreground/40 transition-transform duration-200 ${
            shouldShow ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Journal content */}
      {shouldShow && (
        <div className="px-6 pb-6 space-y-6">
          {/* Prompt display */}
          {prompt && (
            <div className="flex gap-3 items-start bg-white rounded-xl p-4 border border-neutral-200">
              <PenLine
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)' }}
              />
              <p className="text-sm text-foreground/60 italic leading-relaxed">
                {prompt}
              </p>
            </div>
          )}

          {/* New entry form */}
          <div className="space-y-4">
            <MoodSelector value={draftMood} onChange={setDraftMood} />
            <Textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="Write your reflection..."
              className="bg-white min-h-[120px] resize-y"
              aria-label="Journal reflection entry"
              maxLength={5000}
            />
            <button
              onClick={handleSave}
              disabled={saving || !draftText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-outfit font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              style={{ backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)' }}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Reflection'}
            </button>
          </div>

          {/* Previous entries */}
          {hasEntries && (
            <div className="space-y-4 pt-4 border-t border-neutral-200">
              <h4 className="text-xs font-outfit uppercase tracking-widest text-foreground/40">
                Previous Reflections
              </h4>
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-xl p-4 border border-neutral-100"
                >
                  {entry.mood && (
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-outfit font-semibold mb-2"
                      style={{
                        backgroundColor: 'var(--pt-elevation-2-hex, #d6d3d1)',
                        color: 'var(--pt-primary-accent-hex, #B96A5F)',
                      }}
                    >
                      {entry.mood}
                    </span>
                  )}
                  <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap">
                    {entry.entry_text}
                  </p>
                  <span className="block mt-2 text-xs text-foreground/30 font-sans">
                    {new Date(entry.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
