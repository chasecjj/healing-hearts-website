import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useCourseData } from './hooks/useCourseData';
import LessonContent from './components/LessonContent';
import {
  BookOpen,
  FileText,

  PlayCircle,
  CheckCircle2,
  ChevronDown,
  Lock,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldAlert,
} from 'lucide-react';

const CoursePortal = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { moduleSlug, lessonSlug } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    course,
    loading,
    error,
    toggleLessonComplete,
    isLessonCompleted,
    getModuleProgress,
    overallProgress,
    refetch,
  } = useCourseData();

  // ─── Derive active module/lesson from URL params ────────────

  const { currentModule, currentLesson, isAccessDenied } = useMemo(() => {
    if (!course?.modules?.length) {
      return { currentModule: null, currentLesson: null, isAccessDenied: false };
    }

    let mod = null;
    let lesson = null;
    let denied = false;

    if (moduleSlug) {
      // Match by module_number (e.g. "module-7" → "7")
      const modNum = moduleSlug.replace('module-', '');
      mod = course.modules.find((m) => m.module_number === modNum);

      if (mod && !mod.is_preview) {
        denied = true;
      }
    }

    // Default to first preview module if no match or no slug
    if (!mod) {
      mod = course.modules.find((m) => m.is_preview) || course.modules[0];
    }

    if (mod && mod.lessons?.length && !denied) {
      if (lessonSlug) {
        // Match by sort_order (e.g. "lesson-3" → 3)
        const lessonNum = parseInt(lessonSlug.replace('lesson-', ''), 10);
        lesson = mod.lessons.find((l) => l.sort_order === lessonNum);

        // Check lesson-level preview access
        if (lesson && !lesson.is_preview && !mod.is_preview) {
          denied = true;
          lesson = null;
        }
      }

      // Default to first lesson
      if (!lesson) {
        lesson = mod.lessons[0];
      }
    }

    return { currentModule: mod, currentLesson: lesson, isAccessDenied: denied };
  }, [course, moduleSlug, lessonSlug]);

  // ─── Navigation helpers ─────────────────────────────────────

  const navigateToLesson = useCallback(
    (mod, lesson) => {
      navigate(`/portal/module-${mod.module_number}/lesson-${lesson.sort_order}`);
      setSidebarOpen(false);
    },
    [navigate]
  );

  const { prevLesson, nextLesson } = useMemo(() => {
    if (!course?.modules || !currentModule || !currentLesson) {
      return { prevLesson: null, nextLesson: null };
    }

    // Flatten all accessible lessons across modules
    const allLessons = [];
    course.modules.forEach((mod) => {
      if (mod.is_preview && mod.lessons) {
        mod.lessons.forEach((l) => {
          allLessons.push({ module: mod, lesson: l });
        });
      }
    });

    const currentIdx = allLessons.findIndex(
      (item) => item.lesson.id === currentLesson.id
    );

    return {
      prevLesson: currentIdx > 0 ? allLessons[currentIdx - 1] : null,
      nextLesson:
        currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null,
    };
  }, [course, currentModule, currentLesson]);

  const handleMarkCompleteAndNext = async () => {
    if (!currentLesson) return;
    await toggleLessonComplete(currentLesson.id);
    if (nextLesson) {
      navigateToLesson(nextLesson.module, nextLesson.lesson);
    }
  };

  const handleReturnToSite = () => {
    navigate('/');
  };

  // ─── Loading state ──────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="font-outfit text-primary/60 text-sm">
            Loading your course...
          </p>
        </div>
      </div>
    );
  }

  // ─── Error state ────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h2 className="font-outfit font-bold text-xl text-primary mb-2">
              Something went wrong
            </h2>
            <p className="font-sans text-foreground/60 text-sm">{error}</p>
          </div>
          <button
            onClick={refetch}
            className="px-6 py-3 rounded-full text-sm font-medium text-background bg-primary hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ─── Access denied state ────────────────────────────────────

  if (isAccessDenied) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 max-w-md text-center px-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="font-drama italic text-3xl text-primary mb-3">
              This Content Is Locked
            </h2>
            <p className="font-sans text-foreground/60 leading-relaxed">
              This module requires enrollment in the full Healing Hearts Program.
              Continue exploring the free preview module to experience what's
              inside.
            </p>
          </div>
          <button
            onClick={() => navigate('/portal')}
            className="px-8 py-3 rounded-full text-sm font-medium text-background bg-accent hover:bg-accent/90 transition-colors shadow-lg"
          >
            Back to Preview Module
          </button>
        </div>
      </div>
    );
  }

  // ─── Main portal layout ─────────────────────────────────────

  return (
    <div className="flex h-screen bg-background font-sans">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-40 w-80 bg-background border-r border-primary/10 flex flex-col h-full overflow-y-auto transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-primary/10 flex items-center justify-between">
          <div className="font-outfit font-bold text-xl text-primary">
            Healing Hearts.
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-primary/50 hover:text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-xs font-outfit uppercase tracking-widest text-primary/50 font-bold mb-4">
            Course Progress
          </div>
          <div className="w-full bg-primary/10 rounded-full h-2 mb-2">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="text-xs text-primary/60 text-right">
            {overallProgress}% Completed
          </div>
        </div>

        <nav className="flex-1 px-4 pb-6 space-y-2">
          {course?.modules?.map((mod) => {
            const isActive = currentModule?.id === mod.id;
            const modProgress = getModuleProgress(mod);

            return (
              <div key={mod.id} className="mb-4">
                <button
                  onClick={() => {
                    if (mod.is_preview && mod.lessons?.length) {
                      navigateToLesson(mod, mod.lessons[0]);
                    }
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-primary text-background'
                      : 'hover:bg-primary/5 text-primary'
                  } ${!mod.is_preview ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="text-left min-w-0">
                    <span className="font-outfit font-medium text-sm block truncate">
                      Module {mod.module_number}: {mod.title}
                    </span>
                    {mod.is_preview && modProgress > 0 && (
                      <span
                        className={`text-xs ${isActive ? 'text-background/60' : 'text-primary/40'}`}
                      >
                        {modProgress}% complete
                      </span>
                    )}
                  </div>
                  {!mod.is_preview ? (
                    <Lock className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 transition-transform ${
                        isActive ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>

                {isActive && mod.is_preview && (
                  <div className="mt-2 pl-4 space-y-1">
                    {mod.lessons?.map((lesson) => {
                      const isActiveLesson = currentLesson?.id === lesson.id;
                      const completed = isLessonCompleted(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => navigateToLesson(mod, lesson)}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors text-left ${
                            isActiveLesson
                              ? 'bg-accent/10 text-accent font-medium'
                              : 'text-primary/70 hover:bg-primary/5'
                          }`}
                        >
                          {completed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <PlayCircle className="w-4 h-4 opacity-50 flex-shrink-0" />
                          )}
                          <span className="truncate">{mod.module_number}.{lesson.sort_order} — {lesson.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-primary/10">
          <button
            onClick={handleReturnToSite}
            className="flex items-center gap-3 text-primary/70 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/5 w-full"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium text-sm">Return to Site</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background/50">
        {/* Header */}
        <header className="h-16 lg:h-20 border-b border-primary/10 bg-background flex items-center px-4 lg:px-8 shrink-0 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-primary/70 hover:text-primary"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-outfit text-lg lg:text-2xl text-primary font-medium truncate">
            Module {currentModule?.module_number}: {currentModule?.title}
          </h1>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Lesson Header Card */}
            <div className="w-full bg-primary rounded-3xl overflow-hidden relative shadow-2xl p-8 md:p-12">
              <div className="text-background">
                <p className="font-outfit text-sm uppercase tracking-widest text-background/50 mb-2">
                  Module {currentModule?.module_number} · Lesson {currentModule?.module_number}.{currentLesson?.sort_order}
                </p>
                <h2 className="font-drama italic text-3xl md:text-4xl text-background mb-3">
                  {currentLesson?.title}
                </h2>
                {currentLesson?.content_json?.estimated_minutes && (
                  <div className="flex items-center gap-2 text-background/60 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>
                      {currentLesson.content_json.estimated_minutes} min read
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Lesson Content */}
            <div className="bg-background rounded-3xl p-6 md:p-10 shadow-sm border border-primary/5">
              <LessonContent contentJson={currentLesson?.content_json} />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-primary/10 pb-16 gap-4">
              <button
                onClick={() =>
                  prevLesson &&
                  navigateToLesson(prevLesson.module, prevLesson.lesson)
                }
                disabled={!prevLesson}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous Lesson</span>
              </button>

              {currentLesson && isLessonCompleted(currentLesson.id) ? (
                nextLesson ? (
                  <button
                    onClick={() => navigateToLesson(nextLesson.module, nextLesson.lesson)}
                    className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium transition-colors shadow-lg text-background bg-primary hover:bg-primary/90"
                  >
                    Next Lesson
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium text-green-700 bg-green-100">
                    <CheckCircle2 className="w-4 h-4" />
                    Module Complete
                  </div>
                )
              ) : (
                <button
                  onClick={handleMarkCompleteAndNext}
                  className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium transition-colors shadow-lg text-background bg-accent hover:bg-accent/90"
                >
                  Mark Complete{nextLesson ? ' & Next' : ''}
                  {nextLesson && <ChevronRight className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoursePortal;
