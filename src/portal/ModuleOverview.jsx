import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Sprout,
} from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import { supabase } from '../lib/supabase';

/**
 * Module Overview — teal gradient header, horizontal journey timeline,
 * progress circle, module resources.
 *
 * Rendered at /portal/:moduleSlug (no lessonSlug).
 */
export default function ModuleOverview({
  currentModule,
  getModuleProgress,
  isLessonCompleted,
  basePath = '/portal',
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
      `${basePath}/module-${currentModule.module_number}/lesson-${lesson.sort_order}`
    );
  };

  const goBackToDashboard = () => {
    navigate(basePath);
  };

  // ── Resource handlers ────────────────────────────────────
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!currentModule?.workbook_storage_path) return;
    setDownloadingPdf(true);
    try {
      const { data, error } = await supabase.storage
        .from('workbooks')
        .createSignedUrl(currentModule.workbook_storage_path, 3600);
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      console.error('Failed to generate PDF download link:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Use MP4 rendition (not HLS .m3u8) — native <audio> doesn't support HLS on Chrome/Firefox
  const meditationSrc = currentModule?.meditation_mux_playback_id
    ? `https://stream.mux.com/${currentModule.meditation_mux_playback_id}/low.mp4`
    : null;

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
        className="relative rounded-3xl overflow-hidden mb-12 mx-4 sm:mx-8 mt-4 p-8 sm:p-12 min-h-[280px] flex flex-col justify-center"
        style={{ backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)' }}
        data-animate
      >
        {/* Signature-moment terracotta stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)' }}
          aria-hidden="true"
        />
        <div className="relative z-10">
          <button
            onClick={goBackToDashboard}
            className="inline-flex items-center gap-2 font-outfit text-xs font-bold tracking-widest uppercase mb-6 hover:gap-3 transition-all"
            style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)' }}
          >
            <ChevronLeft className="w-4 h-4" />
            Return to Dashboard
          </button>
          <h1
            className="font-drama text-4xl sm:text-5xl md:text-6xl mb-4 max-w-2xl leading-tight"
            style={{ color: 'var(--pt-text-primary-hex, #1c1917)' }}
          >
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
                        ? 'bg-white border-l-4 hover:bg-neutral-50 cursor-pointer'
                        : 'bg-neutral-50/50 opacity-60 cursor-not-allowed'
                    }`}
                    style={
                      isActive
                        ? { borderLeftColor: 'var(--pt-primary-accent-hex, #B96A5F)' }
                        : undefined
                    }
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
                          ? 'bg-neutral-200 text-foreground/70'
                          : isActive
                          ? 'text-white'
                          : 'bg-neutral-200 text-foreground/40'
                      }`}
                      style={
                        isActive
                          ? { backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)' }
                          : undefined
                      }
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
                          isCompleted ? 'text-foreground/50' : 'text-foreground/40'
                        }`}
                        style={
                          isActive
                            ? { color: 'var(--pt-primary-accent-hex, #B96A5F)' }
                            : undefined
                        }
                      >
                        Lesson {lesson.label}
                      </span>
                      <h3 className="font-sans text-base sm:text-lg font-semibold text-foreground truncate">
                        {lesson.title}
                      </h3>
                    </div>

                    {/* Status badge */}
                    {isCompleted && (
                      <span className="text-xs font-outfit font-bold text-foreground/60 flex-shrink-0">
                        Completed
                      </span>
                    )}
                    {isActive && (
                      <span
                        className="text-xs font-outfit font-bold flex-shrink-0"
                        style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)' }}
                      >
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
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)',
                    color: 'var(--pt-primary-accent-hex, #B96A5F)',
                  }}
                >
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="font-outfit text-lg font-bold text-foreground mb-2">
                  Reflection Journal
                </h4>
                <p className="text-sm text-foreground/50 mb-6 leading-relaxed">
                  A guided worksheet to document your reflections and emotional triggers from this module.
                </p>
                {currentModule?.workbook_storage_path ? (
                  <button
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                    className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-widest group/btn disabled:opacity-50"
                    style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)' }}
                  >
                    {downloadingPdf ? 'Generating...' : 'Download PDF'}
                    <Download className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform" />
                  </button>
                ) : (
                  <span className="text-foreground/30 font-outfit text-xs font-bold uppercase tracking-widest">
                    Coming Soon
                  </span>
                )}
              </div>

              <div className="group p-8 rounded-3xl bg-white transition-all hover:shadow-[0_8px_30px_-4px_rgba(7,58,71,0.12)] border border-neutral-100">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)',
                    color: 'var(--pt-primary-accent-hex, #B96A5F)',
                  }}
                >
                  <Headphones className="w-6 h-6" />
                </div>
                <h4 className="font-outfit text-lg font-bold text-foreground mb-2">
                  Grounding Meditation
                </h4>
                <p className="text-sm text-foreground/50 mb-6 leading-relaxed">
                  A guided audio experience to help you anchor yourself before deep exploration.
                </p>
                {meditationSrc ? (
                  <div className="space-y-4 w-full">
                    <button
                      onClick={() => setShowAudioPlayer(!showAudioPlayer)}
                      className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-widest group/btn"
                      style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)' }}
                    >
                      {showAudioPlayer ? 'Hide Audio' : 'Play Audio'}
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${showAudioPlayer ? 'rotate-90' : 'group-hover/btn:translate-x-0.5'}`}
                      />
                    </button>
                    {showAudioPlayer && (
                      <AudioPlayer
                        src={meditationSrc}
                        title={`${currentModule.title} — Grounding Meditation`}
                      />
                    )}
                  </div>
                ) : (
                  <span className="text-foreground/30 font-outfit text-xs font-bold uppercase tracking-widest">
                    Coming Soon
                  </span>
                )}
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
                    className="transition-all duration-700 ease-out"
                    style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)' }}
                  />
                </svg>
                <div className="relative z-10 flex flex-col items-center">
                  <Sprout
                    className="w-10 h-10 mb-2"
                    style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)' }}
                    aria-hidden="true"
                  />
                  <span className="font-drama text-3xl font-bold text-foreground">
                    {moduleProgress}%
                  </span>
                </div>
              </div>

              <p
                className="font-sans text-sm italic leading-relaxed mb-8"
                style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)' }}
              >
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
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0}%`,
                      backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)',
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
                className="mb-4"
                style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)', opacity: 0.3 }}
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
                className="w-full text-white py-4 rounded-2xl font-outfit text-sm font-semibold shadow-[0_4px_20px_-4px_rgba(185,106,95,0.3)] hover:shadow-[0_8px_30px_-4px_rgba(185,106,95,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                style={{ backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)' }}
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
            className="flex items-center gap-2 hover:scale-105 transition-transform group"
            style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)' }}
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
