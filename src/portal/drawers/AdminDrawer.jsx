/**
 * AdminDrawer — operational admin only (no content-authoring from drawer).
 *
 * Spec: decision-2.8-rev, §12.1 A-01 (role-gated sections, P0 security),
 *       §12.1 A-02 (inline-confirm for destructive actions, P0 security),
 *       decision-2.21 (simulate learner session), decision-3.11 (card-chrome retained),
 *       §4.6.G (inline-confirm motion — A-08)
 *
 * Role taxonomy (Chase 2026-04-23, 3-tier):
 *   admin      — all sections
 *   coach      — users, webinars, content
 *   sales-cs   — applications, crm, broadcasts
 *   (learners never reach this drawer — blocked by RequireAdmin route gate)
 *
 * Authoring-preview lives at /admin/authoring (decision-3.20, 2.20-rev).
 * DO NOT add author-controls here.
 */

import React, { useState } from 'react';
import { DrawerShell, DrawerSection } from './DrawerShell';
import { getTypeStyle } from '../design/typography';
import { useAuth } from '../../contexts/AuthContext';
import { hasAnyRole } from '../admin/roleSectionAccess';
import InlineConfirm from '../components/InlineConfirm';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Derive roles array from AuthContext values.
 * Supports future user.roles string[] field; falls back to legacy isAdmin boolean.
 */
function deriveRoles(isAdmin, profile) {
  // Future: if profile carries a roles array, prefer that.
  // For now: single role column in user_profiles table.
  const singleRole = profile?.role; // e.g. 'admin', 'coach', 'sales-cs', 'student'
  if (singleRole && singleRole !== 'student') {
    return [singleRole];
  }
  // Legacy isAdmin boolean adapter (§ role taxonomy note)
  if (isAdmin) {
    return ['admin'];
  }
  return [];
}

// ─── Sub-components ──────────────────────────────────────────────────────────

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

/**
 * DestructiveRow — renders a row button with an InlineConfirm gate.
 * Wires A-02 + §4.6.G motion end-to-end.
 *
 * @param {string}   label         — Row label, e.g. "Delete user"
 * @param {string}   confirmMsg    — Sentence shown in confirm panel
 * @param {Function} onConfirmed   — Called when user confirms
 */
function DestructiveRow({ icon = '⚠', label, confirmMsg, onConfirmed }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="px-1">
        <InlineConfirm
          message={confirmMsg}
          onConfirm={() => {
            setConfirming(false);
            onConfirmed?.();
          }}
          onCancel={() => setConfirming(false)}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left"
      style={{
        ...getTypeStyle('body'),
        color: 'var(--pt-text-primary-hex, #1c1917)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 150ms ease',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = 'var(--pt-drawer-hover-hex, #a8a29e)')
      }
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="flex-1">{label}</span>
    </button>
  );
}

// ─── Phedris tunnel gate (CHASE-GATE G3) ────────────────────────────────────

function PhedrisTunnelGate() {
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
        Phedris sessions appear here once the Cloudflare tunnel is active (G3).
      </p>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function AdminDrawer() {
  const { isAdmin, profile } = useAuth();

  // Build roles array for hasAnyRole checks (A-01: role-gated sections)
  const roles = deriveRoles(isAdmin, profile);
  const authUser = { roles };

  // Section visibility (A-01: unauthorized sections are DOM-absent, not CSS-hidden)
  const canUsers      = hasAnyRole(authUser, 'users');
  const canApplications = hasAnyRole(authUser, 'applications');
  const canCrm        = hasAnyRole(authUser, 'crm');
  const canWebinars   = hasAnyRole(authUser, 'webinars');
  const canBroadcasts = hasAnyRole(authUser, 'broadcasts');
  const canEnrollments = hasAnyRole(authUser, 'enrollments');
  const canContent    = hasAnyRole(authUser, 'content');
  const canAnalytics  = hasAnyRole(authUser, 'analytics');
  const canSettings   = hasAnyRole(authUser, 'settings');

  return (
    <DrawerShell title="Admin" ariaContext="Admin">
      {/* Card-chrome retained per decision-3.11: Admin utility-ethic carve-out.
          Admin surfaces use card-chrome deliberately (coach managing 30 learners
          needs scan-density). Learner sanctuary surfaces do NOT use card-chrome.
          This is a deliberate register split, not inconsistency. */}
      <div className="px-3 pb-2">
        <span
          style={{
            ...getTypeStyle('meta', 'medium'),
            color: 'var(--pt-text-muted-hex, #57534e)',
          }}
        >
          Operational Admin
        </span>
      </div>

      {/* ── Analytics section (admin only) ────────────────────────────────── */}
      {canAnalytics && (
        <DrawerSection label="Overview">
          <AdminNavLink icon="📊" label="Dashboard" href="/admin" />
          <AdminNavLink icon="✅" label="Tasks" href="/admin/tasks" />
        </DrawerSection>
      )}

      {/* ── Users section (admin + coach) ─────────────────────────────────── */}
      {canUsers && (
        <DrawerSection label="Users">
          <AdminNavLink icon="👥" label="User list" href="/admin/users" />

          {/* 2.21: "Simulate learner session" — admin + coach.
              No real simulate logic yet (backend-dependent).
              Per-learner row: operational admin, distinct from authoring-preview (2.20-rev). */}
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left"
            style={{
              ...getTypeStyle('body'),
              color: 'var(--pt-text-primary-hex, #1c1917)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 150ms ease',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--pt-drawer-hover-hex, #a8a29e)')
            }
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            onClick={() => {
              // TODO Wave 6D backend-data: wire real simulate-learner session.
              // Will impersonate a specific learner's portal view for support/QA.
              // Requires per-learner selector (e.g. user picker modal) + session token.
              window.console.log('[AdminDrawer] Simulate learner session — stub (Wave 6D)');
            }}
          >
            <span aria-hidden="true">🎭</span>
            <span className="flex-1">Simulate learner session</span>
          </button>

          {/* A-02: Delete user — destructive action gated by InlineConfirm (§4.6.G motion) */}
          <DestructiveRow
            icon="🗑"
            label="Delete user…"
            confirmMsg="Confirm delete? This permanently removes the user and all their data."
            onConfirmed={() => {
              // TODO Wave 6D backend-data: call user-delete API endpoint.
              // Requires selected user context (user picker not yet implemented).
              window.console.log('[AdminDrawer] Delete user confirmed — stub (Wave 6D)');
            }}
          />
        </DrawerSection>
      )}

      {/* ── Applications section (admin + sales-cs) ──────────────────────── */}
      {canApplications && (
        <DrawerSection label="Applications">
          <AdminNavLink icon="📋" label="Applications" href="/admin/crm" />

          {/* A-02: Revoke access — destructive action (TODO: data layer pending) */}
          <DestructiveRow
            icon="🔒"
            label="Revoke access…"
            confirmMsg="Confirm revoke? The learner will lose access to their enrolled content."
            onConfirmed={() => {
              // TODO Wave 6D backend-data: call revoke-access API endpoint.
              window.console.log('[AdminDrawer] Revoke access confirmed — stub (Wave 6D)');
            }}
          />
        </DrawerSection>
      )}

      {/* ── CRM section (admin + sales-cs) ────────────────────────────────── */}
      {canCrm && (
        <DrawerSection label="CRM">
          <AdminNavLink icon="🤝" label="CRM" href="/admin/crm" />
        </DrawerSection>
      )}

      {/* ── Enrollments section (admin only) ──────────────────────────────── */}
      {canEnrollments && (
        <DrawerSection label="Enrollments">
          <AdminNavLink icon="🎓" label="Enrollments" href="/admin/enrollments" />

          {/* A-02: Revoke enrollment — destructive action (TODO: data layer pending) */}
          <DestructiveRow
            icon="🗑"
            label="Revoke enrollment…"
            confirmMsg="Confirm revoke enrollment? The learner will lose access to this course."
            onConfirmed={() => {
              // TODO Wave 6D backend-data: call revoke-enrollment API endpoint.
              window.console.log('[AdminDrawer] Revoke enrollment confirmed — stub (Wave 6D)');
            }}
          />
        </DrawerSection>
      )}

      {/* ── Webinars section (admin + coach) ──────────────────────────────── */}
      {canWebinars && (
        <DrawerSection label="Webinars">
          <AdminNavLink icon="📹" label="Webinars" href="/admin/webinars" />
        </DrawerSection>
      )}

      {/* ── Broadcasts section (admin + sales-cs) ─────────────────────────── */}
      {canBroadcasts && (
        <DrawerSection label="Broadcasts">
          <AdminNavLink icon="📢" label="Broadcasts" href="/admin/broadcasts" />
        </DrawerSection>
      )}

      {/* ── Content section (admin + coach) ───────────────────────────────── */}
      {canContent && (
        <DrawerSection label="Content">
          {/* Note: authoring lives at /admin/authoring (2.8-rev / 3.20).
              Only a link here — no author-controls in drawer per 2.8-rev. */}
          <AdminNavLink icon="✏️" label="Authoring" href="/admin/authoring" />
          <AdminNavLink icon="📚" label="Modules" href="/admin/content" />
        </DrawerSection>
      )}

      {/* ── Settings section (admin only) ─────────────────────────────────── */}
      {canSettings && (
        <DrawerSection label="Settings" defaultOpen={false}>
          <AdminNavLink icon="⚙️" label="Settings" href="/admin/settings" />
          {/* CHASE-GATE G3: Phedris tunnel */}
          <PhedrisTunnelGate />
        </DrawerSection>
      )}
    </DrawerShell>
  );
}
