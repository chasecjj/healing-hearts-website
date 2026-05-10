/**
 * JournalEntryDetail — expanded edit view for a single journal entry inside
 * the right-drawer journal panel.
 *
 * Wave 10 J3.
 *
 * Renders:
 *   - prompt_text (Cormorant italic, quote-block register)
 *   - lesson breadcrumb + relative timestamp
 *   - entry_text textarea (warm-stone, focus-visible ring per Wave 9 LOW-07)
 *   - MoodSelector (10 values per mig 014 CHECK constraint)
 *   - Save (calls updateEntry — optimistic via useJournal)
 *   - Delete (gated by InlineConfirm per Wave 4B §A-02)
 *   - Back-to-list button
 *
 * Notes:
 *   - No `dangerouslySetInnerHTML` anywhere (CLAUDE.md rule).
 *   - Editing is local-buffered; Save flushes. Cancel via Back returns to list
 *     without saving (consistent with NoteDrawer's close-without-save pattern).
 */

import React, { useEffect, useState } from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { getTypeStyle } from './design/typography';
import InlineConfirm from './components/InlineConfirm';
import MoodSelector from './MoodSelector';

function formatRelative(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  if (diffMs < 0) return 'just now';
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return new Date(iso).toLocaleDateString();
}

function buildBreadcrumb(entry) {
  const lesson = entry?.lessons;
  const module_ = entry?.modules || lesson?.modules;
  const modPart = module_?.module_number
    ? `Module ${module_.module_number}`
    : module_?.title || null;
  const lessonPart = lesson?.title || null;
  if (modPart && lessonPart) return `${modPart} → ${lessonPart}`;
  if (modPart) return modPart;
  if (lessonPart) return lessonPart;
  return null;
}

export default function JournalEntryDetail({ entry, onBack, onUpdate, onDelete }) {
  const [text, setText] = useState(entry?.entry_text || '');
  const [mood, setMood] = useState(entry?.mood || null);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingBack, setConfirmingBack] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // If parent swaps the entry prop (e.g. sync from refetch), refresh local
  useEffect(() => {
    setText(entry?.entry_text || '');
    setMood(entry?.mood || null);
  }, [entry?.id, entry?.entry_text, entry?.mood]);

  if (!entry) return null;

  const breadcrumb = buildBreadcrumb(entry);
  const dirty = text !== (entry.entry_text || '') || mood !== (entry.mood || null);

  const handleSave = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      await onUpdate(entry.id, { entryText: text, mood });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1600);
    } catch (e) {
      // useJournal rolls back; surface error inline
      console.warn('[journal] update failed:', e?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await onDelete(entry.id);
      // parent (JournalView) navigates back to list on success
    } catch (e) {
      console.warn('[journal] delete failed:', e?.message);
      setConfirmingDelete(false);
    }
  };

  // Asymmetric Delete-warned / Back-silent was a friction point users in this
  // population are most likely to hit (per UX-07). Mirror the InlineConfirm
  // pattern for Back when there are unsaved changes.
  const handleBackClick = () => {
    if (dirty) {
      setConfirmingBack(true);
    } else {
      onBack();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header bar with back + delete */}
      <div className="flex items-center justify-between px-3 py-2 flex-shrink-0">
        <button
          type="button"
          onClick={handleBackClick}
          className="flex items-center gap-1 px-2 py-1 rounded-md focus-visible:outline-none focus-visible:ring-2"
          style={{
            ...getTypeStyle('caption', 'medium'),
            color: 'var(--pt-text-muted-hex, #57534e)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            outlineColor: 'var(--pt-focus-ring-hex, #B96A5F)',
          }}
          aria-label="Back to journal list"
          disabled={confirmingBack}
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
          Back
        </button>

        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className="flex items-center gap-1 px-2 py-1 rounded-md focus-visible:outline-none focus-visible:ring-2"
          style={{
            ...getTypeStyle('caption', 'medium'),
            color: 'var(--pt-text-muted-hex, #57534e)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            outlineColor: 'var(--pt-focus-ring-hex, #B96A5F)',
          }}
          aria-label="Delete entry"
          disabled={confirmingDelete}
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
          Delete
        </button>
      </div>

      {/* Body — scrollable */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {/* Inline confirm row when delete pressed */}
        {confirmingDelete && (
          <InlineConfirm
            message="Delete this journal entry? This can't be undone."
            onConfirm={handleDeleteConfirm}
            onCancel={() => setConfirmingDelete(false)}
          />
        )}

        {/* Inline confirm when Back pressed with unsaved changes */}
        {confirmingBack && (
          <InlineConfirm
            message="You have unsaved changes. Leave without saving?"
            onConfirm={() => {
              setConfirmingBack(false);
              onBack();
            }}
            onCancel={() => setConfirmingBack(false)}
          />
        )}

        {/* Prompt-text quote (highlighted source) */}
        {entry.prompt_text && (
          <blockquote
            style={{
              fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 17,
              lineHeight: 1.5,
              color: 'var(--pt-text-primary-hex, #1c1917)',
              margin: '8px 0 12px',
              paddingInlineStart: 12,
              borderInlineStart: '2px solid var(--pt-primary-accent-hex, #B96A5F)',
            }}
          >
            "{entry.prompt_text}"
          </blockquote>
        )}

        {/* Breadcrumb + timestamp */}
        <p
          style={{
            ...getTypeStyle('meta'),
            color: 'var(--pt-text-muted-hex, #57534e)',
            margin: '0 0 14px',
          }}
        >
          {breadcrumb && <span>{breadcrumb} · </span>}
          <span>{formatRelative(entry.created_at)}</span>
        </p>

        {/* entry_text textarea */}
        <label
          htmlFor={`journal-entry-${entry.id}`}
          style={{
            ...getTypeStyle('meta', 'semibold'),
            color: 'var(--pt-text-muted-hex, #57534e)',
            textTransform: 'uppercase',
            display: 'block',
            margin: '0 0 6px',
          }}
        >
          Your reflection
        </label>
        <textarea
          id={`journal-entry-${entry.id}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What are you noticing?"
          rows={6}
          className="w-full px-3 py-2 rounded-md focus-visible:outline-none focus-visible:ring-2"
          style={{
            ...getTypeStyle('body'),
            backgroundColor: 'var(--pt-elevation-2-hex, #ffffff)',
            color: 'var(--pt-text-primary-hex, #1c1917)',
            border: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
            resize: 'vertical',
            minHeight: 96,
            outlineColor: 'var(--pt-focus-ring-hex, #B96A5F)',
          }}
        />

        {/* Mood selector */}
        <div style={{ marginTop: 14 }}>
          <p
            style={{
              ...getTypeStyle('meta', 'semibold'),
              color: 'var(--pt-text-muted-hex, #57534e)',
              textTransform: 'uppercase',
              margin: '0 0 6px',
            }}
          >
            Mood (optional)
          </p>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        {/* Save row */}
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className="px-4 py-2 rounded-md focus-visible:outline-none focus-visible:ring-2"
            style={{
              ...getTypeStyle('body', 'semibold'),
              backgroundColor: dirty
                ? 'var(--pt-primary-accent-hex, #B96A5F)'
                : 'var(--pt-elevation-1-hex, #e7e5e4)',
              color: dirty
                ? 'var(--pt-text-inverse-hex, #fafaf9)'
                : 'var(--pt-text-muted-hex, #57534e)',
              border: 'none',
              cursor: dirty && !saving ? 'pointer' : 'not-allowed',
              outlineColor: 'var(--pt-focus-ring-hex, #B96A5F)',
              transition: 'background-color 150ms ease',
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>

          {savedFlash && (
            <span
              role="status"
              aria-live="polite"
              style={{
                ...getTypeStyle('caption'),
                color: 'var(--pt-text-muted-hex, #57534e)',
              }}
            >
              Saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
