import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useCourseData } from './hooks/useCourseData';
import PortalDashboard from './portal/PortalDashboard';
import ModuleOverview from './portal/ModuleOverview';
import LessonView from './portal/LessonView';
import { Lock, ShieldAlert } from 'lucide-react';

/**
 * CoursePortal — thin routing shell.
 *
 * Handles auth, loads course data via useCourseData, and renders
 * the appropriate view component based on URL params:
 *
 *   /portal                          → PortalDashboard
 *   /portal/:moduleSlug              → ModuleOverview
 *   /portal/:moduleSlug/:lessonSlug  → LessonView
 */
const CoursePortal = () => {
  const { profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { moduleSlug, lessonSlug } = useParams();

  const {
    course,
    loading,
    error,
    toggleLessonComplete,
    isLessonCompleted,
    getModuleProgress,
    overallProgress,
    hasActiveEnrollment,
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
      const modNum = moduleSlug.replace('module-', '');
      mod = course.modules.find((m) => m.module_number === modNum);

      if (mod && !mod.is_preview && !isAdmin && !hasActiveEnrollment) {
        denied = true;
      }
    }

    // Default to first preview module if no match or no slug
    if (!mod) {
      mod = course.modules.find((m) => m.is_preview) || course.modules[0];
    }

    if (mod && mod.lessons?.length && !denied && lessonSlug) {
      const lessonNum = parseInt(lessonSlug.replace('lesson-', ''), 10);
      lesson = mod.lessons.find((l) => l.sort_order === lessonNum);

      if (lesson && !lesson.is_preview && !mod.is_preview && !isAdmin && !hasActiveEnrollment) {
        denied = true;
        lesson = null;
      }

      if (!lesson) {
        lesson = mod.lessons[0];
      }
    }

    return { currentModule: mod, currentLesson: lesson, isAccessDenied: denied };
  }, [course, moduleSlug, lessonSlug, isAdmin, hasActiveEnrollment]);

  // ─── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
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
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
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
            className="px-6 py-3 rounded-full text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
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
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 max-w-md text-center px-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="font-drama italic text-3xl text-primary mb-3">
              This Content Is Locked
            </h2>
            <p className="font-sans text-foreground/60 leading-relaxed">
              This module is part of the full Healing Hearts Program.
              Explore the free preview to experience what is inside, or learn
              more about the program.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/course')}
              className="px-8 py-3 rounded-full text-sm font-medium text-white bg-accent hover:bg-accent/90 transition-colors shadow-lg"
            >
              Learn About the Program
            </button>
            <button
              onClick={() => navigate('/portal')}
              className="px-8 py-3 rounded-full text-sm font-medium text-primary border border-primary/20 hover:bg-primary/5 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Route to the correct view ──────────────────────────────

  // /portal → Dashboard (no moduleSlug)
  if (!moduleSlug) {
    return (
      <PortalDashboard
        profile={profile}
        course={course}
        overallProgress={overallProgress}
        getModuleProgress={getModuleProgress}
        isLessonCompleted={isLessonCompleted}
        isAdmin={isAdmin}
      />
    );
  }

  // /portal/:moduleSlug → Module Overview (no lessonSlug)
  if (moduleSlug && !lessonSlug) {
    return (
      <ModuleOverview
        course={course}
        currentModule={currentModule}
        getModuleProgress={getModuleProgress}
        isLessonCompleted={isLessonCompleted}
        isAdmin={isAdmin}
      />
    );
  }

  // /portal/:moduleSlug/:lessonSlug → Lesson View
  return (
    <LessonView
      course={course}
      currentModule={currentModule}
      currentLesson={currentLesson}
      isLessonCompleted={isLessonCompleted}
      toggleLessonComplete={toggleLessonComplete}
      isAdmin={isAdmin}
      getModuleProgress={getModuleProgress}
      overallProgress={overallProgress}
    />
  );
};

export default CoursePortal;
