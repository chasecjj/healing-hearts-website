/**
 * rescueTelemetry — lightweight signal emitter for the Rescue surface.
 *
 * Spec: portal-rescue-kit-v1 wave-3.1-coordinator-spec §8 (14 events).
 *
 * Transport is TBD (Wave 3.2 backend-data lane — Supabase direct vs IDB queue
 * + sync worker). For v1, the emitter is intentionally transport-agnostic:
 *
 *  - `emit(eventName, payload)` enqueues synchronously (no network in emit
 *    path; critical for crisis-path `stopAll()` latency budget G3/G8).
 *  - Each emit also dispatches a `rescue:telemetry` CustomEvent on `window`
 *    so future transport wiring (or test harnesses) can subscribe without
 *    importing this module.
 *  - In dev mode (Vite `import.meta.env.DEV`), each event is also logged to
 *    the console for orchestrator-visible feedback.
 *  - `flush(transport)` drains the in-memory queue through an async transport
 *    function. Called by the coordinator on session-end.
 *
 * No `dangerouslySetInnerHTML`. No third-party deps. Pure JS module.
 */

const VALID_EVENT_NAMES = [
  'session.start',
  'session.stopAll',
  'session.pause',
  'session.resume',
  'session.reaffirmPromptShown',
  'session.reaffirmContinue',
  'session.reaffirmEnd',
  'session.reaffirmTimeout',
  'sensoryReduce.activated',
  'haptic.optIn',
  'haptic.optOut',
  'audio.optIn',
  'audio.optOut',
  'crisis.linkActivated',
];

const _queue = [];

function isValidEventName(eventName) {
  return VALID_EVENT_NAMES.includes(eventName);
}

/**
 * emit(eventName, payload)
 *
 * Synchronous — does NOT block the crisis path. Enqueues the event and
 * dispatches a window CustomEvent. In dev, also logs to console.
 */
export function emit(eventName, payload = {}) {
  if (!isValidEventName(eventName)) {
    // Unknown event — log but do not throw (telemetry must never break UX)
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.warn('[rescueTelemetry] Unknown event name:', eventName);
    }
    return;
  }

  const event = { eventName, payload, ts: Date.now() };
  _queue.push(event);

  // Dev-only console logging for orchestrator visibility
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.log('[rescueTelemetry]', eventName, payload);
  }

  // Bridge to window so transport / tests / dashboards can subscribe
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('rescue:telemetry', { detail: event })
      );
    } catch {
      // CustomEvent unsupported (SSR / very old browser) — silent
    }
  }
}

/**
 * flush(transport) — drains the in-memory queue through a transport.
 *
 * @param {(events: Array) => Promise<void>} transport
 * @returns {Promise<void>}
 */
export async function flush(transport) {
  if (_queue.length === 0) return;
  const batch = _queue.splice(0, _queue.length);
  if (typeof transport === 'function') {
    try {
      await transport(batch);
    } catch (err) {
      // Transport failed — re-queue at the head so retry remains possible
      _queue.unshift(...batch);
      if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
        console.warn('[rescueTelemetry] flush failed:', err);
      }
    }
  }
}

/** Test helper: return a snapshot of the queued events (does not drain). */
export function _peekQueue() {
  return _queue.slice();
}

/** Test helper: drain the queue without sending. */
export function _drainQueue() {
  _queue.length = 0;
}

export const rescueTelemetry = {
  emit,
  flush,
  _peekQueue,
  _drainQueue,
};

export default rescueTelemetry;
