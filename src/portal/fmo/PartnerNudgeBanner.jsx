/**
 * PartnerNudgeBanner — FMO Component 10 (AP-10).
 *
 * Spec: pr-plan.md §PR 3 + component-list.md C10.
 *
 * Behavior (single-session ephemeral nudge):
 *   - Reads partner.last_activity_at via fmo.getPartnerProfile.
 *   - Renders one-line invitation banner if partner has recent activity.
 *   - Auto-dismisses after 8s OR user dismiss click.
 *   - NOT persistent — does not re-render on subsequent mount within session.
 *
 * Couples-care invariants (CRITICAL):
 *   - One line only; invitation framing ("Ready to catch up?"); NEVER "you're behind."
 *   - NO score, NO percentage, NO comparison column.
 *   - Display name resolved dynamically — never hardcoded.
 *   - Non-persistent across remount (sessionStorage dismissed-flag).
 */

import React, { useEffect, useRef, useState } from 'react';
import { getPartnerProfile } from '../../lib/fmo';
import { getTypeStyle } from '../design/typography';

const AUTO_DISMISS_MS = 8000;
// Recency window: partner is considered "recently active" if last_activity_at
// falls within the past 24 hours. Outside that window we render nothing
// (avoids surfacing stale weeks-old activity as today's nudge).
const RECENCY_WINDOW_MS = 24 * 60 * 60 * 1000;
const SESSION_DISMISS_KEY_PREFIX = 'fmo-nudge-dismissed-';

export default function PartnerNudgeBanner({ coupleId, userId }) {
  // `partner` shape: { profile: { display_name, last_activity_at, ... }, isRecent: bool }
  // We capture isRecent at fetch time (not during render) to keep the render
  // path pure — Date.now() is impure and the react-hooks purity rule rejects
  // it inside useMemo. Recency is a snapshot judgement at fetch time, which
  // matches the session-open / once-per-mount semantics of this banner.
  const [partner, setPartner] = useState(null);
  const [isRecent, setIsRecent] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    // Read session-scope dismiss flag on init so a dismissed banner doesn't
    // flash on remount within the same browsing session.
    if (typeof window === 'undefined') return false;
    if (!coupleId) return false;
    try {
      return window.sessionStorage.getItem(SESSION_DISMISS_KEY_PREFIX + coupleId) === '1';
    } catch {
      return false;
    }
  });
  const timerRef = useRef(null);

  // Fetch partner profile once + compute recency snapshot.
  useEffect(() => {
    let cancelled = false;
    if (!coupleId || !userId) return;
    getPartnerProfile(coupleId, userId)
      .then((p) => {
        if (cancelled) return;
        setPartner(p);
        if (p?.last_activity_at) {
          const ts = new Date(p.last_activity_at).getTime();
          if (!Number.isNaN(ts)) {
            setIsRecent(Date.now() - ts <= RECENCY_WINDOW_MS);
          }
        }
      })
      .catch(() => {
        // Silent fail — non-essential UX.
      });
    return () => {
      cancelled = true;
    };
  }, [coupleId, userId]);

  // Auto-dismiss after 8s.
  useEffect(() => {
    if (dismissed || !isRecent) return;
    timerRef.current = setTimeout(() => {
      setDismissed(true);
      // Persist dismiss so remount-in-session doesn't re-render the banner.
      try {
        window.sessionStorage.setItem(SESSION_DISMISS_KEY_PREFIX + coupleId, '1');
      } catch {
        // sessionStorage unavailable (privacy mode) — soft-degrade.
      }
    }, AUTO_DISMISS_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dismissed, isRecent, coupleId]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(SESSION_DISMISS_KEY_PREFIX + coupleId, '1');
    } catch {
      // Soft-degrade.
    }
  };

  // Render null when: no couple, no partner data, no recent activity, or dismissed.
  if (!coupleId) return null;
  if (dismissed) return null;
  if (!partner || !isRecent) return null;

  const displayName = partner.display_name || 'Your partner';

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 16px',
        borderRadius: 12,
        backgroundColor: 'var(--pt-elevation-2)',
        border: '1px solid var(--pt-border-subtle)',
        ...getTypeStyle('caption'),
        color: 'var(--pt-text-primary)',
      }}
    >
      <span style={{ flex: 1 }}>
        {displayName} was here recently. Ready to catch up?
      </span>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--pt-text-muted)',
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
          padding: 4,
        }}
      >
        ×
      </button>
    </div>
  );
}
