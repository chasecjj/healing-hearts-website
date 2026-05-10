/**
 * useJournal — journal_entries CRUD hook with optimistic UI.
 *
 * Wave 10 J1/J2/J3/J5. Mirrors the shape of useNotes.js but talks to
 * `journal_entries` (mig 014_interactive_portal.sql).
 *
 * Schema reminder (mig 014):
 *   journal_entries(id, user_id, lesson_id?, module_id?, prompt_text?,
 *                   entry_text NOT NULL, mood? CHECK in 10 values,
 *                   created_at, updated_at)
 *
 * Decisions:
 *   - No Supabase realtime channel for v1 (Chase: deferred). Single-tab is fine.
 *   - Optimistic create/update/delete with rollback on failure.
 *   - Returns flat list ordered most-recent-first (matches lib/journal.js).
 *   - lessonId/moduleId filters optional; when omitted the hook fetches ALL
 *     entries for the user (panel default — Chase: directive #1, "always one
 *     click away" implies surface-wide visibility, not lesson-scoped).
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  saveJournalEntry,
  updateJournalEntry,
} from '../../lib/journal';

/**
 * Fetch journal entries WITH joined lesson + module context for the breadcrumb.
 * Falls back to flat entries (no join) if the relation alias resolves with an
 * error — keeps the panel usable even when foreign keys are missing locally.
 */
async function fetchEntriesWithContext(userId, { lessonId, moduleId }) {
  let query = supabase
    .from('journal_entries')
    .select(
      'id, user_id, lesson_id, module_id, prompt_text, entry_text, mood, created_at, updated_at, lessons(id, title, sort_order, module_id, modules(id, title, module_number)), modules(id, title, module_number)'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (lessonId) query = query.eq('lesson_id', lessonId);
  if (moduleId) query = query.eq('module_id', moduleId);

  const { data, error } = await query;
  if (error) {
    // Fallback: try the flat select if the join shape isn't accepted (defensive)
    const flat = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (flat.error) throw error; // surface original
    return flat.data || [];
  }
  return data || [];
}

export function useJournal({ userId, lessonId, moduleId } = {}) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!userId) {
      setEntries([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEntriesWithContext(userId, { lessonId, moduleId });
      setEntries(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [userId, lessonId, moduleId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // ── Create (optimistic) ─────────────────────────────────────────────────
  const createEntry = useCallback(
    async ({ lessonId: lid, moduleId: mid, promptText, entryText, mood }) => {
      if (!userId) throw new Error('useJournal.createEntry: missing userId');
      // Optimistic temp row — server replaces on success
      const optimistic = {
        id: `__optim_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        user_id: userId,
        lesson_id: lid || null,
        module_id: mid || null,
        prompt_text: promptText || null,
        entry_text: entryText || '',
        mood: mood || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        __optimistic: true,
      };
      setEntries((prev) => [optimistic, ...prev]);
      try {
        const saved = await saveJournalEntry(userId, {
          lessonId: lid,
          moduleId: mid,
          promptText,
          entryText,
          mood,
        });
        setEntries((prev) =>
          prev.map((e) => (e.id === optimistic.id ? saved : e))
        );
        return saved;
      } catch (e) {
        // rollback
        setEntries((prev) => prev.filter((row) => row.id !== optimistic.id));
        setError(e);
        throw e;
      }
    },
    [userId]
  );

  // ── Update (optimistic) ─────────────────────────────────────────────────
  const updateEntry = useCallback(async (id, patch) => {
    let snapshot;
    setEntries((prev) => {
      snapshot = prev;
      return prev.map((row) =>
        row.id === id
          ? {
              ...row,
              entry_text: patch.entryText ?? row.entry_text,
              mood: patch.mood === undefined ? row.mood : patch.mood,
              updated_at: new Date().toISOString(),
            }
          : row
      );
    });
    try {
      const updated = await updateJournalEntry(id, patch);
      setEntries((prev) => prev.map((row) => (row.id === id ? updated : row)));
      return updated;
    } catch (e) {
      // rollback
      if (snapshot) setEntries(snapshot);
      setError(e);
      throw e;
    }
  }, []);

  // ── Delete (optimistic) ─────────────────────────────────────────────────
  const deleteEntry = useCallback(async (id) => {
    let snapshot;
    setEntries((prev) => {
      snapshot = prev;
      return prev.filter((row) => row.id !== id);
    });
    try {
      const { error: err } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);
      if (err) throw err;
    } catch (e) {
      if (snapshot) setEntries(snapshot);
      setError(e);
      throw e;
    }
  }, []);

  return {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    refetch,
  };
}

export default useJournal;
