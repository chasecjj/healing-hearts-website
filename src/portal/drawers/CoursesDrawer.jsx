/**
 * CoursesDrawer — owned courses + Continue where you left off
 *
 * Spec: wave3-drawer-content-specs §3
 * Data dependencies: course_enrollments, lesson_progress, courses, modules, lessons
 *
 * For R2 this renders as a light stub. Real data-wiring is a follow-up slice.
 */

import React from 'react';
import { DrawerShell, DrawerSection, EmptyState } from './DrawerShell';
import { getTypeStyle } from '../design/typography';

function ContinueCard({ courseTitle, lessonTitle, progressPercent = 0, href = '/portal' }) {
  return (
    <a
      href={href}
      className="block px-3 py-3 rounded-xl"
      style={{
        ...getTypeStyle('body'),
        backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)',
        color: 'var(--pt-text-primary-hex, #1c1917)',
        textDecoration: 'none',
      }}
    >
      <div style={{ ...getTypeStyle('meta'), color: 'var(--pt-text-muted-hex, #57534e)' }}>
        {courseTitle}
      </div>
      <div style={{ ...getTypeStyle('body', 'medium'), margin: '2px 0 6px' }}>
        {lessonTitle}
      </div>
      <div
        aria-hidden="true"
        style={{
          height: 4,
          borderRadius: 2,
          backgroundColor: 'var(--pt-border-subtle-hex, #d6d3d1)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.max(0, Math.min(100, progressPercent))}%`,
            backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)',
          }}
        />
      </div>
    </a>
  );
}

export default function CoursesDrawer() {
  // Stub data — real wiring deferred to post-R2 slice
  const hasContinue = false;
  const enrolled = [];

  return (
    <DrawerShell title="My Courses" ariaContext="Courses">
      <DrawerSection label="Continue Where You Left Off">
        {hasContinue ? (
          <ContinueCard
            courseTitle="Healing Hearts Foundations"
            lessonTitle="Module 2 · Lesson 4"
            progressPercent={42}
            href="/portal/courses"
          />
        ) : (
          <EmptyState
            icon="▶"
            message="Nothing in progress yet"
            sub="[Trisha-voice placeholder: Every couple's path starts with a single lesson.]"
          />
        )}
      </DrawerSection>

      <DrawerSection label="Your Courses">
        {enrolled.length === 0 ? (
          <EmptyState
            icon="📚"
            message="No courses yet"
            sub="[Trisha-voice placeholder: Your journey is waiting.]"
          />
        ) : (
          <ul className="flex flex-col gap-1">
            {enrolled.map((c) => (
              <li key={c.id}>{c.title}</li>
            ))}
          </ul>
        )}
      </DrawerSection>
    </DrawerShell>
  );
}
