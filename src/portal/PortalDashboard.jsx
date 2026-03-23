import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  BookOpen,
  Clock,
  Flame,
  Lock,
  ChevronRight,
  Quote,
} from 'lucide-react';

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
}) {
  const navigate = useNavigate();
  const containerRef = useRef(null);

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

  // ── Derived data ──────────────────────────────────────────
  const firstName = profile?.full_name?.split(' ')[0] || profile?.email?.split('@')[0] || 'Friend';

  // Find the first in-progress module (has some but not all lessons completed)
  const activeModule = course?.modules?.find((mod) => {
    if (!mod.is_preview) return false;
    const progress = getModuleProgress(mod);
    return progress > 0 && progress < 100;
  }) || course?.modules?.find((m) => m.is_preview);

  const activeModuleProgress = activeModule ? getModuleProgress(activeModule) : 0;

  // Find the next incomplete lesson in the active module
  const nextLesson = activeModule?.lessons?.find(
    (l) => !isLessonCompleted(l.id)
  );

  // Stats
  const completedModules = course?.modules?.filter(
    (m) => m.is_preview && getModuleProgress(m) === 100
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
    navigate(`/portal/module-${mod.module_number}`);
  };

  const goToLesson = (mod, lesson) => {
    navigate(`/portal/module-${mod.module_number}/lesson-${lesson.sort_order}`);
  };

  return (
    <div ref={containerRef} className="pb-24 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-16">
      {/* ── Welcome Header ─────────────────────────────────── */}
      <section className="relative pt-8" data-animate>
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

        {/* Daily intention space */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-primary/5 rounded-2xl p-8 border-l-4 border-primary h-full">
            <h3 className="font-drama text-xl mb-6 flex items-center gap-2 text-foreground">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Daily Intention
            </h3>
            <div className="space-y-6">
              <p className="text-foreground/60 leading-relaxed italic font-drama text-base">
                "Today, I will practice patience with my own healing pace. I am exactly where I need to be."
              </p>
              <div className="pt-6 border-t border-primary/10">
                <label className="block text-xs font-outfit uppercase tracking-widest text-foreground/50 mb-4">
                  Update your focus
                </label>
                <div className="bg-white rounded-xl p-4 flex items-center justify-between cursor-pointer hover:shadow-sm transition-all group/input">
                  <span className="text-sm text-foreground/40">How do you feel?</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-primary group-hover/input:translate-x-1 transition-transform"
                    aria-hidden="true"
                  >
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
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
            { value: completedModules, label: 'Modules Completed', icon: Flame },
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
            const modProgress = mod.is_preview ? getModuleProgress(mod) : 0;
            const isLocked = !mod.is_preview;

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
