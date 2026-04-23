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
    <div ref={containerRef} className="pb-24 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* ── Welcome Header (D10: neutral surface, single accent moment) ─ */}
      <section
        className="relative rounded-3xl overflow-hidden pt-6 p-8 sm:p-12 min-h-[200px] flex flex-col justify-center"
        style={{ backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)' }}
        data-animate
      >
        <div className="relative z-10 max-w-3xl">
          <h1 className="font-drama text-4xl sm:text-5xl md:text-6xl text-foreground leading-tight tracking-tight mb-6">
            Welcome back to your Sanctuary,{' '}
            <span
              className="italic"
              style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)' }}
            >
              {firstName}
            </span>
          </h1>
          <div className="flex items-start gap-4 text-foreground/60 italic font-drama text-lg sm:text-xl">
            <Quote
              className="w-6 h-6 flex-shrink-0 mt-1"
              style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)' }}
            />
            <p className="max-w-xl">
              &ldquo;The wound is the place where the Light enters you. Let us tend to the garden of your heart today.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* ── Quick Links ─────────────────────────────────────── */}
      <section className="flex flex-wrap gap-3" data-animate>
        <Link
          to="/portal/downloads"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors hover:opacity-80"
          style={{
            color: 'var(--pt-primary-accent-hex, #B96A5F)',
            border: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
            backgroundColor: 'var(--pt-elevation-2-hex, #ffffff)',
          }}
        >
          <Download className="w-4 h-4" />
          My Downloads
        </Link>
      </section>

      {/* ── Educational disclaimer ─────────────────────────── */}
      <p className="font-sans text-xs text-foreground/30 leading-relaxed max-w-2xl -mt-4" data-animate>
        This program is for educational purposes only and is not a substitute for professional therapy, medical advice, or clinical treatment.
        If you are in crisis, please call <strong className="text-foreground/40">988</strong> (Suicide &amp; Crisis Lifeline) or <strong className="text-foreground/40">1-800-799-7233</strong> (Domestic Violence Hotline).
      </p>

      {/* ── Your Healing Journey Stats (flat typography per D4) ─────── */}
      <section className="py-6" data-animate>
        <h2 className="text-2xl font-semibold text-foreground mb-6">Your Healing Journey</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: completedLessons, label: 'Lessons Completed' },
            {
              value: completedModules > 0 ? completedModules : completedLessons > 0 ? '…' : '0',
              label: completedModules > 0 ? 'Modules Completed' : completedLessons > 0 ? 'Module In Progress' : 'Modules Completed',
            },
            { value: totalLessons, label: 'Total Lessons' },
            { value: `${overallProgress}%`, label: 'Overall Progress' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-1">
              <span
                style={{
                  fontSize: '28px',
                  lineHeight: 1,
                  fontWeight: 600,
                  fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif',
                  letterSpacing: '-0.02em',
                  color: 'var(--pt-text-primary-hex, #1c1917)',
                }}
              >
                {value}
              </span>
              <span
                style={{
                  fontSize: '13px',
                  lineHeight: 1.45,
                  fontWeight: 400,
                  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                  letterSpacing: '0.02em',
                  color: 'var(--pt-text-muted-hex, #57534e)',
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── My Courses (multi-course catalog) ─────────────── */}
      {availableCourses.length > 1 && (
        <section data-animate>
          <div className="flex items-center gap-3 mb-6">
            <Library
              className="w-5 h-5"
              style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)' }}
            />
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
                  className="group bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(28,25,23,0.08)] transition-all duration-200 cursor-pointer hover:shadow-[0_8px_30px_-4px_rgba(28,25,23,0.12)] hover:scale-[1.02]"
                  style={
                    isEnrolled
                      ? { boxShadow: '0 0 0 2px var(--pt-primary-accent-hex, #B96A5F)' }
                      : undefined
                  }
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
                  {/* D10: neutral banner, no teal gradient. Accent stripe marks enrolled state. */}
                  <div
                    className="h-24 relative flex items-end p-5"
                    style={{
                      backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)',
                      borderBottom: isEnrolled
                        ? '2px solid var(--pt-primary-accent-hex, #B96A5F)'
                        : '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
                    }}
                  >
                    <span
                      className="px-3 py-1 rounded-full text-[10px] font-outfit font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: 'var(--pt-elevation-2-hex, #ffffff)',
                        color: 'var(--pt-text-primary-hex, #1c1917)',
                      }}
                    >
                      {c.course_type === 'flagship' ? 'Full Program' : 'Toolkit'}
                    </span>
                    {isEnrolled ? (
                      <span
                        className="absolute top-3 right-3 text-white text-[10px] font-outfit font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)' }}
                      >
                        Unlocked
                      </span>
                    ) : (
                      <span
                        className="absolute top-3 right-3 text-[10px] font-outfit font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: 'var(--pt-elevation-2-hex, #ffffff)',
                          color: 'var(--pt-text-muted-hex, #57534e)',
                        }}
                      >
                        Not enrolled
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-outfit text-base font-semibold mb-1 transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-sm text-foreground/50 line-clamp-2 leading-relaxed mb-3">
                      {c.description}
                    </p>
                    <p
                      className="text-xs font-outfit font-medium group-hover:opacity-80"
                      style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)' }}
                    >
                      {isEnrolled ? 'Start Course →' : 'Learn more →'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Start Your Journey (unenrolled users) — D10: warm-dark rail, no teal ─ */}
      {showStartJourney && (
        <section className="relative" data-animate>
          <div
            className="rounded-3xl text-white p-10 md:p-14 relative overflow-hidden"
            style={{ backgroundColor: 'var(--pt-rail-hex, #24201D)' }}
          >
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
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-white font-outfit text-sm font-medium shadow-lg hover:scale-105 transition-transform"
                  style={{ backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)' }}
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
          <div
            className="lg:col-span-8 relative rounded-3xl overflow-hidden p-8 sm:p-10"
            style={{ backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)' }}
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="px-3 py-1 rounded-full text-xs font-outfit font-semibold tracking-wider uppercase"
                  style={{
                    backgroundColor: 'var(--pt-elevation-2-hex, #ffffff)',
                    color: 'var(--pt-primary-accent-hex, #B96A5F)',
                  }}
                >
                  Active Module
                </span>
              </div>
              <h2 className="font-drama text-3xl sm:text-4xl text-foreground mb-4">
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
                    className="text-white px-8 py-3 rounded-full font-outfit text-sm font-medium transition-all duration-200 flex items-center gap-2 active:scale-[0.98] hover:opacity-90"
                    style={{ backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)' }}
                  >
                    {activeModuleProgress > 0 ? 'Continue Lesson' : 'Start Module'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {/* Progress bar (D10: accent fill, neutral track, no teal gradient) */}
                <div
                  className="h-1.5 w-full rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--pt-border-subtle-hex, #d6d3d1)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${activeModuleProgress}%`,
                      backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)',
                    }}
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
                {/* D10: neutral banner, no teal gradient. Single accent stripe marks module. */}
                <div
                  className="h-40 relative flex items-end p-6"
                  style={{
                    backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)',
                    borderBottom: '2px solid var(--pt-primary-accent-hex, #B96A5F)',
                  }}
                >
                  <span
                    className="px-3 py-1 rounded-full text-[10px] font-outfit font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: 'var(--pt-elevation-2-hex, #ffffff)',
                      color: 'var(--pt-text-primary-hex, #1c1917)',
                    }}
                  >
                    Module {mod.module_number}
                  </span>
                  {isLocked && (
                    <div className="absolute top-4 right-4">
                      <Lock
                        className="w-5 h-5"
                        style={{ color: 'var(--pt-text-muted-hex, #57534e)' }}
                      />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-outfit text-lg font-semibold mb-2 transition-colors">
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
                      <div
                        className="h-1 w-full rounded-full overflow-hidden"
                        style={{ backgroundColor: 'var(--pt-border-subtle-hex, #d6d3d1)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${modProgress}%`,
                            backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-foreground/40">
                    <span>{mod.lessons?.length || 0} Lessons</span>
                    {!isLocked && (
                      <ChevronRight
                        className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)' }}
                      />
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
