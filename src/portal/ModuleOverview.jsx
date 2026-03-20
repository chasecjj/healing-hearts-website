import React, { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  Lock,
  FileText,
  Headphones,
  Download,
} from 'lucide-react';

/**
 * Module Overview — teal gradient header, horizontal journey timeline,
 * progress circle, module resources.
 *
 * Rendered at /portal/:moduleSlug (no lessonSlug).
 */
export default function ModuleOverview({
  course,
  currentModule,
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
  }, [currentModule?.id]);

  // ── Derived data ──────────────────────────────────────────
  const moduleProgress = currentModule ? getModuleProgress(currentModule) : 0;
  const totalLessons = currentModule?.lessons?.length || 0;
  const completedLessons = currentModule?.lessons?.filter((l) =>
    isLessonCompleted(l.id)
  ).length || 0;

  // Build timeline lesson list
  const timelineLessons = useMemo(() => {
    if (!currentModule?.lessons) return [];
    // Only top-level lessons (no children) for the timeline
    const topLevel = currentModule.lessons.filter((l) => !l.parent_lesson_id);
    let foundIncomplete = false;

    return topLevel.map((lesson) => {
      const completed = isLessonCompleted(lesson.id);
      let status = 'locked';

      if (completed) {
        status = 'completed';
      } else if (!foundIncomplete) {
        status = 'in-progress';
        foundIncomplete = true;
      }

      return {
        ...lesson,
        status,
        label: `${currentModule.module_number}.${lesson.sort_order}`,
      };
    });
  }, [currentModule, isLessonCompleted]);

  // Find first in-progress lesson
  const currentLesson = timelineLessons.find((l) => l.status === 'in-progress');

  // ── Navigation helpers ────────────────────────────────────
  const goToLesson = (lesson) => {
    navigate(
      `/portal/module-${currentModule.module_number}/lesson-${lesson.sort_order}`
    );
  };

  const goBackToDashboard = () => {
    navigate('/portal');
  };

  // ── Progress circle SVG calculations ──────────────────────
  const circleSize = 192;
  const strokeWidth = 4;
  const radius = (circleSize - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (moduleProgress / 100) * circumference;
  const center = circleSize / 2;

  if (!currentModule) return null;

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      {/* ── Hero Header ────────────────────────────────────── */}
      <section
        className="relative rounded-3xl overflow-hidden mb-12 mx-4 sm:mx-8 mt-4 p-8 sm:p-12 bg-primary/5 min-h-[280px] flex flex-col justify-center"
        data-animate
      >
        {/* Decorative blurs */}
        <div className="absolute inset-0 z-0 opacity-20 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="relative z-10">
          <button
            onClick={goBackToDashboard}
            className="inline-flex items-center gap-2 text-accent font-outfit text-xs font-bold tracking-widest uppercase mb-6 hover:gap-3 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Return to Dashboard
          </button>
          <h1 className="font-drama text-4xl sm:text-5xl md:text-6xl text-primary mb-4 max-w-2xl leading-tight">
            Module {currentModule.module_number}: {currentModule.title}
          </h1>
          <p className="font-sans text-base sm:text-lg text-foreground/60 max-w-xl leading-relaxed">
            {currentModule.description ||
              'Explore the lessons within this module to continue your healing journey.'}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 px-4 sm:px-8 pb-24 max-w-7xl mx-auto">
        {/* ── Left Column: Journey Timeline ────────────────── */}
        <div className="lg:col-span-8 space-y-12">
          {/* Learning Journey */}
          <section data-animate>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-drama text-2xl sm:text-3xl text-foreground">
                Learning Journey
              </h2>
              <span className="font-outfit text-xs font-medium text-foreground/50 uppercase tracking-widest">
                {totalLessons} Lessons
              </span>
            </div>

            <div className="space-y-3">
              {timelineLessons.map((lesson) => {
                const isCompleted = lesson.status === 'completed';
                const isActive = lesson.status === 'in-progress';
                const isLocked = lesson.status === 'locked';

                return (
                  <div
                    key={lesson.id}
                    className={`relative flex items-center gap-5 p-5 rounded-2xl transition-all ${
                      isCompleted
                        ? 'bg-white hover:bg-neutral-50 hover:shadow-sm cursor-pointer'
                        : isActive
                        ? 'bg-white border-l-4 border-primary hover:bg-neutral-50 cursor-pointer'
                        : 'bg-neutral-50/50 opacity-60 cursor-not-allowed'
                    }`}
                    onClick={() => !isLocked && goToLesson(lesson)}
                    onKeyDown={(e) => {
                      if (!isLocked && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        goToLesson(lesson);
                      }
                    }}
                    tabIndex={isLocked ? -1 : 0}
                    role="button"
                    aria-label={`${lesson.title} - ${
                      isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Locked'
                    }`}
                  >
                    {/* Status circle */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-primary/10 text-primary'
                          : isActive
                          ? 'bg-primary text-white'
                          : 'bg-neutral-200 text-foreground/40'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isActive ? (
                        <PlayCircle className="w-5 h-5" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-grow min-w-0">
                      <span
                        className={`text-[10px] font-outfit font-bold uppercase tracking-widest block ${
                          isActive ? 'text-primary' : isCompleted ? 'text-primary/60' : 'text-foreground/40'
                        }`}
                      >
                        Lesson {lesson.label}
                      </span>
                      <h3 className="font-sans text-base sm:text-lg font-semibold text-foreground truncate">
                        {lesson.title}
                      </h3>
                    </div>

                    {/* Status badge */}
                    {isCompleted && (
                      <span className="text-xs font-outfit font-bold text-primary flex-shrink-0">
                        Completed
                      </span>
                    )}
                    {isActive && (
                      <span className="text-xs font-outfit font-bold text-accent flex-shrink-0">
                        In Progress
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Module Resources ────────────────────────────── */}
          <section data-animate>
            <h2 className="font-drama text-2xl sm:text-3xl text-foreground mb-8">
              Module Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group p-8 rounded-3xl bg-white transition-all hover:shadow-[0_8px_30px_-4px_rgba(7,58,71,0.12)] border border-neutral-100">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="font-outfit text-lg font-bold text-foreground mb-2">
                  Reflection Journal
                </h4>
                <p className="text-sm text-foreground/50 mb-6 leading-relaxed">
                  A guided worksheet to document your reflections and emotional triggers from this module.
                </p>
                <button className="flex items-center gap-2 text-primary font-outfit text-xs font-bold uppercase tracking-widest group/btn">
                  Download PDF
                  <Download className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform" />
                </button>
              </div>

              <div className="group p-8 rounded-3xl bg-white transition-all hover:shadow-[0_8px_30px_-4px_rgba(7,58,71,0.12)] border border-neutral-100">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <Headphones className="w-6 h-6" />
                </div>
                <h4 className="font-outfit text-lg font-bold text-foreground mb-2">
                  Grounding Meditation
                </h4>
                <p className="text-sm text-foreground/50 mb-6 leading-relaxed">
                  A guided audio experience to help you anchor yourself before deep exploration.
                </p>
                <button className="flex items-center gap-2 text-primary font-outfit text-xs font-bold uppercase tracking-widest group/btn">
                  Play Audio
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ── Right Column: Progress ───────────────────────── */}
        <div className="lg:col-span-4" data-animate>
          <div className="sticky top-8 space-y-8">
            {/* Progress Circle Card */}
            <div className="bg-neutral-50 rounded-[2rem] p-8 sm:p-10 text-center relative overflow-hidden">
              <h3 className="font-outfit text-xs font-bold uppercase tracking-[0.2em] text-foreground/50 mb-10">
                Growth Progress
              </h3>

              {/* SVG Progress Circle */}
              <div
                className="relative mx-auto mb-8 flex items-center justify-center"
                style={{ width: circleSize, height: circleSize }}
                role="progressbar"
                aria-valuenow={moduleProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Module progress: ${moduleProgress}%`}
              >
                <svg
                  className="absolute inset-0 -rotate-90"
                  width={circleSize}
                  height={circleSize}
                  viewBox={`0 0 ${circleSize} ${circleSize}`}
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-neutral-200"
                  />
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth + 2}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="text-primary transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="relative z-10 flex flex-col items-center">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-primary mb-2"
                    aria-hidden="true"
                  >
                    <path d="M6.05 8.05a7 7 0 0011.9 0A6 6 0 0112 20a6 6 0 01-5.95-11.95zM12 2a5 5 0 014.95 4.37A8.94 8.94 0 0012 5a8.94 8.94 0 00-4.95 1.37A5 5 0 0112 2z" />
                  </svg>
                  <span className="font-drama text-3xl font-bold text-foreground">
                    {moduleProgress}%
                  </span>
                </div>
              </div>

              <p className="font-sans text-sm italic text-accent leading-relaxed mb-8">
                "Like a seed in the dark, you are pushing through towards the light."
              </p>

              <div className="space-y-4">
                <div className="flex justify-between text-xs font-outfit font-medium text-foreground/50 px-2">
                  <span>Milestone: Lessons</span>
                  <span>
                    {completedLessons}/{totalLessons}
                  </span>
                </div>
                <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{
                      width: `${totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Reflection Quote Card */}
            <div className="p-8 rounded-3xl border border-neutral-100 bg-white">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-accent/30 mb-4"
                aria-hidden="true"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="font-drama text-lg text-foreground italic leading-relaxed">
                Self-awareness is not a destination, but a gentle unfolding of the truth that was always within you.
              </p>
            </div>

            {/* Resume lesson CTA */}
            {currentLesson && (
              <button
                onClick={() => goToLesson(currentLesson)}
                className="w-full bg-primary text-white py-4 rounded-2xl font-outfit text-sm font-semibold shadow-[0_4px_20px_-4px_rgba(17,145,177,0.3)] hover:shadow-[0_8px_30px_-4px_rgba(17,145,177,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Continue Lesson
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Navigation Bar ────────────────────────── */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex justify-between gap-8 sm:gap-12 items-center bg-white/80 backdrop-blur-xl rounded-full px-6 sm:px-8 py-3 w-auto min-w-[280px] sm:min-w-[320px] shadow-[0_8px_30px_-4px_rgba(7,58,71,0.15)]">
        <button
          onClick={goBackToDashboard}
          className="flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-outfit text-xs font-medium tracking-widest uppercase hidden sm:inline">
            Dashboard
          </span>
        </button>
        {currentLesson && (
          <button
            onClick={() => goToLesson(currentLesson)}
            className="flex items-center gap-2 text-primary hover:scale-105 transition-transform group"
          >
            <span className="font-outfit text-xs font-medium tracking-widest uppercase">
              Start Lesson
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </nav>
    </div>
  );
}
