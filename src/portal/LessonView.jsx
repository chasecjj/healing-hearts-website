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

            {/* Lesson header */}
            <header className="mb-12 sm:mb-16 space-y-4" data-lesson-animate>
              <span
                className="font-bold text-sm uppercase tracking-[0.3em]"
                style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)' }}
              >
                Module {currentModule?.module_number}
                {currentLesson?.parent_lesson_id && getParentLesson(currentLesson)
                  ? ` / ${getParentLesson(currentLesson).title}`
                  : ''}
              </span>
              <h2
                className="font-drama text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
                style={{ color: 'var(--pt-text-primary-hex, #1c1917)' }}
              >
                {currentLesson?.title}
              </h2>
              {currentLesson?.content_json?.subtitle && (
                <p className="text-foreground/40 font-outfit italic text-lg">
                  {currentLesson.content_json.subtitle}
                </p>
              )}
            </header>

            {/* Lesson blocks */}
            <div
              className="max-w-[65ch] space-y-10 text-foreground/80 leading-[1.8] text-lg"
              data-lesson-animate
              data-lesson-content
            >
              <LessonContent
                contentJson={currentLesson?.content_json}
                lessonId={currentLesson?.id}
              />

              {/* ── Caption/transcript slot (3.14: progressive <details>, i18n-safe) ── */}
              {currentLesson?.content_json?.transcript && (
                <details
                  className="border-t pt-4"
                  style={{ borderColor: 'var(--pt-border-subtle-hex, #d6d3d1)' }}
                >
                  <summary
                    className="font-outfit text-sm font-semibold cursor-pointer"
                    style={{ color: 'var(--pt-text-muted-hex, #57534e)' }}
                  >
                    Transcript
                  </summary>
                  <div
                    className="mt-3 text-base leading-relaxed font-sans"
                    style={{ color: 'var(--pt-text-primary-hex, #1c1917)' }}
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
      onDismiss={() => setSelection(null)}
    />
    <NoteDrawer
      open={!!activeNote}
      initialText={activeNote?.body_text || ''}
      onSave={handleNoteSave}
      onClose={() => setActiveNote(null)}
      onDelete={activeNote ? handleNoteDelete : undefined}
    />
    </>
  );
}
