/**
 * useNotes — notes CRUD + Supabase Realtime subscription hook.
 *
 * Mirrors useHighlights shape. See scout-05 §Cross-device sync.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';

export function useNotes({ userId, lessonId } = {}) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const channelRef = useRef(null);

  const refetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('notes').select('*').eq('user_id', userId);
      if (lessonId) query = query.eq('lesson_id', lessonId);
      const { data, error: err } = await query.order('created_at', { ascending: false });
      if (err) throw err;
      setNotes(data || []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [userId, lessonId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!userId) return undefined;
    const channel = supabase
      .channel(`notes:${userId}:${lessonId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotes((prev) => applyChange(prev, payload));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') refetch();
      });
    channelRef.current = channel;

    const onVisibility = () => {
      if (!document.hidden) refetch();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [userId, lessonId, refetch]);

  const createNote = useCallback(
    async ({ lesson_id, body_text, note_type, highlight_id = null, block_index = null, block_id = null, folder_id = null }) => {
      const payload = {
        user_id: userId,
        lesson_id,
        body_text,
        note_type,
        highlight_id,
        block_index,
        block_id,
        folder_id,
      };
      const { data, error: err } = await supabase
        .from('notes')
        .insert(payload)
        .select()
        .single();
      if (err) throw err;
      return data;
    },
    [userId]
  );

  const updateNote = useCallback(async (id, patch) => {
    const { data, error: err } = await supabase
      .from('notes')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (err) throw err;
    return data;
  }, []);

  const deleteNote = useCallback(async (id) => {
    const { error: err } = await supabase.from('notes').delete().eq('id', id);
    if (err) throw err;
  }, []);

  return { notes, loading, error, createNote, updateNote, deleteNote, refetch };
}

function applyChange(prev, payload) {
  const { eventType, new: newRow, old: oldRow } = payload;
  if (eventType === 'INSERT') {
    if (prev.find((n) => n.id === newRow.id)) return prev;
    return [newRow, ...prev];
  }
  if (eventType === 'UPDATE') {
    return prev.map((n) => (n.id === newRow.id ? newRow : n));
  }
  if (eventType === 'DELETE') {
    return prev.filter((n) => n.id !== oldRow.id);
  }
  return prev;
}

export default useNotes;
