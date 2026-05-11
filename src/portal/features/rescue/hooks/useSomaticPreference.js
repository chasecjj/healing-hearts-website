/**
 * useSomaticPreference — localStorage reader/writer for the 5 Rescue keys.
 *
 * Spec: portal-rescue-kit-v1 wave-3.1-coordinator-spec §7 (persistence keys),
 *       §6 (sensory-reduce hard override — synchronous mount read + cross-tab).
 *
 * Keys (verbatim per spec):
 *   - hh-sensory-reduce               (device-level; cross-tab via storage event)
 *   - rescue-audio-enabled-{userId}   (per-user; G1 opt-in)
 *   - rescue-haptic-enabled-{userId}  (per-user; G1 opt-in)
 *   - rescue-audio-volume-{userId}    (per-user; G2; float 0.0..0.5)
 *   - rescue-haptic-pattern-{userId}  (per-user; G2; 'gentle' | 'presence')
 *
 * The hook EXPOSES synchronous module-level getters for use BEFORE useEffect
 * runs at coordinator mount (G9 requires sensory-reduce to be read
 * synchronously on mount so opt-in UI never flashes).
 *
 * No render. No event emit. Pure storage I/O.
 */

import { useCallback, useEffect, useState } from 'react';

// ── Key constants ─────────────────────────────────────────────────────────

const KEY_SENSORY_REDUCE = 'hh-sensory-reduce';
const KEY_AUDIO_ENABLED = (userId) => `rescue-audio-enabled-${userId}`;
const KEY_HAPTIC_ENABLED = (userId) => `rescue-haptic-enabled-${userId}`;
const KEY_AUDIO_VOLUME = (userId) => `rescue-audio-volume-${userId}`;
const KEY_HAPTIC_PATTERN = (userId) => `rescue-haptic-pattern-${userId}`;

// ── Defaults ──────────────────────────────────────────────────────────────

const DEFAULT_SENSORY_REDUCE = false;
const DEFAULT_AUDIO_ENABLED = false;
const DEFAULT_HAPTIC_ENABLED = false;
const DEFAULT_AUDIO_VOLUME = 0.25;
const DEFAULT_HAPTIC_PATTERN = 'gentle';
const AUDIO_VOLUME_CEILING = 0.5;
const VALID_HAPTIC_PATTERNS = ['gentle', 'presence'];

// ── Synchronous getters (safe at module/render top-level) ─────────────────

function safeGetItem(key) {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Quota / unavailable — silent
  }
}

/** Synchronous read for G9 mount gate. */
export function getSensoryReduce() {
  return safeGetItem(KEY_SENSORY_REDUCE) === 'true';
}

export function setSensoryReduceStorage(value) {
  safeSetItem(KEY_SENSORY_REDUCE, value ? 'true' : 'false');
}

function readBool(key, fallback) {
  const raw = safeGetItem(key);
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return fallback;
}

function readVolume(key) {
  const raw = safeGetItem(key);
  if (raw == null) return DEFAULT_AUDIO_VOLUME;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return DEFAULT_AUDIO_VOLUME;
  if (n < 0) return 0;
  if (n > AUDIO_VOLUME_CEILING) return AUDIO_VOLUME_CEILING;
  return n;
}

function readPattern(key) {
  const raw = safeGetItem(key);
  if (VALID_HAPTIC_PATTERNS.includes(raw)) return raw;
  return DEFAULT_HAPTIC_PATTERN;
}

// ── Hook ──────────────────────────────────────────────────────────────────

/**
 * useSomaticPreference(userId, { onSensoryReduceCrossTab })
 *
 * Synchronous mount read for all 5 keys. Subscribes to `storage` events for
 * the device-level `hh-sensory-reduce` key only (per spec §6.2).
 *
 * @param {string|null} userId — Supabase auth user id; null falls back to
 *   device-scoped keys (anomaly path per spec §7).
 * @param {{ onSensoryReduceCrossTab?: () => void }} [opts]
 */
export function useSomaticPreference(userId, opts = {}) {
  const { onSensoryReduceCrossTab } = opts;
  const scope = userId || 'anonymous';

  // Synchronous initial reads — must NOT defer to useEffect (G9)
  const [sensoryReduce, setSensoryReduceState] = useState(getSensoryReduce);
  const [hapticEnabled, setHapticEnabledState] = useState(() =>
    readBool(KEY_HAPTIC_ENABLED(scope), DEFAULT_HAPTIC_ENABLED)
  );
  const [audioEnabled, setAudioEnabledState] = useState(() =>
    readBool(KEY_AUDIO_ENABLED(scope), DEFAULT_AUDIO_ENABLED)
  );
  const [audioVolume, setAudioVolumeState] = useState(() =>
    readVolume(KEY_AUDIO_VOLUME(scope))
  );
  const [hapticPattern, setHapticPatternState] = useState(() =>
    readPattern(KEY_HAPTIC_PATTERN(scope))
  );

  // Setters that also persist
  const setHapticEnabled = useCallback(
    (value) => {
      const v = Boolean(value);
      setHapticEnabledState(v);
      safeSetItem(KEY_HAPTIC_ENABLED(scope), v ? 'true' : 'false');
    },
    [scope]
  );

  const setAudioEnabled = useCallback(
    (value) => {
      const v = Boolean(value);
      setAudioEnabledState(v);
      safeSetItem(KEY_AUDIO_ENABLED(scope), v ? 'true' : 'false');
    },
    [scope]
  );

  const setAudioVolume = useCallback(
    (value) => {
      let v = Number.parseFloat(value);
      if (!Number.isFinite(v)) v = DEFAULT_AUDIO_VOLUME;
      if (v < 0) v = 0;
      if (v > AUDIO_VOLUME_CEILING) v = AUDIO_VOLUME_CEILING;
      setAudioVolumeState(v);
      safeSetItem(KEY_AUDIO_VOLUME(scope), String(v));
    },
    [scope]
  );

  const setHapticPattern = useCallback(
    (value) => {
      const v = VALID_HAPTIC_PATTERNS.includes(value)
        ? value
        : DEFAULT_HAPTIC_PATTERN;
      setHapticPatternState(v);
      safeSetItem(KEY_HAPTIC_PATTERN(scope), v);
    },
    [scope]
  );

  const setSensoryReduce = useCallback((value) => {
    const v = Boolean(value);
    setSensoryReduceState(v);
    setSensoryReduceStorage(v);
  }, []);

  // Cross-tab storage listener (sensory-reduce only)
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handler = (e) => {
      if (e.key !== KEY_SENSORY_REDUCE) return;
      const next = e.newValue === 'true';
      setSensoryReduceState(next);
      if (next && typeof onSensoryReduceCrossTab === 'function') {
        onSensoryReduceCrossTab();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [onSensoryReduceCrossTab]);

  return {
    // state
    sensoryReduce,
    hapticEnabled,
    audioEnabled,
    audioVolume,
    hapticPattern,
    // setters
    setSensoryReduce,
    setHapticEnabled,
    setAudioEnabled,
    setAudioVolume,
    setHapticPattern,
  };
}

export const SOMATIC_PREFERENCE_KEYS = {
  SENSORY_REDUCE: KEY_SENSORY_REDUCE,
  audioEnabled: KEY_AUDIO_ENABLED,
  hapticEnabled: KEY_HAPTIC_ENABLED,
  audioVolume: KEY_AUDIO_VOLUME,
  hapticPattern: KEY_HAPTIC_PATTERN,
};

export const SOMATIC_PREFERENCE_DEFAULTS = {
  sensoryReduce: DEFAULT_SENSORY_REDUCE,
  audioEnabled: DEFAULT_AUDIO_ENABLED,
  hapticEnabled: DEFAULT_HAPTIC_ENABLED,
  audioVolume: DEFAULT_AUDIO_VOLUME,
  hapticPattern: DEFAULT_HAPTIC_PATTERN,
  audioVolumeCeiling: AUDIO_VOLUME_CEILING,
};
