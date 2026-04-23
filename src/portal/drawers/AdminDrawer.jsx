/**
 * AdminDrawer — Dashboard/CRM/Tasks + Phedris Sessions (tunnel-gated) + User Support
 *
 * Spec: wave3-drawer-content-specs §7
 * Data dependencies:
 *   - Dashboard/CRM/Tasks: existing admin routes
 *   - Phedris Sessions: CHASE-GATE G3 (Cloudflare tunnel pending)
 *   - User Support: CHASE-GATE OQ8 (scope pending)
 */

import React from 'react';
import { DrawerShell, DrawerSection } from './DrawerShell';
import { getTypeStyle } from '../design/typography';

function AdminNavLink({ icon, label, href, badge }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded-lg"
      style={{
        ...getTypeStyle('body'),
        color: 'var(--pt-text-primary-hex, #1c1917)',
        textDecoration: 'none',
        transition: 'background-color 150ms ease',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = 'var(--pt-drawer-hover-hex, #a8a29e)')
      }
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="flex-1">{label}</span>
      {typeof badge === 'number' && badge > 0 && (
        <span
          style={{
            ...getTypeStyle('meta'),
            backgroundColor: 'rgba(185, 106, 95, 0.16)',
            color: 'var(--pt-primary-accent-hex, #B96A5F)',
            padding: '1px 6px',
            borderRadius: 9999,
          }}
        >
          {badge}
        </span>
      )}
    </a>
  );
}

function PhedrisTunnelGate() {
  // CHASE-GATE G3: Cloudflare tunnel not yet active.
  return (
    <div
      className="px-3 py-3 rounded-xl mx-1"
      style={{
        backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)',
        border: '1px solid rgba(180, 83, 9, 0.25)',
      }}
    >
      <p style={{ ...getTypeStyle('body', 'medium'), margin: 0 }}>⚠ Tunnel pending</p>
      <p
        style={{
          ...getTypeStyle('caption'),
          color: 'var(--pt-text-muted-hex, #57534e)',
          marginTop: 4,
        }}
      >
        Phedris sessions will appear here once the Cloudflare tunnel is active (G3).
      </p>
    </div>
  );
}

function UserSupportStub() {
  // CHASE-GATE OQ8: scope pending.
  return (
    <div
      className="px-3 py-2 mx-1 rounded-lg"
      style={{
        ...getTypeStyle('caption'),
        color: 'var(--pt-text-muted-hex, #57534e)',
      }}
    >
      Password reset · Grant access · Comp access (scope OQ8)
    </div>
  );
}

export default function AdminDrawer() {
  return (
    <DrawerShell title="Admin" ariaContext="Admin">
      <div className="px-3 pb-2">
        <span
          style={{
            ...getTypeStyle('meta', 'medium'),
            color: 'var(--pt-text-muted-hex, #57534e)',
          }}
        >
          Staff Only
        </span>
      </div>

      <DrawerSection label="Tools">
        <AdminNavLink icon="📊" label="Dashboard" href="/admin" />
        <AdminNavLink icon="👥" label="CRM" href="/admin/crm" />
        <AdminNavLink icon="✅" label="Tasks" href="/admin/tasks" />
      </DrawerSection>

      <DrawerSection label="Phedris Sessions">
        <PhedrisTunnelGate />
      </DrawerSection>

      <DrawerSection label="User Support" defaultOpen={false}>
        <UserSupportStub />
      </DrawerSection>
    </DrawerShell>
  );
}
