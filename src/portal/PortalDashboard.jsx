import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  BookOpen,
  Clock,
  Flame,
  Lock,
  ChevronRight,
  ChevronLeft,
  Quote,
  Download,
  Library,
} from 'lucide-react';
import DailyIntentionWidget from './DailyIntentionWidget';
import { getActiveCourses } from '../lib/courses';
import { useAuth } from '../contexts/AuthContext';

/**
 * Portal Dashboard — personalized welcome, journey progress, module library.
 * Rendered at /portal when no moduleSlug is in the URL.
 *
 * Props come from the CoursePortal shell which owns useCourseData.
 */
export default function PortalDashboard({
  profile,
  course,
  overallProgress,
  getModuleProgress,
  isLessonCompleted,
  isAdmin = false,
  hasActiveEnrollment = false,
  basePath = '/portal',
}) {
  const showStartJourney = !hasActiveEnrollment && !isAdmin;
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const { user } = useAuth();

  // ── GSAP entrance animations ──────────────────────────────
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-animate]', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // ── Fetch available courses for the course catalog section ──
  useEffect(() => {
    let cancelled = false;
    getActiveCourses()
      .then((courses) => {
        if (!cancelled) setAvailableCourses(courses);
      })
      .catch((err) => {
        console.error('Failed to load available courses:', err);
      });
    return () => { cancelled = true; };
  }, []);

  // ── Fetch which courses the current user is actively enrolled in ──
  // Used by the "My Courses" cards to show accurate enrollment state and
  // route clicks correctly (owned → into course, unowned → to purchase page).
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    import('../lib/supabase').then(({ supabase }) =>
      supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
    ).then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        console.error('Failed to load enrollments:', error);
        return;
      }
      setEnrolledCourseIds(new Set((data || []).map((row) => row.course_id)));
    });
    return () => { cancelled = true; };
  }, [user?.id]);

  // ── Derived data ──────────────────────────────────────────
  const firstName =
    profile?.display_name?.split(' ')[0] ||
    user?.user_metadata?.display_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Friend';

  // Enrolled students should see the same modules as admins. is_preview was
  // for the legacy free-preview flag, but is false on every module now.
  const canAccessContent = isAdmin || hasActiveEnrollment;

  // Find the first in-progress module (has some but not all lessons completed)
  const activeModule = course?.modules?.find((mod) => {
    if (!mod.is_preview && !canAccessContent) return false;
    const progress = getModuleProgress(mod);
    return progress > 0 && progress < 100;
  }) || course?.modules?.find((m) => m.is_preview || canAccessContent);

  const activeModuleProgress = activeModule ? getModuleProgress(activeModule) : 0;

  // Find the next incomplete lesson in the active module
  const nextLesson = activeModule?.lessons?.find(
    (l) => !isLessonCompleted(l.id)
  );

  // Stats
  const completedModules = course?.modules?.filter(
    (m) => (m.is_preview || canAccessContent) && getModuleProgress(m) === 100
  ).length || 0;
  const totalLessons = course?.modules?.reduce(
    (sum, m) => sum + (m.lessons?.length || 0),
    0
  ) || 0;
  const completedLessons = course?.modules?.reduce(
    (sum, m) =>
      sum + (m.lessons?.filter((l) => isLessonCompleted(l.id)).length || 0),
    0
  ) || 0;

  // ── Navigate to module/lesson ─────────────────────────────
  const goToModule = (mod) => {
    navigate(`${basePath}/module-${mod.module_number}`);
  };

  const goToLesson = (mod, lesson) => {
    navigate(`${basePath}/module-${mod.module_number}/lesson-${lesson.sort_order}`);
  };

  return (
    <div ref={containerRef} className="pb-24 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-16">
      {/* ── Back to website ─────────────────────────────────── */}
      <div className="pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 font-sans text-sm text-foreground/40 hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to website
        </Link>
      </div>

      {/* ── Welcome Header ─────────────────────────────────── */}
      <section className="relative pt-2" data-animate>
        <div className="max-w-3xl">
          <h1 className="font-drama text-4xl sm:text-5xl md:text-6xl text-foreground leading-tight tracking-tight mb-6">
            Welcome back to your Sanctuary,{' '}
            <span className="italic text-primary">{firstName}</span>
          </h1>
          <div className="flex items-start gap-4 text-foreground/60 italic font-drama text-lg sm:text-xl">
            <Quote className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <p className="max-w-xl">
              "The wound is the place where the Light enters you. Let us tend to the garden of your heart today."
            </p>
          </div>
        </div>
        {/* Decorative blur */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" aria-hidden="true" />
      </section>

      {/* ── Quick Links ─────────────────────────────────────── */}
      <section className="flex flex-wrap gap-3" data-animate>
        <Link
          to="/portal/downloads"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-primary border border-primary/20 hover:bg-primary/5 transition-colors"
        >
          <Download className="w-4 h-4" />
          My Downloads
        </Link>
      </section>

      {/* ── Educational disclaimer ─────────────────────────── */}
      <p className="font-sans text-xs text-foreground/30 leading-relaxed max-w-2xl -mt-10" data-animate>
        This program is for educational purposes only and is not a substitute for professional therapy, medical advice, or clinical treatment.
        If you are in crisis, please call <strong className="text-foreground/40">988</strong> (Suicide &amp; Crisis Lifeline) or <strong className="text-foreground/40">1-800-799-7233</strong> (Domestic Violence Hotline).
      </p>

      {/* ── My Courses (multi-course catalog) ─────────────── */}
      {availableCourses.length > 1 && (
        <section data-animate>
          <div className="flex items-center gap-3 mb-6">
            <Library className="w-5 h-5 text-primary" />
            <h2 className="font-drama text-2xl text-foreground">My Courses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((c) => {
              // Enrollment-aware routing: owned → first module, unowned → purchase page.
              const isEnrolled = enrolledCourseIds.has(c.id);

              let destination;
              if (isEnrolled) {
                // Legacy flagship uses /portal/:moduleSlug; other courses are scoped.
                destination =
                  c.slug === 'healing-hearts-journey'
                    ? '/portal/module-1'
                    : `/portal/course/${c.slug}/module-1`;
              } else {
                // Per-course marketing page. Fall back to /{slug} if unknown.
                destination =
                  c.slug === 'healing-hearts-journey'
                    ? '/apply'
                    : c.slug === 'rescue-kit'
                      ? '/rescue-kit'
                      : `/${c.slug}`;
              }

              return (
                <div
                  key={c.id}
                  className={`group bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(7,58,71,0.08)] transition-all duration-200 cursor-pointer hover:shadow-[0_8px_30px_-4px_rgba(7,58,71,0.12)] hover:scale-[1.02] ${
                    isEnrolled ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => navigate(destination)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(destination);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${c.title}${isEnrolled ? ' (enrolled)' : ' (not enrolled)'}`}
                >
                  <div className="h-24 bg-gradient-to-br from-primary/10 to-accent/5 relative flex items-end p-5">
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-outfit font-bold uppercase tracking-wider">
                      {c.course_type === 'flagship' ? 'Full Program' : 'Toolkit'}
                    </span>
                    {isEnrolled ? (
                      <span className="absolute top-3 right-3 bg-primary text-white text-[10px] font-outfit font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Unlocked
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-foreground/60 text-[10px] font-outfit font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Not enrolled
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-outfit text-base font-semibold mb-1 group-hover:text-primary transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-sm text-foreground/50 line-clamp-2 leading-relaxed mb-3">
                      {c.description}
                    </p>
                    <p className="text-xs font-outfit font-medium text-primary group-hover:text-primary/80">
                      {isEnrolled ? 'Start Course →' : 'Learn more →'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Start Your Journey (unenrolled users) ──────────── */}
      {showStartJourney && (
        <section className="relative" data-animate>
          <div className="rounded-3xl bg-primary text-white p-10 md:p-14 relative overflow-hidden">
            <div
              className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative z-10 max-w-2xl">
              <p className="font-outfit text-xs uppercase tracking-widest text-white/80 mb-3">
                Start Your Journey
              </p>
              <h2 className="font-drama italic text-3xl sm:text-4xl text-white mb-5 leading-tight">
                You have not enrolled yet.
              </h2>
              <p className="font-sans text-white/80 text-base leading-relaxed mb-8">
                The Healing Hearts Program is 8 modules, 32 milestones, live weekly coaching with Trisha, and a community of couples walking the same road. Ready to begin? Start with the free 7-Day Spark Challenge — a daily practice delivered to your inbox — or apply for the full program.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/spark-challenge"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-accent text-white font-outfit text-sm font-medium shadow-lg hover:scale-105 transition-transform"
                >
                  Start the Spark Challenge <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/apply"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-white/30 text-white font-outfit text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Apply for Healing Hearts
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Current Focus + Daily Intention ────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8" data-animate>
        {/* Active module card */}
        {activeModule && (
          <div className="lg:col-span-8 bg-white rounded-2xl p-8 shadow-[0_4px_20px_-4px_rgba(7,58,71,0.08)] relative overflow-hidden group">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-outfit font-semibold tracking-wider uppercase">
                  Active Module
                </span>
              </div>
              <h2 className="font-drama text-2xl sm:text-3xl text-foreground mb-4">
                Module {activeModule.module_number}: {activeModule.title}
              </h2>
              <p className="text-foreground/60 mb-12 max-w-md text-sm leading-relaxed">
                {activeModule.description || 'Continue your healing journey through this module.'}
              </p>
              <div className="mt-auto">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <span className="text-sm font-outfit text-foreground/50">Progress</span>
                    <div className="text-2xl font-drama italic text-foreground">
                      {activeModuleProgress}% Completed
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      nextLesson
                        ? goToLesson(activeModule, nextLesson)
                        : goToModule(activeModule)
                    }
                    className="bg-primary text-white px-8 py-3 rounded-full font-outfit text-sm font-medium hover:bg-primary/90 transition-all duration-200 flex items-center gap-2 active:scale-[0.98]"
                  >
                    {activeModuleProgress > 0 ? 'Continue Lesson' : 'Start Module'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                    style={{ width: `${activeModuleProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Daily intention widget */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <DailyIntentionWidget />
        </div>
      </section>

      {/* ── Healing Journey Stats ──────────────────────────── */}
      <section className="bg-neutral-50 rounded-2xl p-8" data-animate>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="font-drama text-2xl text-foreground">Your Healing Journey</h2>
          <div className="flex items-center gap-6 text-foreground/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm font-outfit">Active Growth</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-sm font-outfit">Integration</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: completedLessons, label: 'Lessons Completed', icon: BookOpen },
            {
              value: completedModules > 0 ? completedModules : completedLessons > 0 ? '...' : '0',
              label: completedModules > 0 ? 'Modules Completed' : completedLessons > 0 ? 'Module In Progress' : 'Modules Completed',
              icon: Flame,
            },
            { value: totalLessons, label: 'Total Lessons', icon: Clock },
            { value: `${overallProgress}%`, label: 'Overall Progress', icon: ChevronRight },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="p-6 bg-white rounded-2xl flex flex-col gap-2 shadow-[0_2px_8px_-2px_rgba(7,58,71,0.06)]"
            >
              <span className="text-3xl font-drama text-primary">{value}</span>
              <span className="text-xs font-outfit uppercase tracking-widest text-foreground/50">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Module Library ─────────────────────────────────── */}
      <section data-animate>
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-drama text-3xl mb-2 text-foreground">Explore the Library</h2>
            <p className="text-foreground/50">Wisdom curated for every step of your path.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {course?.modules?.map((mod) => {
            const modProgress = (mod.is_preview || canAccessContent) ? getModuleProgress(mod) : 0;
            const isLocked = !mod.is_preview && !canAccessContent;

            return (
              <div
                key={mod.id}
                className={`group bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(7,58,71,0.08)] transition-all duration-200 ${
                  !isLocked
                    ? 'cursor-pointer hover:shadow-[0_8px_30px_-4px_rgba(7,58,71,0.12)] hover:scale-[1.02]'
                    : 'opacity-60'
                }`}
                onClick={() => !isLocked && goToModule(mod)}
                onKeyDown={(e) => {
                  if (!isLocked && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    goToModule(mod);
                  }
                }}
                tabIndex={isLocked ? -1 : 0}
                role="button"
                aria-label={`Module ${mod.module_number}: ${mod.title}${isLocked ? ' - Locked' : ''}`}
              >
                {/* Gradient header */}
                <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 relative flex items-end p-6">
                  <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-outfit font-bold uppercase tracking-wider">
                    Module {mod.module_number}
                  </span>
                  {isLocked && (
                    <div className="absolute top-4 right-4">
                      <Lock className="w-5 h-5 text-primary/40" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-outfit text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-sm text-foreground/50 mb-4 line-clamp-2 leading-relaxed">
                    {mod.description || 'Explore this module to begin your journey.'}
                  </p>

                  {/* Progress bar for accessible modules */}
                  {!isLocked && modProgress > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-foreground/40 mb-1">
                        <span>Progress</span>
                        <span>{modProgress}%</span>
                      </div>
                      <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${modProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-foreground/40">
                    <span>{mod.lessons?.length || 0} Lessons</span>
                    {!isLocked && (
                      <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
