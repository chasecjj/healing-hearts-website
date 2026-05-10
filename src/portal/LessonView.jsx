import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import LessonContent from '../components/LessonContent';
import LessonNotesPanel from './LessonNotesPanel';
import JournalPromptSection from './JournalPromptSection';
import { useVideoProgress } from '../hooks/useVideoProgress';
import { useAuth } from '../contexts/AuthContext';
import { HighlightToolbar, useTextSelection } from './components/HighlightToolbar';
import { NoteDrawer } from './components/NoteDrawer';
import { useHighlights } from './hooks/useHighlights';
import { useNotes } from './hooks/useNotes';
import { saveJournalEntry } from '../lib/journal';
import {
  CheckCircle2,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { useMockupMode } from './mockup/useMockupMode';
import LessonHero from './mockup/LessonHero';

const MuxVideoPlayer = React.lazy(() => import('./MuxVideoPlayer'));

/**
 * Lesson View — single-column reading surface.
 * PortalLayout (W-01 DrawerShell) owns the single drawer slot.
 *
 * Rendered at /portal/:moduleSlug/:lessonSlug.
 *
 * Wave 5 mockup-mode: `?mockup=1` short-circuits to LessonHero (single-drawer
 * hero-state mockup) for webinar-demo screenshots. The LessonHero renders its
 * own rail+drawer overlay, folding away the "two drawers" problem (directive #7).
 *
 * Directive #4: internal <aside> removed — PortalLayout owns the single drawer.
 * 3.7-rev: no card chrome on learner content zones.
 * 3.13 + A-09: hero-image slot (photography-over-illustration mandate).
 * 3.14: caption/transcript <details> progressive disclosure.
 * 3.18: inline-start/inline-end logical properties throughout.
 */
export default function LessonViewWithMockup(props) {
  const mockupMode = useMockupMode();
  if (mockupMode) return <LessonHero />;
  return <LessonView {...props} />;
}

function LessonView({
  course,
  currentModule,
  currentLesson,
  isLessonCompleted,
  toggleLessonComplete,
  getModuleProgress: _getModuleProgress, // retained in prop API; sidebar removed (directive #4)
  overallProgress: _overallProgress,     // retained in prop API; sidebar removed (directive #4)
  isAdmin = false,
  hasActiveEnrollment = false,
  basePath = '/portal',
}) {
  // Students with an active enrollment should have the same lesson/module
  // access as admins. Previously the gating relied on mod.is_preview (used
  // only for the legacy free-preview flag, now false on all modules) OR
  // isAdmin — which blocked enrolled buyers from clicking past the first
  // lesson because nextLesson/prevLesson were computed from a preview-only
  // set and the sidebar modules were all disabled.
  const canAccessContent = isAdmin || hasActiveEnrollment;
  const navigate = useNavigate();
  const contentRef = useRef(null);

  // ── GSAP entrance animation on lesson change ──────────────
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !contentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-lesson-animate]', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }, contentRef);

    return () => ctx.revert();
  }, [currentLesson?.id]);

  // ── Navigation helpers ────────────────────────────────────
  const navigateToLesson = useCallback(
    (mod, lesson) => {
      navigate(`${basePath}/module-${mod.module_number}/lesson-${lesson.sort_order}`);
    },
    [navigate, basePath]
  );

  // Flatten all accessible lessons across modules for prev/next
  const { prevLesson, nextLesson } = useMemo(() => {
    if (!course?.modules || !currentModule || !currentLesson) {
      return { prevLesson: null, nextLesson: null };
    }
    const allLessons = [];
    course.modules.forEach((mod) => {
      if ((mod.is_preview || canAccessContent) && mod.lessons) {
        mod.lessons.forEach((l) => {
          allLessons.push({ module: mod, lesson: l });
        });
      }
    });
    const idx = allLessons.findIndex(
      (item) => item.lesson.id === currentLesson.id
    );
    return {
      prevLesson: idx > 0 ? allLessons[idx - 1] : null,
      nextLesson: idx < allLessons.length - 1 ? allLessons[idx + 1] : null,
    };
  }, [course, currentModule, currentLesson, isAdmin]);

  const handleMarkCompleteAndNext = async () => {
    if (!currentLesson) return;
    await toggleLessonComplete(currentLesson.id);
    if (nextLesson) {
      navigateToLesson(nextLesson.module, nextLesson.lesson);
    }
  };

  const getParentLesson = useCallback(
    (lesson) => {
      if (!lesson?.parent_lesson_id || !currentModule?.lessons) return null;
      return currentModule.lessons.find((l) => l.id === lesson.parent_lesson_id);
    },
    [currentModule]
  );

  // Axis F (2026-05-10): when the current lesson is a parent-as-index row
  // (parent_lesson_id null AND has children pointing back to it), build a
  // sorted list of its sub-lessons so the LessonView can render a "Lessons
  // in this section" ToC below the curated intro blocks. Modules 1+2 use
  // this pattern (migration 022). Other modules typically have zero children
  // so this list is empty and the ToC block does not render.
  const childLessons = useMemo(() => {
    if (!currentLesson || currentLesson.parent_lesson_id || !currentModule?.lessons) {
      return [];
    }
    return currentModule.lessons
      .filter((l) => l.parent_lesson_id === currentLesson.id)
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [currentLesson, currentModule]);

  const completed = currentLesson ? isLessonCompleted(currentLesson.id) : false;
  const hasVideo = !!currentLesson?.mux_playback_id;
  const { startPosition, savePosition } = useVideoProgress(
    hasVideo ? currentLesson.id : null
  );

  const handleVideoComplete = useCallback(() => {
    if (currentLesson && !isLessonCompleted(currentLesson.id)) {
      toggleLessonComplete(currentLesson.id);
    }
  }, [currentLesson, isLessonCompleted, toggleLessonComplete]);

  // ── Highlights + Notes wiring (scout-05) ─────────────────
  const { user } = useAuth();
  const lessonId = currentLesson?.id || null;
  const { createHighlight } = useHighlights({ userId: user?.id, lessonId });
  const { createNote, updateNote, deleteNote } = useNotes({ userId: user?.id, lessonId });
  const [selection, setSelection] = useState(null);
  const [activeNote, setActiveNote] = useState(null);

  useTextSelection({
    enabled: !!user && !!lessonId,
    onSelect: setSelection,
    onDismiss: () => setSelection(null),
  });

  const handleColor = useCallback(
    async (color) => {
      if (!selection || !lessonId) return;
      try {
        await createHighlight({
          lesson_id: lessonId,
          block_index: selection.blockIndex,
          anchor_text: selection.text,
          anchor_start: 0,
          anchor_end: selection.text?.length || 0,
          color,
        });
      } catch (e) {
        console.warn('[highlights] create failed (migration 014 may be pending):', e?.message);
      }
      setSelection(null);
      window.getSelection()?.removeAllRanges();
    },
    [selection, lessonId, createHighlight]
  );

  // ── Wave 9 E6: Add-to-Journal quick-capture from selection ─────────────
  // Saves the selected anchor text as journal_entries.prompt_text and an
  // empty entry_text the user can extend later on /portal. Confirmation
  // surfaces as a 2.4s toast at the bottom-right (a11y: role=status).
  const [journalToast, setJournalToast] = useState(null);

  const handleJournalFromSelection = useCallback(async () => {
    if (!selection || !lessonId || !user?.id) return;
    const anchorText = selection.text;
    try {
      await saveJournalEntry(user.id, {
        lessonId,
        moduleId: currentModule?.id || null,
        promptText: anchorText,
        entryText: '',
        mood: null,
      });
      setJournalToast({
        message: 'Added to your journal',
        kind: 'ok',
      });
    } catch (e) {
      console.warn('[journal] save failed (migration 014 may be pending):', e?.message);
      setJournalToast({
        message: 'Could not save to journal',
        kind: 'err',
      });
    }
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, [selection, lessonId, user?.id, currentModule?.id]);

  // Auto-dismiss toast after 2.4s
  useEffect(() => {
    if (!journalToast) return undefined;
    const t = setTimeout(() => setJournalToast(null), 2400);
    return () => clearTimeout(t);
  }, [journalToast]);

  const handleNoteFromSelection = useCallback(async () => {
    if (!selection || !lessonId) return;
    try {
      const hl = await createHighlight({
        lesson_id: lessonId,
        block_index: selection.blockIndex,
        anchor_text: selection.text,
        anchor_start: 0,
        anchor_end: selection.text?.length || 0,
        color: 'yellow',
      });
      const note = await createNote({
        lesson_id: lessonId,
        body_text: '',
        note_type: 'highlight_note',
        highlight_id: hl?.id,
        block_index: selection.blockIndex,
      });
      setActiveNote(note);
    } catch (e) {
      console.warn('[notes] create failed (migration 014 may be pending):', e?.message);
    }
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, [selection, lessonId, createHighlight, createNote]);

  const handleNoteSave = useCallback(
    async (text) => {
      if (!activeNote) return;
      try {
        const updated = await updateNote(activeNote.id, { body_text: text });
        setActiveNote(updated);
      } catch (e) {
        console.warn('[notes] update failed:', e?.message);
      }
    },
    [activeNote, updateNote]
  );

  const handleNoteDelete = useCallback(async () => {
    if (!activeNote) return;
    try {
      await deleteNote(activeNote.id);
    } catch (e) {
      console.warn('[notes] delete failed:', e?.message);
    }
    setActiveNote(null);
  }, [activeNote, deleteNote]);

  return (
    <>
    <div className="flex h-full bg-background font-sans">
      {/* ── Main Content Area ──────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden" ref={contentRef}>
        {/* Top breadcrumb bar */}
        <header className="sticky top-0 z-30 flex justify-between items-center w-full px-4 sm:px-8 lg:px-12 py-4 sm:py-6 bg-background/80 backdrop-blur-md font-outfit text-sm tracking-wide border-b border-neutral-100">
          <div className="flex items-center gap-2 text-foreground/40 min-w-0">
            <span
              className="hover:text-foreground cursor-pointer transition-colors truncate"
              onClick={() =>
                navigate(`${basePath}/module-${currentModule?.module_number}`)
              }
            >
              Module {currentModule?.module_number}
            </span>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <span
              className="font-semibold truncate"
              style={{ color: 'var(--pt-text-primary-hex, #1c1917)' }}
            >
              {currentLesson?.title}
            </span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
            {currentLesson?.content_json?.estimated_minutes && (
              <div className="hidden sm:flex items-center gap-1.5 text-foreground/40 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>{currentLesson.content_json.estimated_minutes} min</span>
              </div>
            )}
          </div>
        </header>

        {/* Lesson content scroll area */}
        <div className="flex-1 overflow-y-auto">
          <article className="px-4 sm:px-8 lg:px-12 py-8 sm:py-16 max-w-[960px] mx-auto w-full">
            {/* Video player — rendered above content for video lessons */}
            {hasVideo && (
              <div className="mb-10" data-lesson-animate>
                <React.Suspense
                  fallback={
                    <div className="bg-neutral-100 rounded-2xl aspect-video animate-pulse" />
                  }
                >
                  <MuxVideoPlayer
                    key={currentLesson.id}
                    playbackId={currentLesson.mux_playback_id}
                    title={currentLesson.title}
                    startPosition={startPosition}
                    onPositionUpdate={savePosition}
                    onComplete={handleVideoComplete}
                  />
                </React.Suspense>
              </div>
            )}

            {/* ── Lesson hero image (3.13 + A-09: photography-over-illustration) ── */}
            {currentLesson?.hero_image_url ? (
              <figure className="mb-10 -mx-4 sm:-mx-8 lg:-mx-12" data-lesson-animate>
                <img
                  src={currentLesson.hero_image_url}
                  alt={currentLesson.hero_image_alt || currentLesson.title}
                  className="w-full object-cover max-h-[480px]"
                  loading="eager"
                />
                {currentLesson.hero_image_caption && (
                  <figcaption
                    className="mt-2 ps-4 sm:ps-8 lg:ps-12 text-sm font-outfit"
                    style={{ color: 'var(--pt-text-muted-hex, #57534e)' }}
                  >
                    {currentLesson.hero_image_caption}
                  </figcaption>
                )}
              </figure>
            ) : (
              // TODO A-09: slot awaits photographic asset
              // (Trisha portraiture / course-thematic still at magazine scale
              //  per §12.1 A-09 photography-over-illustration mandate).
              null
            )}

            {/* Lesson header — Wave 7 editorial refinement: lighter Playfair weight,
                tighter eyebrow, breath-room between title and subtitle */}
            <header className="mb-10 sm:mb-12" data-lesson-animate>
              <p
                style={{
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: 'var(--pt-primary-accent-hex, #B96A5F)',
                  margin: '0 0 18px',
                }}
              >
                Module {currentModule?.module_number}
                {currentLesson?.parent_lesson_id && getParentLesson(currentLesson)
                  ? ` / ${getParentLesson(currentLesson).title}`
                  : ''}
              </p>
              <h2
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontWeight: 300,
                  fontSize: 'clamp(38px, 5vw, 60px)',
                  lineHeight: 1.06,
                  letterSpacing: '-0.025em',
                  color: 'var(--pt-text-primary-hex, #1c1917)',
                  margin: 0,
                }}
              >
                {currentLesson?.title}
              </h2>
              {currentLesson?.content_json?.subtitle && (
                <p
                  style={{
                    fontFamily: '"Playfair Display", Georgia, serif',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: 19,
                    lineHeight: 1.55,
                    color: 'var(--pt-text-muted-hex, #57534e)',
                    margin: '18px 0 0',
                    maxWidth: 640,
                  }}
                >
                  {currentLesson.content_json.subtitle}
                </p>
              )}
              {/* Decorative hairline rule — editorial separator, not a structural border */}
              <div
                aria-hidden="true"
                style={{
                  width: 64,
                  height: 1,
                  backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)',
                  marginTop: 28,
                  opacity: 0.4,
                }}
              />
            </header>

            {/* Lesson blocks */}
            <div
              className="max-w-[65ch] space-y-10 text-lg"
              data-lesson-animate
              data-lesson-content
              style={{
                color: 'var(--pt-text-primary-hex, #1c1917)',
                lineHeight: 1.75,
                fontFamily: '"Plus Jakarta Sans", sans-serif',
              }}
            >
              {/* If content is missing entirely, show a quiet placeholder rather
                  than a vast empty whitespace gap (Wave 7 fix for screenshot-09
                  empty-content render). CRIT-03 fix: also catches content_json
                  shapes where `blocks` is null/undefined (truthy outer object
                  with subtitle/estimated_minutes but missing blocks array). */}
              {(() => {
                const blocks = currentLesson?.content_json?.blocks;
                return (
                  !currentLesson?.content_json ||
                  !Array.isArray(blocks) ||
                  blocks.length === 0
                );
              })() ? (
                <p
                  style={{
                    fontFamily: '"Playfair Display", Georgia, serif',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: 18,
                    lineHeight: 1.6,
                    color: 'var(--pt-text-quiet-hex, #a8a29e)',
                    margin: 0,
                  }}
                >
                  Lesson content is being prepared. Check back soon &mdash; or use the navigation below to continue.
                </p>
              ) : (
                <LessonContent
                  contentJson={(() => {
                    // MED-07 fix: filter the leading `heading` block when its
                    // content equals the lesson title. The hero already renders
                    // the title as <h2>; LessonContent's HeadingBlock would
                    // emit a second <h2> with the same text, which screen
                    // readers + visual layout perceive as title/title
                    // duplication. We strip ONLY the first block and only when
                    // it matches — preserves intentional intra-content headings.
                    const cj = currentLesson?.content_json;
                    if (!cj || !Array.isArray(cj.blocks) || cj.blocks.length === 0) return cj;
                    const first = cj.blocks[0];
                    const titleNorm = (currentLesson?.title || '').trim().toLowerCase();
                    const firstText = (first?.content || first?.text || '').trim().toLowerCase();
                    if (first?.type === 'heading' && firstText && firstText === titleNorm) {
                      return { ...cj, blocks: cj.blocks.slice(1) };
                    }
                    return cj;
                  })()}
                  lessonId={currentLesson?.id}
                />
              )}

              {/* ── Axis F: Lessons-in-this-section ToC (parent-as-index pattern) ──
                   When a parent-index lesson is the active route, list its
                   sub-lessons below the curated intro blocks so users can
                   navigate into the actual content. Empty list = no render. */}
              {childLessons.length > 0 && (
                <nav
                  aria-label="Lessons in this section"
                  style={{
                    marginTop: 12,
                    paddingTop: 28,
                    borderTop: '1px solid var(--pt-border-soft-hex, #e7e5e4)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.24em',
                      textTransform: 'uppercase',
                      color: 'var(--pt-text-muted-hex, #57534e)',
                      margin: '0 0 18px',
                    }}
                  >
                    Lessons in this section
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                    {childLessons.map((child, i) => {
                      const childCompleted = isLessonCompleted(child.id);
                      const minutes = child.content_json?.estimated_minutes;
                      return (
                        <li key={child.id}>
                          <button
                            type="button"
                            onClick={() =>
                              navigateToLesson(currentModule, child)
                            }
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 16,
                              padding: '14px 18px',
                              borderRadius: 12,
                              border: '1px solid var(--pt-border-soft-hex, #e7e5e4)',
                              backgroundColor: 'var(--pt-elevation-2-hex, #ffffff)',
                              cursor: 'pointer',
                              textAlign: 'start',
                              transition: 'all 150ms ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor =
                                'var(--pt-primary-accent-hex, #B96A5F)';
                              e.currentTarget.style.boxShadow =
                                '0 1px 0 rgba(28,25,23,0.02), 0 14px 30px -22px rgba(28,25,23,0.16)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor =
                                'var(--pt-border-soft-hex, #e7e5e4)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                              <span
                                aria-hidden="true"
                                style={{
                                  flexShrink: 0,
                                  fontFamily: '"Outfit", sans-serif',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  letterSpacing: '0.18em',
                                  color: childCompleted
                                    ? 'var(--pt-text-quiet-hex, #a8a29e)'
                                    : 'var(--pt-primary-accent-hex, #B96A5F)',
                                  minWidth: 28,
                                }}
                              >
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <span
                                style={{
                                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                                  fontSize: 15,
                                  fontWeight: 500,
                                  color: 'var(--pt-text-primary-hex, #1c1917)',
                                  textDecoration: childCompleted ? 'line-through' : 'none',
                                  textDecorationColor: 'var(--pt-text-quiet-hex, #a8a29e)',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {child.title}
                              </span>
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                              {minutes && (
                                <span
                                  style={{
                                    fontFamily: '"Outfit", sans-serif',
                                    fontSize: 11,
                                    color: 'var(--pt-text-quiet-hex, #a8a29e)',
                                  }}
                                >
                                  {minutes} min
                                </span>
                              )}
                              <ChevronRight
                                className="w-4 h-4"
                                style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)' }}
                              />
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              )}

              {/* ── Caption/transcript slot (3.14: progressive <details>, i18n-safe) ── */}
              {currentLesson?.content_json?.transcript && (
                <details
                  className="pt-4"
                  style={{ borderTop: '1px solid var(--pt-border-soft-hex, #e7e5e4)' }}
                >
                  <summary
                    className="cursor-pointer"
                    style={{
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'var(--pt-text-muted-hex, #57534e)',
                    }}
                  >
                    Transcript
                  </summary>
                  <div
                    className="mt-4"
                    style={{
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: 16,
                      lineHeight: 1.65,
                      color: 'var(--pt-text-primary-hex, #1c1917)',
                    }}
                  >
                    <p>{currentLesson.content_json.transcript}</p>
                  </div>
                </details>
              )}
            </div>
          </article>

          {/* ── Lesson Notes + Journal ─────────────────────── */}
          {currentLesson && (
            <div className="px-4 sm:px-8 lg:px-12 max-w-[960px] mx-auto w-full space-y-6 pb-8" data-lesson-animate>
              <LessonNotesPanel lessonId={currentLesson.id} />

              {/* Journal prompt — only if lesson has a reflection block */}
              {currentLesson.content_json?.blocks?.some(
                (b) => b.type === 'reflection'
              ) && (
                <JournalPromptSection
                  lessonId={currentLesson.id}
                  moduleId={currentModule?.id}
                  prompt={
                    currentLesson.content_json.blocks.find(
                      (b) => b.type === 'reflection'
                    )?.content
                  }
                />
              )}
            </div>
          )}

          {/* ── Footer with navigation ─────────────────────── */}
          <footer className="w-full py-8 sm:py-12 px-4 sm:px-8 lg:px-12 bg-neutral-50 flex flex-col sm:flex-row justify-between items-center gap-6 mt-auto border-t border-neutral-100">
            <button
              onClick={() =>
                prevLesson &&
                navigateToLesson(prevLesson.module, prevLesson.lesson)
              }
              disabled={!prevLesson}
              className="flex items-center gap-2 text-foreground/60 font-outfit font-medium uppercase tracking-widest text-sm hover:text-foreground transition-colors group disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Previous Lesson
            </button>

            {completed ? (
              nextLesson ? (
                <button
                  onClick={() =>
                    navigateToLesson(nextLesson.module, nextLesson.lesson)
                  }
                  className="text-white rounded-full px-8 sm:px-10 py-4 font-outfit font-bold uppercase tracking-[0.15em] text-sm shadow-[0_4px_20px_-4px_rgba(185,106,95,0.3)] hover:scale-105 hover:shadow-[0_8px_30px_-4px_rgba(185,106,95,0.4)] transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
                  style={{ backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)' }}
                >
                  Next Lesson
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-2 px-8 py-4 rounded-full text-sm font-medium text-green-700 bg-green-100">
                  <CheckCircle2 className="w-4 h-4" />
                  Module Complete
                </div>
              )
            ) : (
              <button
                onClick={handleMarkCompleteAndNext}
                className="text-white rounded-full px-8 sm:px-10 py-4 font-outfit font-bold uppercase tracking-[0.15em] text-sm shadow-[0_4px_20px_-4px_rgba(185,106,95,0.3)] hover:scale-105 hover:shadow-[0_8px_30px_-4px_rgba(185,106,95,0.4)] transition-all duration-200 active:scale-[0.98]"
                style={{ backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)' }}
              >
                Mark as Complete{nextLesson ? ' & Next' : ''}
              </button>
            )}

            <button
              onClick={() =>
                nextLesson &&
                navigateToLesson(nextLesson.module, nextLesson.lesson)
              }
              disabled={!nextLesson}
              className="flex items-center gap-2 text-foreground/60 font-outfit font-medium uppercase tracking-widest text-sm hover:text-foreground transition-colors group disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next Lesson
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </footer>
        </div>
      </main>
    </div>

    {/* ── Highlight toolbar + Note drawer (scout-05) ──────── */}
    <HighlightToolbar
      position={selection ? { top: selection.rect.top, left: selection.rect.left, width: selection.rect.width } : null}
      onColor={handleColor}
      onNote={handleNoteFromSelection}
      onJournal={handleJournalFromSelection}
      onDismiss={() => setSelection(null)}
    />
    <NoteDrawer
      open={!!activeNote}
      initialText={activeNote?.body_text || ''}
      onSave={handleNoteSave}
      onClose={() => setActiveNote(null)}
      onDelete={activeNote ? handleNoteDelete : undefined}
    />

    {/* Wave 9 E6: journal-quick-capture confirmation toast */}
    {journalToast && (
      <div
        role="status"
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: 24,
          insetInlineEnd: 24,
          zIndex: 60,
          padding: '10px 16px',
          borderRadius: 10,
          backgroundColor:
            journalToast.kind === 'err'
              ? 'var(--pt-text-primary-hex, #1c1917)'
              : 'var(--pt-text-primary-hex, #1c1917)',
          color: 'var(--pt-text-inverse-hex, #fafaf9)',
          boxShadow: '0 6px 20px rgba(28,25,23,0.20)',
          fontFamily: '"Outfit", sans-serif',
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        {journalToast.message}
      </div>
    )}
    </>
  );
}
