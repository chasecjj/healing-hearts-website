import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveLessonNotes, getLessonNotes } from '../lib/courses';

/**
 * Hook for per-lesson notes with autosave.
 * Debounces saves at 1500ms. Cancels pending saves on unmount.
 * Local state is the source of truth — no optimistic revert needed.
 */
export function useLessonNotes(lessonId) {
  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  // Load existing notes on mount or lessonId change
  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    async function load() {
      if (!user || !lessonId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const existingNotes = await getLessonNotes(user.id, lessonId);
        if (!cancelled) {
          setNotes(existingNotes);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load lesson notes:', err);
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, lessonId]);

  // Debounced save function
  const debouncedSave = useCallback(
    (newNotes) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(async () => {
        if (!user || !lessonId || !mountedRef.current) return;

        setSaving(true);
        setError(null);
        try {
          await saveLessonNotes(user.id, lessonId, newNotes);
          if (mountedRef.current) {
            setLastSaved(new Date());
            setSaving(false);
          }
        } catch (err) {
          console.error('Failed to save lesson notes:', err);
          if (mountedRef.current) {
            setError('Save failed');
            setSaving(false);
          }
        }
      }, 1500);
    },
    [user, lessonId]
  );

  // Wrapped setter that triggers autosave
  const updateNotes = useCallback(
    (newNotes) => {
      setNotes(newNotes);
      debouncedSave(newNotes);
    },
    [debouncedSave]
  );

  return {
    notes,
    setNotes: updateNotes,
    saving,
    lastSaved,
    error,
    loading,
  };
}
