/**
 * JournalView — content of the right-drawer journal panel.
 *
 * Wave 10 J2 + J5.
 * Wave 11 J1 — currentLessonId / currentModuleId now flow from
 *   JournalPanelContext (set by CoursePortal); props remain the
 *   pass-through shape from PortalLayout.
 * Wave 11 J2 — filter chips: All / This lesson / This module / By mood.
 *
 * Three modes:
 *   - LIST   (default) — recent entries, scrollable, click-to-detail
 *   - DETAIL          — single entry expanded for edit (JournalEntryDetail)
 *   - COMPOSE         — direct-add quick-capture form (J5)
 *
 * Notes:
 *   - Empty state copy per Axis A brief (A-11 register match).
 *   - Direct-add (J5) blocks empty entries client-side: requires non-empty
 *     entry_text OR a non-null mood (mood-only is allowed — capturing a vibe
 *     is itself a reflection per grief-informed register).
 *   - Lesson/module FK derived from optional currentLessonId/currentModuleId
 *     props (passed in by the consumer that knows the route context). When
 *     absent, entries save with both FKs = null (panel is reachable from
 *     non-lesson surfaces too — Sanctuary, Bookmarks, Calendar).
 *   - Filter state is ephemeral (local useState, resets to 'all' when panel
 *     closes). No localStorage persistence — too much cognitive load.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTypeStyle } from './design/typography';
import { useJournal } from './hooks/useJournal';
import { MOOD_OPTIONS } from '../lib/constants';
import JournalEntryDetail from './JournalEntryDetail';
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

function truncate(s, n = 100) {
  if (!s) return '';
  if (s.length <= n) return s;
  return `${s.slice(0, n - 1).trimEnd()}…`;
}

// ── Header ────────────────────────────────────────────────────────────────
function JournalHeader({ onCompose }) {
  return (
    <div
      className="flex items-start justify-between flex-shrink-0"
      style={{ padding: '14px 16px 6px' }}
    >
      <div>
        <p
          style={{
            fontFamily: '"Outfit", sans-serif',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'var(--pt-text-muted-hex, #57534e)',
            margin: 0,
          }}
        >
          Your journal
        </p>
        <h2
          style={{
            fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 22,
            lineHeight: 1.1,
            color: 'var(--pt-text-primary-hex, #1c1917)',
            margin: '4px 0 0',
          }}
        >
          Reflections
        </h2>
      </div>

      <button
        type="button"
        onClick={onCompose}
        aria-label="New journal entry"
        title="New entry"
        className="flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2"
        style={{
          width: 32,
          height: 32,
          backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)',
          color: 'var(--pt-text-inverse-hex, #fafaf9)',
          border: 'none',
          cursor: 'pointer',
          outlineColor: 'var(--pt-focus-ring-hex, #B96A5F)',
          flexShrink: 0,
        }}
      >
        <Plus className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}

// ── Filter chip row (Wave 11 J2) ──────────────────────────────────────────
/**
 * Chips: All | This lesson (hidden if no lessonId) | This module (hidden if
 * no moduleId) | By mood (always shown, opens popover with multi-select pills)
 *
 * Active chip style: filled bg = --pt-primary-accent-hex, text = --pt-text-inverse-hex
 * Inactive chip style: transparent bg, border 1px --pt-border-subtle-hex, text --pt-text-muted-hex
 */
function FilterChips({
  activeFilter,
  onFilterChange,
  currentLessonId,
  currentModuleId,
  selectedMoods,
  onMoodsChange,
}) {
  const [moodPopoverOpen, setMoodPopoverOpen] = useState(false);
  const popoverRef = useRef(null);
  const moodBtnRef = useRef(null);

  // Close popover on click-outside
  useEffect(() => {
    if (!moodPopoverOpen) return undefined;
    const handler = (e) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target) &&
        moodBtnRef.current && !moodBtnRef.current.contains(e.target)
      ) {
        setMoodPopoverOpen(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [moodPopoverOpen]);

  // Close popover on ESC
  useEffect(() => {
    if (!moodPopoverOpen) return undefined;
    const handler = (e) => {
      if (e.key === 'Escape') setMoodPopoverOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [moodPopoverOpen]);

  const chipStyle = (isActive) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 10px',
    borderRadius: 9999,
    border: isActive
      ? '1px solid transparent'
      : '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
    backgroundColor: isActive
      ? 'var(--pt-primary-accent-hex, #B96A5F)'
      : 'transparent',
    color: isActive
      ? 'var(--pt-text-inverse-hex, #fafaf9)'
      : 'var(--pt-text-muted-hex, #57534e)',
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: '"Outfit", sans-serif',
    fontWeight: 500,
    letterSpacing: '0.04em',
    transition: 'background-color 120ms ease, color 120ms ease',
    whiteSpace: 'nowrap',
  });

  const isMoodActive = activeFilter === 'mood' && selectedMoods.length > 0;

  const toggleMood = (moodValue) => {
    if (selectedMoods.includes(moodValue)) {
      const next = selectedMoods.filter((m) => m !== moodValue);
      onMoodsChange(next);
      if (next.length === 0) {
        // no moods selected → revert to 'all'
        onFilterChange('all');
      } else {
        onFilterChange('mood');
      }
    } else {
      onMoodsChange([...selectedMoods, moodValue]);
      onFilterChange('mood');
    }
  };

  return (
    <div
      style={{
        padding: '6px 16px 8px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        alignItems: 'center',
        borderBottom: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
        position: 'relative',
      }}
      role="group"
      aria-label="Filter journal entries"
    >
      {/* All */}
      <button
        type="button"
        onClick={() => onFilterChange('all')}
        aria-pressed={activeFilter === 'all'}
        style={chipStyle(activeFilter === 'all')}
        className="focus-visible:outline-none focus-visible:ring-2"
      >
        All
      </button>

      {/* This lesson — hidden when no lessonId */}
      {currentLessonId !== null && (
        <button
          type="button"
          onClick={() => onFilterChange('lesson')}
          aria-pressed={activeFilter === 'lesson'}
          style={chipStyle(activeFilter === 'lesson')}
          className="focus-visible:outline-none focus-visible:ring-2"
        >
          This lesson
        </button>
      )}

      {/* This module — hidden when no moduleId */}
      {currentModuleId !== null && (
        <button
          type="button"
          onClick={() => onFilterChange('module')}
          aria-pressed={activeFilter === 'module'}
          style={chipStyle(activeFilter === 'module')}
          className="focus-visible:outline-none focus-visible:ring-2"
        >
          This module
        </button>
      )}

      {/* By mood — always shown; opens multi-select popover */}
      <div style={{ position: 'relative' }}>
        <button
          ref={moodBtnRef}
          type="button"
          onClick={() => setMoodPopoverOpen((o) => !o)}
          aria-pressed={isMoodActive}
          aria-expanded={moodPopoverOpen}
          aria-haspopup="listbox"
          style={chipStyle(isMoodActive)}
          className="focus-visible:outline-none focus-visible:ring-2"
        >
          {isMoodActive && selectedMoods.length > 0
            ? `Mood (${selectedMoods.length})`
            : 'By mood'}
        </button>

        {/* Mood multi-select popover */}
        {moodPopoverOpen && (
          <div
            ref={popoverRef}
            role="listbox"
            aria-multiselectable="true"
            aria-label="Select moods to filter by"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              zIndex: 50,
              backgroundColor: 'var(--pt-elevation-2-hex, #ffffff)',
              border: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
              borderRadius: 8,
              boxShadow: '0 4px 16px rgba(28,25,23,0.12)',
              padding: '10px 12px',
              width: 200,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            {MOOD_OPTIONS.map((mood) => {
              const isSelected = selectedMoods.includes(mood.value);
              return (
                <button
                  key={mood.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggleMood(mood.value)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 9999,
                    border: isSelected
                      ? '1px solid transparent'
                      : '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
                    backgroundColor: isSelected
                      ? 'var(--pt-primary-accent-hex, #B96A5F)'
                      : 'transparent',
                    color: isSelected
                      ? 'var(--pt-text-inverse-hex, #fafaf9)'
                      : 'var(--pt-text-muted-hex, #57534e)',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontFamily: '"Outfit", sans-serif',
                    fontWeight: 500,
                    transition: 'background-color 120ms ease, color 120ms ease',
                    textTransform: 'capitalize',
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2"
                >
                  {mood.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── List item ─────────────────────────────────────────────────────────────
function EntryCard({ entry, onClick }) {
  const [hovered, setHovered] = useState(false);
  const breadcrumb = buildBreadcrumb(entry);
  const excerpt = truncate(entry.prompt_text || entry.entry_text, 100);
  const reflectionPreview =
    entry.prompt_text && entry.entry_text ? truncate(entry.entry_text, 80) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full text-start rounded-lg focus-visible:outline-none focus-visible:ring-2"
      style={{
        padding: '10px 12px',
        backgroundColor: hovered
          ? 'var(--pt-drawer-hover-hex, #a8a29e)'
          : 'transparent',
        color: 'var(--pt-text-primary-hex, #1c1917)',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 150ms ease',
        outlineColor: 'var(--pt-focus-ring-hex, #B96A5F)',
        opacity: entry.__optimistic ? 0.6 : 1,
      }}
    >
      {/* Top row: timestamp + (optional) mood pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <span
          style={{
            ...getTypeStyle('meta', 'semibold'),
            color: 'var(--pt-text-muted-hex, #57534e)',
            textTransform: 'uppercase',
          }}
        >
          {formatRelative(entry.created_at)}
        </span>
        {entry.mood && (
          <span
            style={{
              ...getTypeStyle('meta'),
              color: 'var(--pt-text-muted-hex, #57534e)',
              backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)',
              padding: '1px 8px',
              borderRadius: 9999,
              lineHeight: 1.4,
              textTransform: 'capitalize',
            }}
          >
            {entry.mood}
          </span>
        )}
      </div>

      {/* Excerpt — prompt_text or entry_text */}
      {excerpt && (
        <p
          style={{
            fontFamily: entry.prompt_text
              ? '"Cormorant Garamond", "Playfair Display", Georgia, serif'
              : '"Plus Jakarta Sans", sans-serif',
            fontStyle: entry.prompt_text ? 'italic' : 'normal',
            fontSize: 14,
            lineHeight: 1.5,
            color: 'var(--pt-text-primary-hex, #1c1917)',
            margin: '6px 0 0',
          }}
        >
          {entry.prompt_text ? `"${excerpt}"` : excerpt}
        </p>
      )}

      {/* Reflection preview if both prompt + reflection exist */}
      {reflectionPreview && (
        <p
          style={{
            ...getTypeStyle('caption'),
            color: 'var(--pt-text-muted-hex, #57534e)',
            margin: '4px 0 0',
          }}
        >
          {reflectionPreview}
        </p>
      )}

      {/* Breadcrumb */}
      {breadcrumb && (
        <p
          style={{
            ...getTypeStyle('meta'),
            color: 'var(--pt-text-muted-hex, #57534e)',
            margin: '6px 0 0',
          }}
        >
          {breadcrumb}
        </p>
      )}
    </button>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────
function EmptyState({ onCompose }) {
  return (
    <div
      className="flex flex-col items-start gap-3"
      style={{ padding: '12px 16px 20px' }}
    >
      <p
        style={{
          fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 18,
          lineHeight: 1.4,
          color: 'var(--pt-text-primary-hex, #1c1917)',
          margin: 0,
        }}
      >
        Your journal is quiet for now.
      </p>
      <p
        style={{
          ...getTypeStyle('body'),
          color: 'var(--pt-text-muted-hex, #57534e)',
          margin: 0,
        }}
      >
        Highlight any text in a lesson and tap{' '}
        <span style={{ fontWeight: 600 }}>Add to Journal</span> to start your
        reflections — or write a new entry below.
      </p>
      <button
        type="button"
        onClick={onCompose}
        className="px-3 py-2 rounded-md focus-visible:outline-none focus-visible:ring-2"
        style={{
          ...getTypeStyle('body', 'semibold'),
          backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)',
          color: 'var(--pt-text-inverse-hex, #fafaf9)',
          border: 'none',
          cursor: 'pointer',
          outlineColor: 'var(--pt-focus-ring-hex, #B96A5F)',
          marginTop: 4,
        }}
      >
        New entry
      </button>
    </div>
  );
}

// ── Empty filter state (Wave 11 J2) ───────────────────────────────────────
function EmptyFilterState({ onShowAll }) {
  return (
    <div
      className="flex flex-col items-start gap-3"
      style={{ padding: '12px 16px 20px' }}
    >
      <p
        style={{
          fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 16,
          lineHeight: 1.4,
          color: 'var(--pt-text-primary-hex, #1c1917)',
          margin: 0,
        }}
      >
        No entries match this filter.
      </p>
      <p
        style={{
          ...getTypeStyle('body'),
          color: 'var(--pt-text-muted-hex, #57534e)',
          margin: 0,
        }}
      >
        Try All to see everything.
      </p>
      <button
        type="button"
        onClick={onShowAll}
        className="px-3 py-2 rounded-md focus-visible:outline-none focus-visible:ring-2"
        style={{
          ...getTypeStyle('body', 'semibold'),
          backgroundColor: 'transparent',
          color: 'var(--pt-primary-accent-hex, #B96A5F)',
          border: '1px solid var(--pt-primary-accent-hex, #B96A5F)',
          cursor: 'pointer',
          outlineColor: 'var(--pt-focus-ring-hex, #B96A5F)',
          marginTop: 4,
        }}
      >
        Show all
      </button>
    </div>
  );
}

// ── Compose form (J5) ─────────────────────────────────────────────────────
function ComposeForm({ onCancel, onCreate }) {
  const [text, setText] = useState('');
  const [mood, setMood] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const trimmedText = text.trim();
  // Block empty entries: require at least entry_text OR mood. (prompt_text
  // is null on direct-add by definition.)
  const canSave = !!trimmedText || !!mood;

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    setError(null);
    try {
      // Schema requires entry_text NOT NULL — coerce mood-only entries to
      // empty string so the row inserts cleanly. The optimistic shape mirrors.
      await onCreate({ entryText: trimmedText, mood });
    } catch (e) {
      setError(e?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ padding: '8px 12px 12px' }}>
      <label
        htmlFor="journal-compose-text"
        style={{
          ...getTypeStyle('meta', 'semibold'),
          color: 'var(--pt-text-muted-hex, #57534e)',
          textTransform: 'uppercase',
          display: 'block',
          margin: '0 0 6px',
        }}
      >
        New entry
      </label>
      <textarea
        id="journal-compose-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        rows={5}
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

      <div style={{ marginTop: 12 }}>
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

      {error && (
        <p
          role="alert"
          style={{
            ...getTypeStyle('caption'),
            color: 'var(--pt-text-primary-hex, #1c1917)',
            margin: '8px 0 0',
          }}
        >
          {error}
        </p>
      )}

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave || saving}
          className="px-4 py-2 rounded-md focus-visible:outline-none focus-visible:ring-2"
          style={{
            ...getTypeStyle('body', 'semibold'),
            backgroundColor: canSave
              ? 'var(--pt-primary-accent-hex, #B96A5F)'
              : 'var(--pt-elevation-1-hex, #e7e5e4)',
            color: canSave
              ? 'var(--pt-text-inverse-hex, #fafaf9)'
              : 'var(--pt-text-muted-hex, #57534e)',
            border: 'none',
            cursor: canSave && !saving ? 'pointer' : 'not-allowed',
            outlineColor: 'var(--pt-focus-ring-hex, #B96A5F)',
          }}
        >
          {saving ? 'Saving…' : 'Save entry'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 rounded-md focus-visible:outline-none focus-visible:ring-2"
          style={{
            ...getTypeStyle('body'),
            color: 'var(--pt-text-muted-hex, #57534e)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            outlineColor: 'var(--pt-focus-ring-hex, #B96A5F)',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── JournalView (root) ────────────────────────────────────────────────────
/**
 * @param {{
 *   currentLessonId?: string|null,
 *   currentModuleId?: string|null,
 * }} props
 */
export default function JournalView({ currentLessonId = null, currentModuleId = null } = {}) {
  const { user } = useAuth();
  const userId = user?.id;
  const {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
  } = useJournal({ userId });

  // Local panel mode: 'list' | 'detail' | 'compose'
  const [mode, setMode] = useState('list');
  const [selectedId, setSelectedId] = useState(null);

  // Wave 11 J2 — filter state (ephemeral: resets when panel closes)
  // activeFilter: 'all' | 'lesson' | 'module' | 'mood'
  const [activeFilter, setActiveFilter] = useState('all');
  // selectedMoods: string[] — OR-combined matching
  const [selectedMoods, setSelectedMoods] = useState([]);

  // Filter resets naturally: RightJournalPanel unmounts JournalView on close
  // ({isOpen && <JournalView/>} in PortalLayout), so useState initial values
  // ('all', []) are restored on every panel open — no effect needed.

  // ── Derived filtered entries ─────────────────────────────────────────────
  const filteredEntries = (() => {
    if (activeFilter === 'lesson' && currentLessonId) {
      return entries.filter((e) => e.lesson_id === currentLessonId);
    }
    if (activeFilter === 'module' && currentModuleId) {
      return entries.filter((e) => e.module_id === currentModuleId);
    }
    if (activeFilter === 'mood' && selectedMoods.length > 0) {
      return entries.filter((e) => e.mood && selectedMoods.includes(e.mood));
    }
    return entries;
  })();

  const selectedEntry = entries.find((e) => e.id === selectedId) || null;

  const handleSelect = (id) => {
    setSelectedId(id);
    setMode('detail');
  };

  const handleCompose = () => {
    setSelectedId(null);
    setMode('compose');
  };

  const handleBackToList = () => {
    setMode('list');
    setSelectedId(null);
  };

  const handleDelete = async (id) => {
    await deleteEntry(id);
    handleBackToList();
  };

  const handleCreate = async ({ entryText, mood }) => {
    const created = await createEntry({
      lessonId: currentLessonId,
      moduleId: currentModuleId,
      promptText: null,
      entryText,
      mood,
    });
    // After save, return to list so the user sees their entry at the top.
    setMode('list');
    return created;
  };

  const handleShowAll = () => {
    setActiveFilter('all');
    setSelectedMoods([]);
  };

  // ── Auth gate ───────────────────────────────────────────────────────────
  if (!userId) {
    return (
      <div className="flex flex-col h-full">
        <JournalHeader onCompose={handleCompose} />
        <div style={{ padding: '12px 16px' }}>
          <p
            style={{
              ...getTypeStyle('body'),
              color: 'var(--pt-text-muted-hex, #57534e)',
              margin: 0,
            }}
          >
            Sign in to use your journal.
          </p>
        </div>
      </div>
    );
  }

  // ── Detail mode ─────────────────────────────────────────────────────────
  if (mode === 'detail' && selectedEntry) {
    return (
      <JournalEntryDetail
        entry={selectedEntry}
        onBack={handleBackToList}
        onUpdate={updateEntry}
        onDelete={handleDelete}
      />
    );
  }

  // ── Compose mode (J5) ───────────────────────────────────────────────────
  if (mode === 'compose') {
    return (
      <div className="flex flex-col h-full">
        <JournalHeader onCompose={handleBackToList} />
        <div className="flex-1 overflow-y-auto">
          <ComposeForm onCancel={handleBackToList} onCreate={handleCreate} />
        </div>
      </div>
    );
  }

  // ── List mode (default) ─────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      <JournalHeader onCompose={handleCompose} />

      {/* Wave 11 J2 — filter chips (only shown when there are entries to filter) */}
      {entries.length > 0 && (
        <FilterChips
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          currentLessonId={currentLessonId}
          currentModuleId={currentModuleId}
          selectedMoods={selectedMoods}
          onMoodsChange={setSelectedMoods}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        {loading && entries.length === 0 ? (
          <p
            style={{
              ...getTypeStyle('body'),
              color: 'var(--pt-text-muted-hex, #57534e)',
              padding: '12px 16px',
              margin: 0,
            }}
          >
            Loading…
          </p>
        ) : error && entries.length === 0 ? (
          <p
            role="alert"
            style={{
              ...getTypeStyle('body'),
              color: 'var(--pt-text-muted-hex, #57534e)',
              padding: '12px 16px',
              margin: 0,
            }}
          >
            Could not load journal entries. Try again later.
          </p>
        ) : entries.length === 0 ? (
          <EmptyState onCompose={handleCompose} />
        ) : filteredEntries.length === 0 ? (
          <EmptyFilterState onShowAll={handleShowAll} />
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: '4px 8px 12px' }}>
            {filteredEntries.map((entry) => (
              <li key={entry.id}>
                <EntryCard entry={entry} onClick={() => handleSelect(entry.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
