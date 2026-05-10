import React, { useState, useEffect } from 'react';
import { Textarea } from '@scoria/ui';
import { StickyNote, ChevronDown, Check } from 'lucide-react';
import { useLessonNotes } from '../hooks/useLessonNotes';

/**
 * LessonNotesPanel — collapsible notes section for per-lesson note-taking.
 * Autosaves with debounce. Shows save status indicator.
 * UX role: private scratchpad (distinct from Journal = prompted reflections).
 */
export default function LessonNotesPanel({ lessonId }) {
  const { notes, setNotes, saving, lastSaved, error, loading } =
    useLessonNotes(lessonId);
  const [expanded, setExpanded] = useState(false);

  // Auto-expand if notes already exist (only on initial load)
  useEffect(() => {
    if (!loading && notes && notes.length > 0) setExpanded(true);
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="bg-neutral-50 rounded-2xl border border-neutral-100 overflow-hidden transition-all duration-300"
      data-lesson-animate
    >
      {/* Toggle header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-100/50 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <StickyNote className="w-5 h-5 text-foreground/50" />
          <span className="font-outfit font-semibold text-sm text-foreground/80">
            My Notes
          </span>
          {notes && notes.length > 0 && !expanded && (
            <span className="text-xs text-foreground/40 font-sans truncate max-w-[200px]">
              {notes.slice(0, 50)}...
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Save status */}
          {expanded && (
            <span className="text-xs font-sans text-foreground/40">
              {saving && 'Saving...'}
              {!saving && error && (
                <span className="text-red-500">{error}</span>
              )}
              {!saving && !error && lastSaved && (
                <span className="flex items-center gap-1 text-green-600">
                  <Check className="w-3 h-3" />
                  Saved
                </span>
              )}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-foreground/40 transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Notes textarea */}
      {expanded && (
        <div className="px-6 pb-6">
          {loading ? (
            <div className="h-[88px] bg-neutral-100 rounded-xl animate-pulse" />
          ) : (
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down your thoughts as you read..."
              className="bg-white min-h-[120px] resize-y"
              aria-label="Lesson notes"
            />
          )}
          <p className="text-xs text-foreground/30 mt-2 font-sans">
            Your private notes — only you can see these.
          </p>
        </div>
      )}
    </div>
  );
}
