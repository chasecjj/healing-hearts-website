/**
 * LessonHero — Wave 5 Screen 3 hero-state mockup.
 *
 * Genre: Slack-pattern rail + single contextual drawer (scout-wave5-A-drawer-swap).
 *
 * The fold (directive #7):
 *   - ONE drawer at a time. Courses rail selected → drawer shows course-outline
 *     with breadcrumb at drawer top. Home rail click would swap drawer to
 *     home-surface. Never both stacked.
 *
 * Layout:
 *   1. Rail (72px, icons only) — Courses icon selected (rail-selected-chip gradient)
 *   2. Single drawer (~280px) — breadcrumb + collapsible module list +
 *      Module 2 expanded with 7 lessons; active lesson highlighted with
 *      drawer-active-bg darkening (directive #2 Slack-depth progression)
 *   3. Main content: eyebrow + lesson title + paragraph + My Notes + action row + meta
 *
 * Renders as a fixed full-viewport overlay above the PortalLayout chrome so the
 * mockup's self-owned rail+drawer is what's seen on screen. No second drawer.
 */

import React from 'react';
import {
  Home,
  BookOpen,
  LifeBuoy,
  Bookmark,
  Calendar,
  Check,
  Circle,
  PlayCircle,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Clock,
  NotebookPen,
} from 'lucide-react';
import { PortalLogo } from '../components/PortalLogo';
import { MOCK_LESSON, MOCK_COURSE_OUTLINE, MOCK_USER } from './mockData';

/* ── Rail icon ─────────────────────────────────────────────────────── */
function RailIcon({ icon: Icon, selected, label }) {
  return (
    <div
      role="button"
      aria-label={label}
      aria-pressed={selected}
      style={{
        position: 'relative',
        width: 44,
        height: 44,
        borderRadius: selected ? 14 : 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: selected
          ? 'linear-gradient(135deg, #B96A5F 0%, #C49A6C 100%)'
          : 'transparent',
        backgroundSize: '200% 200%',
        boxShadow: selected ? '0 6px 16px -6px rgba(185, 106, 95, 0.5)' : 'none',
        cursor: 'pointer',
        transition: 'all 200ms cubic-bezier(0.19,1,0.22,1)',
      }}
    >
      <Icon
        size={18}
        strokeWidth={1.75}
        style={{
          color: selected ? '#fafaf9' : 'rgba(250, 250, 249, 0.55)',
        }}
      />
    </div>
  );
}

/* ── Rail ─────────────────────────────────────────────────────────── */
function Rail() {
  const { firstName } = MOCK_USER;
  return (
    <aside
      aria-label="Main navigation rail"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: 72,
        zIndex: 50,
        background: 'var(--pt-rail-hex, #24201D)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '18px 0 20px',
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--pt-primary-accent-hex, #B96A5F)',
          marginBottom: 20,
        }}
      >
        <PortalLogo size={26} alt="Healing Hearts" />
      </div>

      {/* Divider */}
      <div
        style={{
          width: 28,
          height: 1,
          background: 'rgba(255,255,255,0.08)',
          marginBottom: 20,
        }}
      />

      {/* Rail nav icons */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          flex: 1,
        }}
      >
        <RailIcon icon={Home} label="Home" selected={false} />
        <RailIcon icon={BookOpen} label="Courses" selected={true} />
        <RailIcon icon={LifeBuoy} label="Rescue Kit" selected={false} />
        <RailIcon icon={Bookmark} label="Bookmarks" selected={false} />
        <RailIcon icon={Calendar} label="Calendar" selected={false} />
      </nav>

      {/* Avatar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            background: 'var(--pt-primary-accent-hex, #B96A5F)',
            color: '#fafaf9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Outfit", sans-serif',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {firstName.charAt(0).toUpperCase()}
        </div>
        <span
          style={{
            fontFamily: '"Outfit", sans-serif',
            fontSize: 10,
            color: 'rgba(250,250,249,0.55)',
            lineHeight: 1,
          }}
        >
          {firstName}
        </span>
      </div>
    </aside>
  );
}

/* ── Drawer header with breadcrumb + section-flavor accent line ────── */
function DrawerHeader() {
  return (
    <header
      style={{
        flexShrink: 0,
        position: 'relative',
        padding: '18px 20px 16px',
        background: 'var(--pt-elevation-1-hex, #e7e5e4)', // darker than drawer body per directive #5
        borderBottom: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
      }}
    >
      {/* Section-flavor accent line (directive #5 option b — Courses=brand terracotta) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'var(--pt-flavor-courses-hex, #B96A5F)',
        }}
      />

      {/* Breadcrumb trail */}
      <nav
        aria-label="Drawer breadcrumb"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: '"Outfit", sans-serif',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.04em',
          color: 'var(--pt-text-muted-hex, #57534e)',
          marginBottom: 8,
        }}
      >
        <Home size={12} strokeWidth={1.75} />
        <span style={{ opacity: 0.8 }}>Home</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span style={{ opacity: 0.8 }}>Healing Hearts</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span
          style={{
            color: 'var(--pt-text-primary-hex, #1c1917)',
            fontWeight: 600,
          }}
        >
          Module 2
        </span>
      </nav>

      <h2
        style={{
          fontFamily: '"Outfit", sans-serif',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--pt-text-muted-hex, #57534e)',
          margin: 0,
        }}
      >
        Course Outline
      </h2>
    </header>
  );
}

/* ── Drawer lesson item (within expanded module) ─────────────────── */
function DrawerLessonItem({ lesson }) {
  const isComplete = lesson.state === 'Complete';
  const isActive = lesson.state === 'Active';
  const isUpcoming = lesson.state === 'Upcoming';

  return (
    <div
      role="button"
      aria-current={isActive ? 'page' : undefined}
      style={{
        display: 'grid',
        gridTemplateColumns: '24px 1fr',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        margin: '0 4px',
        borderRadius: 8,
        // Drawer-active-bg darkening per directive #2 (Slack-depth)
        background: isActive
          ? 'var(--pt-drawer-active-bg-hex, #fafaf9)'
          : 'transparent',
        cursor: isUpcoming ? 'default' : 'pointer',
        transition: 'background 120ms',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isActive
            ? 'var(--pt-primary-accent-hex, #B96A5F)'
            : isComplete
            ? 'var(--pt-text-muted-hex, #57534e)'
            : 'rgba(87, 83, 78, 0.4)',
        }}
      >
        {isComplete ? (
          <Check size={13} strokeWidth={2.25} />
        ) : isActive ? (
          <PlayCircle size={13} strokeWidth={1.75} fill="currentColor" />
        ) : (
          <Circle size={10} strokeWidth={1.5} />
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            fontSize: 13,
            fontWeight: isActive ? 600 : 500,
            color: isUpcoming
              ? 'rgba(28, 25, 23, 0.5)'
              : isActive
              ? 'var(--pt-text-primary-hex, #1c1917)'
              : 'var(--pt-text-primary-hex, #1c1917)',
            margin: 0,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              fontFamily: '"Outfit", sans-serif',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              opacity: 0.55,
              marginRight: 6,
            }}
          >
            {lesson.num}
          </span>
          {lesson.title}
        </p>
      </div>
    </div>
  );
}

/* ── Drawer module row ────────────────────────────────────────────── */
function DrawerModuleRow({ mod }) {
  const hasLessons = !!mod.lessons;
  return (
    <div>
      <div
        role="button"
        aria-expanded={mod.expanded}
        style={{
          display: 'grid',
          gridTemplateColumns: '16px 24px 1fr auto',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          margin: '0 4px',
          borderRadius: 8,
          background: mod.current
            ? 'var(--pt-drawer-hover-hex, #a8a29e)'
            : 'transparent',
          cursor: 'pointer',
          transition: 'background 120ms',
        }}
      >
        <div
          style={{
            color: 'var(--pt-text-muted-hex, #57534e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {mod.expanded ? (
            <ChevronDown size={12} strokeWidth={2} />
          ) : (
            <ChevronRight size={12} strokeWidth={2} />
          )}
        </div>
        <div
          style={{
            fontFamily: '"Outfit", sans-serif',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: mod.complete
              ? 'var(--pt-text-muted-hex, #57534e)'
              : mod.current
              ? 'var(--pt-primary-accent-hex, #B96A5F)'
              : 'var(--pt-text-primary-hex, #1c1917)',
          }}
        >
          {mod.complete ? <Check size={13} strokeWidth={2.25} /> : mod.number}
        </div>
        <div
          style={{
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            fontSize: 13,
            fontWeight: mod.current ? 700 : 500,
            color: 'var(--pt-text-primary-hex, #1c1917)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.3,
          }}
        >
          {mod.title}
        </div>
        <span
          style={{
            fontFamily: '"Outfit", sans-serif',
            fontSize: 10,
            color: 'var(--pt-text-muted-hex, #57534e)',
            opacity: 0.7,
          }}
        >
          {mod.lessonCount}
        </span>
      </div>

      {hasLessons && mod.expanded && (
        <div style={{ margin: '4px 0 10px 28px', paddingLeft: 4 }}>
          {mod.lessons.map((lesson) => (
            <DrawerLessonItem key={lesson.num} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Drawer ─────────────────────────────────────────────────────── */
function Drawer() {
  return (
    <aside
      aria-label="Course outline drawer"
      style={{
        position: 'fixed',
        left: 72,
        top: 0,
        bottom: 0,
        width: 300,
        zIndex: 40,
        background: 'var(--pt-drawer-hex, #d6d3d1)',
        borderRight: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <DrawerHeader />

      <div style={{ flex: 1, overflow: 'auto', padding: '10px 0' }}>
        {MOCK_COURSE_OUTLINE.map((mod) => (
          <DrawerModuleRow key={mod.id} mod={mod} />
        ))}
      </div>

      <footer
        style={{
          flexShrink: 0,
          padding: '14px 20px',
          borderTop: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
          background: 'var(--pt-drawer-hex, #d6d3d1)',
        }}
      >
        <p
          style={{
            fontFamily: '"Outfit", sans-serif',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--pt-text-muted-hex, #57534e)',
            margin: 0,
            marginBottom: 4,
          }}
        >
          Overall course
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 3,
              background: 'rgba(120, 113, 108, 0.25)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '14%',
                height: '100%',
                background: 'var(--pt-primary-accent-hex, #B96A5F)',
              }}
            />
          </div>
          <span
            style={{
              fontFamily: '"Outfit", sans-serif',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--pt-text-muted-hex, #57534e)',
            }}
          >
            14%
          </span>
        </div>
      </footer>
    </aside>
  );
}

/* ── Main content ──────────────────────────────────────────────── */
function LessonContent() {
  const l = MOCK_LESSON;

  return (
    <main
      style={{
        marginLeft: 372,
        minHeight: '100vh',
        background: 'var(--pt-content-bg-hex, #f5f5f4)',
        position: 'relative',
      }}
    >
      {/* Top breadcrumb bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 56px',
          borderBottom: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
          background: 'var(--pt-content-bg-hex, #f5f5f4)',
        }}
      >
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: '"Outfit", sans-serif',
            fontSize: 12,
            letterSpacing: '0.04em',
            color: 'var(--pt-text-muted-hex, #57534e)',
          }}
        >
          <span style={{ opacity: 0.7 }}>Module {l.moduleNumber}</span>
          <ChevronRight size={10} strokeWidth={2} style={{ opacity: 0.5 }} />
          <span
            style={{
              color: 'var(--pt-text-primary-hex, #1c1917)',
              fontWeight: 600,
            }}
          >
            {l.lessonTitle}
          </span>
        </nav>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: '"Outfit", sans-serif',
            fontSize: 12,
            color: 'var(--pt-text-muted-hex, #57534e)',
          }}
        >
          <Clock size={13} strokeWidth={1.75} />
          <span>{l.duration} min</span>
        </div>
      </header>

      {/* Lesson body */}
      <article
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '72px 40px 80px',
        }}
      >
        <p
          style={{
            fontFamily: '"Outfit", sans-serif',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--pt-primary-accent-hex, #B96A5F)',
            margin: 0,
            marginBottom: 20,
          }}
        >
          {l.eyebrow}
        </p>

        <h1
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 'clamp(40px, 4.2vw, 54px)',
            fontWeight: 400,
            fontStyle: 'italic',
            letterSpacing: '-0.015em',
            lineHeight: 1.08,
            color: 'var(--pt-text-primary-hex, #1c1917)',
            margin: 0,
            marginBottom: 36,
          }}
        >
          {l.lessonTitle}
        </h1>

        <div
          style={{
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            fontSize: 17,
            lineHeight: 1.75,
            color: 'var(--pt-text-primary-hex, #1c1917)',
          }}
        >
          <p style={{ margin: '0 0 24px' }}>{l.paragraph}</p>
          <p style={{ margin: 0, color: 'rgba(28, 25, 23, 0.82)' }}>{l.paragraph2}</p>
        </div>

        {/* My Notes block */}
        <aside
          style={{
            marginTop: 56,
            padding: '28px 32px',
            borderRadius: 16,
            background: 'var(--pt-elevation-1-hex, #e7e5e4)',
            border: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'var(--pt-elevation-2-hex, #ffffff)',
                color: 'var(--pt-primary-accent-hex, #B96A5F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <NotebookPen size={14} strokeWidth={1.75} />
            </div>
            <h3
              style={{
                fontFamily: '"Outfit", sans-serif',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--pt-text-muted-hex, #57534e)',
                margin: 0,
              }}
            >
              My Notes
            </h3>
          </div>
          <p
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontStyle: 'italic',
              fontSize: 17,
              lineHeight: 1.55,
              color: 'var(--pt-text-primary-hex, #1c1917)',
              margin: 0,
            }}
          >
            "{l.noteSnippet}"
          </p>
        </aside>

        {/* Action row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 56,
            paddingTop: 24,
            borderTop: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
          }}
        >
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              borderRadius: 999,
              background: 'transparent',
              border: '1px solid var(--pt-border-strong-hex, #78716c)',
              cursor: 'pointer',
              fontFamily: '"Outfit", sans-serif',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--pt-text-primary-hex, #1c1917)',
            }}
          >
            <ArrowLeft size={14} strokeWidth={1.75} />
            Previous
          </button>

          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 26px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              background: 'var(--pt-primary-accent-hex, #B96A5F)',
              color: '#fafaf9',
              fontFamily: '"Outfit", sans-serif',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              boxShadow: '0 10px 24px -10px rgba(185,106,95,0.55)',
            }}
          >
            Mark complete & next
            <ArrowRight size={14} strokeWidth={2} />
          </button>
        </div>
      </article>
    </main>
  );
}

/* ── Root: full-bleed fixed overlay that covers PortalLayout chrome ─── */
export default function LessonHero() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100, // above PortalLayout rail (z=40) + drawer (z=30)
        background: 'var(--pt-content-bg-hex, #f5f5f4)',
        overflow: 'auto',
      }}
    >
      <Rail />
      <Drawer />
      <LessonContent />
    </div>
  );
}
