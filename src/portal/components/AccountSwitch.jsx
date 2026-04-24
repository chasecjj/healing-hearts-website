/**
 * AccountSwitch — avatar + "Not you? Switch account" affordance.
 *
 * Spec: consolidated-spec-v1.1.md §2.23, §12.1 A-03 (P0 safety)
 *
 * Placement: top-right of Sanctuary tab in HomeDrawer.
 * Activation: signOut() → clearAllRailState() → navigate /login.
 * No silent session swap. Shared-device privacy for trauma population.
 *
 * Design constraints (tokens.js):
 *   - Avatar ≤32px per spec canvas-cohesion note
 *   - "Not you?" text link: terracotta (#B96A5F) — primary-accent token
 *   - Non-competing with DailyIntentionWidget (top-right float)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { clearAllRailState } from '../lib/railStateReset';
import { getTypeStyle } from '../design/typography';

export default function AccountSwitch() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const displayName =
    profile?.display_name ||
    user?.email?.split('@')[0] ||
    '?';
  const initials = displayName.slice(0, 2).toUpperCase();

  async function handleSwitch() {
    if (busy) return;
    setBusy(true);
    try {
      // 1. Sign out via AuthContext (no silent session swap per A-03)
      await signOut();
      // 2. Wipe all 6 rail-slot localStorage state (scroll, tab, sub-state)
      clearAllRailState();
      // 3. Redirect to login — new session must authenticate fresh
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('[AccountSwitch] signOut failed:', err);
      setBusy(false);
    }
  }

  return (
    <div
      className="flex items-center gap-2 flex-shrink-0"
      aria-label={`Signed in as ${displayName}. Switch account available.`}
    >
      {/* Avatar — ≤32px per spec canvas-cohesion note */}
      <div
        aria-hidden="true"
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)',
          color: 'var(--pt-text-inverse-hex, #fafaf9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          ...getTypeStyle('meta', 'semibold'),
          fontSize: 11,
          letterSpacing: '0.02em',
          userSelect: 'none',
        }}
      >
        {initials}
      </div>

      {/* Switch link */}
      <button
        onClick={handleSwitch}
        disabled={busy}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: busy ? 'not-allowed' : 'pointer',
          ...getTypeStyle('meta'),
          color: busy
            ? 'var(--pt-text-muted-hex, #57534e)'
            : 'var(--pt-primary-accent-hex, #B96A5F)',
          textDecoration: 'underline',
          textUnderlineOffset: 2,
          whiteSpace: 'nowrap',
          opacity: busy ? 0.6 : 1,
          transition: 'color 150ms ease, opacity 150ms ease',
        }}
        aria-label="Not you? Switch account — signs out and redirects to login"
      >
        {busy ? 'Signing out…' : 'Not you? Switch account'}
      </button>
    </div>
  );
}
