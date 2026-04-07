import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getVideoPosition, saveVideoPosition } from '../lib/courses';

/**
 * useVideoProgress — manages video playback position persistence.
 * Reads last_position_seconds on mount, debounces saves at 5s.
 * MuxVideoPlayer fires onPositionUpdate every ~15s, so net save is at most every 15s.
 * Flushes pending save on unmount so position is never silently lost.
 */
export function useVideoProgress(lessonId) {
  const { user } = useAuth();
  const [startPosition, setStartPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const saveTimerRef = useRef(null);
  const mountedRef = useRef(true);
  const lastSavedRef = useRef(0);
  const pendingPositionRef = useRef(null);
  const userIdRef = useRef(user?.id);
  const lessonIdRef = useRef(lessonId);

  // Keep refs in sync for unmount flush
  useEffect(() => {
    userIdRef.current = user?.id;
    lessonIdRef.current = lessonId;
  }, [user?.id, lessonId]);

  // Fetch saved position on mount
  useEffect(() => {
    mountedRef.current = true;
    if (!user?.id || !lessonId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const position = await getVideoPosition(user.id, lessonId);
        if (!cancelled) {
          setStartPosition(position);
          lastSavedRef.current = position;
        }
      } catch (err) {
        console.error('Failed to load video position:', err);
        if (!cancelled) setError('Failed to load video position');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      // Flush pending position on unmount (fire-and-forget)
      if (
        pendingPositionRef.current !== null &&
        pendingPositionRef.current !== lastSavedRef.current &&
        userIdRef.current &&
        lessonIdRef.current
      ) {
        saveVideoPosition(userIdRef.current, lessonIdRef.current, pendingPositionRef.current).catch(() => {});
      }
    };
  }, [user?.id, lessonId]);

  // Debounced save (5s)
  const savePosition = useCallback(
    (seconds) => {
      if (!user?.id || !lessonId) return;
      const rounded = Math.floor(seconds);
      if (rounded === lastSavedRef.current) return;

      pendingPositionRef.current = rounded;

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          await saveVideoPosition(user.id, lessonId, rounded);
          lastSavedRef.current = rounded;
          pendingPositionRef.current = null;
        } catch (err) {
          console.error('Failed to save video position:', err);
        }
      }, 5000);
    },
    [user?.id, lessonId]
  );

  return { startPosition, savePosition, loading, error };
}
