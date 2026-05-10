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
import { useMockupMode } from './mockup/useMockupMode';
import ModuleHero from './mockup/ModuleHero';

/**
 * Module Overview — teal gradient header, horizontal journey timeline,
 * progress circle, module resources.
 *
 * Rendered at /portal/:moduleSlug (no lessonSlug).
 *
 * Wave 5 mockup-mode: `?mockup=1` short-circuits to ModuleHero (static hero-state
 * mockup) for webinar-demo screenshots.
 */
export default function ModuleOverviewWithMockup(props) {
  const mockupMode = useMockupMode();
  if (mockupMode) return <ModuleHero />;
  return <ModuleOverview {...props} />;
}

function ModuleOverview({
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

  // Build timeline lesson list — Axis F (2026-05-10):
  // Modules 1+2 use parent-as-index pattern (migration 022). Parent rows have
  // intentionally minimal 2-block content_json acting as INDEX PAGES; real
  // content lives in 24+20 = 44 sub-lessons (sort_order 101+, 201+, …).
  // Previously this filter was `!l.parent_lesson_id` only, so users only ever
  // saw parent indexes and never the sub-lessons. We now render a flat
  // chronological list using the lesson order from useCourseData (which
  // already orders by sort_order), letting parents appear as section headers
  // and sub-lessons underneath as indented entries.
  const timelineLessons = useMemo(() => {
    if (!currentModule?.lessons) return [];
    let foundIncomplete = false;

    // Group by parent → render parents in document order, then immediately
    // their children (indent flag carries through to render).
    const parents = currentModule.lessons.filter((l) => !l.parent_lesson_id);
    const childrenByParent = new Map();
    currentModule.lessons.forEach((l) => {
      if (l.parent_lesson_id) {
        const arr = childrenByParent.get(l.parent_lesson_id) || [];
        arr.push(l);
        childrenByParent.set(l.parent_lesson_id, arr);
      }
    });

    const flat = [];
    parents.forEach((parent, parentIdx) => {
      const kids = (childrenByParent.get(parent.id) || []).slice().sort(
        (a, b) => a.sort_order - b.sort_order
      );
      // Parent label: "1.1" style (module.parentIdx+1)
      flat.push({
        ...parent,
        isParent: true,
        hasChildren: kids.length > 0,
        label: `${currentModule.module_number}.${parentIdx + 1}`,
      });
      kids.forEach((kid, kidIdx) => {
        flat.push({
          ...kid,
          isParent: false,
          isChild: true,
          // Child label: "1.1.1" — preserves hierarchy in UI
          label: `${currentModule.module_number}.${parentIdx + 1}.${kidIdx + 1}`,
        });
      });
    });

    return flat.map((lesson) => {
      const completed = isLessonCompleted(lesson.id);
      let status = 'locked';
      if (completed) {
        status = 'completed';
      } else if (!foundIncomplete) {
        status = 'in-progress';
        foundIncomplete = true;
      }
      return { ...lesson, status };
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
      {/* ── Hero Header (3.13 hero-image slot, 3.15 action register, 3.16 rotation) */}
      {/* 3.15: action register — heavier serif weight vs Dashboard restorative      */}
      {/* 3.16: rotation lifecycle — GSAP entrance re-fires on currentModule?.id     */}
      <section
        className="relative mb-12 mx-4 sm:mx-8 mt-4"
        data-animate
        aria-label={`Module ${currentModule.module_number}: ${currentModule.title}`}
      >
        {/* 2px terracotta top accent (section-identity channel per 3.8-rev) */}
        <div
          style={{ height: 2, background: 'var(--pt-primary-accent-hex, #B96A5F)' }}
          aria-hidden="true"
        />

        {/* Magazine-stack 2-col: text (left) + hero-image slot (right) */}
        {/* Mobile: single-col stack. sm+(≥640px): 2-col original layout */}
        <div
          className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
          style={{
            gap: 40,
            alignItems: 'stretch',
            background: 'var(--pt-elevation-1-hex, #e7e5e4)',
            padding: '40px 44px',
          }}
        >
          {/* ── Text column ─────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <button
              onClick={goBackToDashboard}
              className="inline-flex items-center gap-2 font-outfit text-xs font-bold tracking-widest uppercase mb-6 hover:gap-3 transition-all"
              style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)', alignSelf: 'flex-start' }}
            >
              <ChevronLeft className="w-4 h-4" />
              Return to Dashboard
            </button>

            {/* 3.15 action register: fontWeight 500 (heavier than Dashboard 300) */}
            <p
              style={{
                fontFamily: '"Outfit", sans-serif',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'var(--pt-primary-accent-hex, #B96A5F)',
                margin: '0 0 16px',
              }}
            >
              Module {currentModule.module_number}
            </p>
            <h1
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: 500,
                fontStyle: 'italic',
                fontSize: 'clamp(36px, 4.5vw, 54px)',
                lineHeight: 1.07,
                letterSpacing: '-0.02em',
                color: 'var(--pt-text-primary-hex, #1c1917)',
                margin: '0 0 20px',
              }}
            >
              {currentModule.title}
            </h1>
            <p
              style={{
                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                fontSize: 16,
                lineHeight: 1.6,
                color: 'var(--pt-text-muted-hex, #57534e)',
                margin: '0 0 24px',
                maxWidth: 440,
              }}
            >
              {currentModule.description ||
                'Explore the lessons within this module to continue your healing journey.'}
            </p>

            {/* Quiet progress line (no ring — ring creates anxiety, per ModuleHero mockup) */}
            <p
              style={{
                fontFamily: '"Outfit", sans-serif',
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--pt-text-muted-hex, #57534e)',
                margin: 0,
              }}
            >
              {completedLessons} of {totalLessons} lessons complete
            </p>
          </div>

          {/* ── Hero-image slot (3.13, A-09) ─────────────────── */}
          {/* A-09: Photography-over-illustration mandate.        */}
          {/* TODO A-09: Replace this gradient placeholder with a  */}
          {/* photographic <img> or CSS background-image asset —  */}
          {/* Trisha portraiture or module course-stills. Gradient */}
          {/* is NOT spec-compliant default (§12.1 A-09).          */}
          <div
            style={{
              position: 'relative',
              minHeight: 260,
              borderRadius: 16,
              overflow: 'hidden',
              background:
                'linear-gradient(135deg, var(--pt-primary-accent-hex, #B96A5F) 0%, #3A2E27 100%)',
            }}
            aria-hidden="true"
          >
            {/* Module number watermark — decorative only */}
            <div
              style={{
                position: 'absolute',
                bottom: 20,
                right: 24,
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 140,
                fontWeight: 500,
                fontStyle: 'italic',
                lineHeight: 0.85,
                color: 'rgba(250, 232, 212, 0.18)',
                letterSpacing: '-0.04em',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {String(currentModule.module_number).padStart(2, '0')}
            </div>
          </div>
        </div>
      </section>

      {/* LOW-09 fix: pb-[180px] at <md to clear PortalLayout mobile bottom-nav
          (80px) + ModuleOverview's own floating "Dashboard / Start Lesson" pill
          (~64px sitting at bottom-8) + safe spacing. md+ collapses back to
          pb-24 since the desktop layout has neither overlay. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 px-4 sm:px-8 pb-[180px] md:pb-24 max-w-7xl mx-auto">
        {/* ── Left Column: Journey Timeline ────────────────── */}
        <div className="lg:col-span-8 space-y-12">
          {/* Learning Journey */}
          <section data-animate>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-drama text-2xl sm:text-3xl text-foreground">
                Learning Journey
              </h2>
              <span className="font-outfit text-xs font-medium text-pt-quiet uppercase tracking-widest">
                {totalLessons} Lessons
              </span>
            </div>

            <div className="space-y-3">
              {timelineLessons.map((lesson) => {
                const isCompleted = lesson.status === 'completed';
                const isActive = lesson.status === 'in-progress';
                const isLocked = lesson.status === 'locked';
                // Axis F: child rows indent under their parent for hierarchy.
                // sm+ gets a deeper indent; mobile keeps a smaller one so the
                // row content still has breathing room.
                const indentClass = lesson.isChild ? 'ms-6 sm:ms-12' : '';

                return (
                  <div
                    key={lesson.id}
                    className={`relative flex items-center gap-5 p-5 rounded-2xl transition-all ${indentClass} ${
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
                          : 'bg-neutral-200 text-pt-quiet'
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
                          isCompleted ? 'text-pt-quiet' : 'text-pt-quiet'
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
                      <span className="text-xs font-outfit font-bold text-pt-quiet flex-shrink-0">
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
                <p className="text-sm text-pt-quiet mb-6 leading-relaxed">
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
                  <span className="text-pt-quiet font-outfit text-xs font-bold uppercase tracking-widest">
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
                <p className="text-sm text-pt-quiet mb-6 leading-relaxed">
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
                  <span className="text-pt-quiet font-outfit text-xs font-bold uppercase tracking-widest">
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
              <h3 className="font-outfit text-xs font-bold uppercase tracking-[0.2em] text-pt-quiet mb-10">
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
                <div className="flex justify-between text-xs font-outfit font-medium text-pt-quiet px-2">
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
      {/* LOW-09: at <md the PortalLayout mobile bottom-nav is 80px tall and
          fixed at bottom-0; lift this floating pill to bottom-[96px] so it
          clears the bottom-nav. md+ keeps original bottom-8 placement. */}
      <nav className="fixed bottom-[96px] md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex justify-between gap-8 sm:gap-12 items-center bg-white/80 backdrop-blur-xl rounded-full px-6 sm:px-8 py-3 w-auto min-w-[280px] sm:min-w-[320px] shadow-[0_8px_30px_-4px_rgba(7,58,71,0.15)]">
        <button
          onClick={goBackToDashboard}
          className="flex items-center gap-2 text-pt-quiet hover:text-foreground transition-colors group"
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
