import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getJournalEntries,
  saveJournalEntry,
  updateJournalEntry,
} from '../lib/journal';

/**
 * Hook for journal entries scoped to a lesson or module.
 * Matches useCourseData pattern: internal useAuth(), error state, hasFetched guard.
 */
export function useJournal({ lessonId, moduleId } = {}) {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  const loadEntries = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getJournalEntries(user.id, { lessonId, moduleId });
      setEntries(data);
    } catch (err) {
      console.error('Failed to load journal entries:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, lessonId, moduleId]);

  // Reset fetch guard when scope changes (lesson/module navigation)
  useEffect(() => {
    hasFetched.current = false;
  }, [lessonId, moduleId]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadEntries();
  }, [loadEntries]);

  const saveEntry = useCallback(
    async ({ promptText, entryText, mood }) => {
      if (!user) return;
      setError(null);

      try {
        const saved = await saveJournalEntry(user.id, {
          lessonId,
          moduleId,
          promptText,
          entryText,
          mood,
        });
        setEntries((prev) => [saved, ...prev]);
        return saved;
      } catch (err) {
        console.error('Failed to save journal entry:', err);
        setError(err.message);
        return null;
      }
    },
    [user, lessonId, moduleId]
  );

  const editEntry = useCallback(
    async (entryId, { entryText, mood }) => {
      setError(null);
      const previousEntries = [...entries];

      // Optimistic update
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId ? { ...e, entry_text: entryText, mood } : e
        )
      );

      try {
        const updated = await updateJournalEntry(entryId, { entryText, mood });
        setEntries((prev) =>
          prev.map((e) => (e.id === entryId ? updated : e))
        );
        return updated;
      } catch (err) {
        console.error('Failed to update journal entry, reverting:', err);
        setEntries(previousEntries);
        setError(err.message);
        return null;
      }
    },
    [entries]
  );

  return {
    entries,
    loading,
    error,
    saveEntry,
    editEntry,
    refetch: loadEntries,
  };
}
