/**
 * HomeDrawer — welcome + today's focus + Trisha framework router + recent activity
 *
 * Spec: wave3-drawer-content-specs §2
 * Data dependencies: activity_feed (stub), daily_intentions (existing), auth.users
 *
 * Trisha-voice content marked [Trisha-voice placeholder: ...] per brief.
 * No shimmer, no bounce easing (D10).
 */

import React from 'react';
import { DrawerShell, DrawerSection, EmptyState } from './DrawerShell';
import { getTypeStyle } from '../design/typography';
import { useAuth } from '../../contexts/AuthContext';

const FEELING_PILLS = [
  { id: 'flooded', label: 'Flooded' },
  { id: 'disconnected', label: 'Disconnected' },
  { id: 'hurt', label: 'Hurt' },
  { id: 'shutdown', label: 'Shut Down' },
  { id: 'reactive', label: 'Reactive' },
];

function TrishaFrameworkRouter() {
  return (
    <div className="flex flex-wrap gap-2 px-3 py-1">
      {FEELING_PILLS.map((f) => (
        <a
          key={f.id}
          href="/portal/rescue-kit"
          style={{
            ...getTypeStyle('caption', 'medium'),
            padding: '6px 12px',
            borderRadius: 8,
            backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)',
            color: 'var(--pt-text-primary-hex, #1c1917)',
            textDecoration: 'none',
            transition: 'border-radius 150ms cubic-bezier(0.19,1,0.22,1)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderRadius = '12px')}
          onMouseLeave={(e) => (e.currentTarget.style.borderRadius = '8px')}
        >
          {f.label}
        </a>
      ))}
    </div>
  );
}

function ActivityFeed({ items = [] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon="🏠"
        message="You made it here."
        sub="[Trisha-voice placeholder: This is your space. Take a breath — your first lesson is waiting.]"
      />
    );
  }
  return (
    <ul className="flex flex-col gap-1 px-2">
      {items.slice(0, 3).map((item) => (
        <li
          key={item.id}
          style={{
            ...getTypeStyle('caption'),
            padding: '6px 10px',
            borderRadius: 8,
          }}
        >
          <span aria-hidden="true" style={{ marginRight: 6 }}>{item.icon || '📚'}</span>
          <span>{item.label}</span>
          <span
            style={{
              marginLeft: 8,
              color: 'var(--pt-text-muted-hex, #57534e)',
              ...getTypeStyle('meta'),
            }}
          >
            {item.timestamp}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function HomeDrawer() {
  const { user, profile } = useAuth();
  const firstName =
    profile?.display_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'friend';

  return (
    <DrawerShell title="Home" ariaContext="Home">
      <div className="px-3 pb-3">
        <p style={{ ...getTypeStyle('heading-2'), margin: 0 }}>
          Welcome back, {firstName}
        </p>
        <p
          style={{
            ...getTypeStyle('caption'),
            color: 'var(--pt-text-muted-hex, #57534e)',
            marginTop: 4,
          }}
        >
          [Trisha-voice placeholder: Today is a good day to reconnect.]
        </p>
      </div>

      <DrawerSection label="Today's Focus">
        <div
          className="px-3 py-2"
          style={{ ...getTypeStyle('caption'), color: 'var(--pt-text-muted-hex, #57534e)' }}
        >
          [Trisha-voice placeholder: A small repair today is worth more than a
          grand gesture tomorrow.]
        </div>
      </DrawerSection>

      <DrawerSection label="How are you feeling?">
        <TrishaFrameworkRouter />
      </DrawerSection>

      <DrawerSection label="Recent Activity">
        <ActivityFeed items={[]} />
      </DrawerSection>
    </DrawerShell>
  );
}
