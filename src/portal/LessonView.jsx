import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import LessonContent from '../components/LessonContent';
import LessonNotesPanel from './LessonNotesPanel';
import JournalPromptSection from './JournalPromptSection';
import { useVideoProgress } from '../hooks/useVideoProgress';
import {
  CheckCircle2,
  PlayCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lock,
  Menu,
  X,
  Clock,
  HeartHandshake,
} from 'lucide-react';

const MuxVideoPlayer = React.lazy(() => import('./MuxVideoPlayer'));

/**
 * Lesson View — two-panel layout with collapsible sidebar navigation
 * and rich lesson content reader.
 *
 * Rendered at /portal/:moduleSlug/:lessonSlug.
 */
export default function LessonView({
  course,
  currentModule,
  currentLesson,
  isLessonCompleted,
  toggleLessonComplete,
  getModuleProgress,
  overallProgress,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedParents, setExpandedParents] = useState({});
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
      setSidebarOpen(false);
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

  // ── Sub-lesson (parent/child) helpers ─────────────────────
  const getLessonGroups = useCallback((lessons) => {
    if (!lessons) return { topLevel: [], childrenByParent: {} };
    const topLevel = lessons.filter((l) => !l.parent_lesson_id);
    const childrenByParent = {};
    lessons.forEach((l) => {
      if (l.parent_lesson_id) {
        if (!childrenByParent[l.parent_lesson_id]) {
          childrenByParent[l.parent_lesson_id] = [];
        }
        childrenByParent[l.parent_lesson_id].push(l);
      }
    });
    return { topLevel, childrenByParent };
  }, []);

  const isParentOfActive = useCallback(
    (lessonId, childrenByParent) => {
      if (!currentLesson || !childrenByParent[lessonId]) return false;
      return childrenByParent[lessonId].some((c) => c.id === currentLesson.id);
    },
    [currentLesson]
  );

  const toggleParentExpanded = useCallback((lessonId) => {
    setExpandedParents((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
  }, []);

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

  return (
    <div className="flex h-full bg-background font-sans">
      {/* ── Mobile sidebar backdrop ────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        className={`fixed lg:static z-40 w-72 sm:w-80 bg-[#EFF9FB] flex flex-col h-full overflow-y-auto transition-transform duration-300 shadow-[24px_0_40px_-15px_rgba(17,145,177,0.06)] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        aria-label="Course navigation"
      >
        {/* Logo + close */}
        <div className="px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <h1 className="font-drama text-xl font-bold text-primary">
              Healing Hearts
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-primary/50 hover:text-primary transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall progress bar */}
        <div className="px-6 mb-6">
          <div className="flex justify-between items-center text-xs font-outfit font-semibold text-primary uppercase tracking-wider mb-1">
            <span>Course Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="w-full bg-white/40 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-accent h-full rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Module list */}
        <nav className="flex-1 px-2 pb-6 space-y-1">
          {course?.modules?.map((mod) => {
            const isActiveMod = currentModule?.id === mod.id;
            const modProgress = (mod.is_preview || canAccessContent) ? getModuleProgress(mod) : 0;

            return (
              <div key={mod.id}>
                <button
                  onClick={() => {
                    if ((mod.is_preview || canAccessContent) && mod.lessons?.length) {
                      navigateToLesson(mod, mod.lessons[0]);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                    isActiveMod
                      ? 'bg-white/50 text-primary font-bold border-l-4 border-primary rounded-l-none'
                      : (mod.is_preview || canAccessContent)
                      ? 'text-foreground/60 hover:text-primary hover:bg-white/30'
                      : 'text-foreground/40 opacity-60 cursor-not-allowed'
                  }`}
                  disabled={!mod.is_preview && !canAccessContent}
                >
                  {(mod.is_preview || canAccessContent) ? (
                    modProgress === 100 ? (
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : isActiveMod ? (
                      <PlayCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    ) : (
                      <PlayCircle className="w-5 h-5 opacity-40 flex-shrink-0" />
                    )
                  ) : (
                    <Lock className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="text-sm truncate">
                    Module {mod.module_number}: {mod.title}
                  </span>
                </button>

                {/* Expanded lesson list for active module */}
                {isActiveMod && (mod.is_preview || canAccessContent) && (() => {
                  const { topLevel, childrenByParent } = getLessonGroups(mod.lessons);
                  return (
                    <div className="ml-7 mt-2 space-y-1 border-l-2 border-primary/10 pl-3">
                      {topLevel.map((lesson) => {
                        const isActiveLesson = currentLesson?.id === lesson.id;
                        const lessonCompleted = isLessonCompleted(lesson.id);
                        const hasChildren = !!childrenByParent[lesson.id];
                        const isExpanded =
                          expandedParents[lesson.id] ||
                          isActiveLesson ||
                          isParentOfActive(lesson.id, childrenByParent);

                        return (
                          <div key={lesson.id}>
                            <div className="flex items-center">
                              {hasChildren && (
                                <button
                                  onClick={() => toggleParentExpanded(lesson.id)}
                                  className="p-1 text-primary/40 hover:text-primary/70 flex-shrink-0"
                                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                >
                                  <ChevronRight
                                    className={`w-3 h-3 transition-transform ${
                                      isExpanded ? 'rotate-90' : ''
                                    }`}
                                  />
                                </button>
                              )}
                              <button
                                onClick={() => navigateToLesson(mod, lesson)}
                                className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs transition-colors text-left ${
                                  isActiveLesson
                                    ? 'text-primary font-bold border-l-2 border-primary pl-3'
                                    : 'text-foreground/50 hover:text-primary'
                                } ${!hasChildren ? 'ml-4' : ''}`}
                              >
                                {lessonCompleted ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                                ) : (
                                  <PlayCircle className="w-3.5 h-3.5 opacity-40 flex-shrink-0" />
                                )}
                                <span className="truncate">{lesson.title}</span>
                              </button>
                            </div>

                            {hasChildren && isExpanded && (
                              <div className="ml-6 pl-3 border-l border-primary/10 space-y-1 mt-1">
                                {childrenByParent[lesson.id].map((child) => {
                                  const isChildActive = currentLesson?.id === child.id;
                                  const childCompleted = isLessonCompleted(child.id);
                                  return (
                                    <button
                                      key={child.id}
                                      onClick={() => navigateToLesson(mod, child)}
                                      className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs transition-colors text-left ${
                                        isChildActive
                                          ? 'text-primary font-bold'
                                          : 'text-foreground/50 hover:text-primary'
                                      }`}
                                    >
                                      {childCompleted ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                                      ) : (
                                        <PlayCircle className="w-3.5 h-3.5 opacity-40 flex-shrink-0" />
                                      )}
                                      <span className="truncate">{child.title}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </nav>

        {/* Safety resources */}
        <div className="px-4 pt-4 mt-auto">
          <details className="group">
            <summary className="flex items-center gap-2 px-4 py-2 text-foreground/40 hover:text-foreground/60 transition-colors cursor-pointer text-xs font-outfit uppercase tracking-widest list-none">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Safety &amp; Support</span>
            </summary>
            <div className="px-4 pt-2 pb-3 space-y-2 text-xs text-foreground/50 font-sans leading-relaxed">
              <p>
                This program is educational, not clinical. It is not a substitute for professional therapy.
              </p>
              <p className="font-medium text-foreground/60">
                If you or someone you know is in crisis:
              </p>
              <ul className="space-y-1.5">
                <li>
                  <strong>988</strong> Suicide &amp; Crisis Lifeline
                </li>
                <li>
                  <strong>1-800-799-7233</strong> Domestic Violence Hotline
                </li>
                <li>
                  Text <strong>HOME</strong> to <strong>741741</strong> Crisis Text Line
                </li>
              </ul>
            </div>
          </details>
        </div>

        {/* Bottom links */}
        <div className="px-4 pt-2 pb-4 border-t border-primary/5">
          <button
            onClick={() => navigate(basePath)}
            className="flex items-center gap-3 px-4 py-3 text-foreground/60 hover:text-primary transition-colors cursor-pointer text-sm font-medium w-full"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="mt-2 bg-primary/10 rounded-xl p-4 text-center w-full hover:bg-primary/20 transition-all"
          >
            <span className="text-primary font-bold text-xs uppercase tracking-widest">
              Return to Site
            </span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ──────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden" ref={contentRef}>
        {/* Top breadcrumb bar */}
        <header className="sticky top-0 z-30 flex justify-between items-center w-full px-4 sm:px-8 lg:px-12 py-4 sm:py-6 bg-background/80 backdrop-blur-md font-outfit text-sm tracking-wide border-b border-neutral-100">
          <div className="flex items-center gap-2 text-foreground/40 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-foreground/50 hover:text-primary mr-2"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span
              className="hover:text-primary cursor-pointer transition-colors truncate"
              onClick={() =>
                navigate(`${basePath}/module-${currentModule?.module_number}`)
              }
            >
              Module {currentModule?.module_number}
            </span>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <span className="text-primary font-semibold truncate">
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

            {/* Lesson header */}
            <header className="mb-12 sm:mb-16 space-y-4" data-lesson-animate>
              <span className="text-accent font-bold text-sm uppercase tracking-[0.3em]">
                Module {currentModule?.module_number}
                {currentLesson?.parent_lesson_id && getParentLesson(currentLesson)
                  ? ` / ${getParentLesson(currentLesson).title}`
                  : ''}
              </span>
              <h2 className="font-drama text-4xl sm:text-5xl lg:text-6xl font-bold text-primary leading-tight">
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
            >
              <LessonContent
                contentJson={currentLesson?.content_json}
                lessonId={currentLesson?.id}
              />
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
              className="flex items-center gap-2 text-foreground/60 font-outfit font-medium uppercase tracking-widest text-sm hover:text-primary transition-colors group disabled:opacity-30 disabled:cursor-not-allowed"
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
                  className="bg-primary text-white rounded-full px-8 sm:px-10 py-4 font-outfit font-bold uppercase tracking-[0.15em] text-sm shadow-[0_4px_20px_-4px_rgba(17,145,177,0.3)] hover:scale-105 hover:shadow-[0_8px_30px_-4px_rgba(17,145,177,0.4)] transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
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
                className="bg-accent text-white rounded-full px-8 sm:px-10 py-4 font-outfit font-bold uppercase tracking-[0.15em] text-sm shadow-[0_4px_20px_-4px_rgba(185,106,95,0.3)] hover:scale-105 hover:shadow-[0_8px_30px_-4px_rgba(185,106,95,0.4)] transition-all duration-200 active:scale-[0.98]"
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
              className="flex items-center gap-2 text-foreground/60 font-outfit font-medium uppercase tracking-widest text-sm hover:text-primary transition-colors group disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next Lesson
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
}
