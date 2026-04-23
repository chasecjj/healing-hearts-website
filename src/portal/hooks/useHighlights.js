/**
 * useHighlights — highlights CRUD + Supabase Realtime subscription hook.
 *
 * Spec: scout-05 §Cross-device sync + wave3-drawer-content-specs §8.4(c)
 *
 * Returns:
 *   {
 *     highlights: Array,
 *     loading: boolean,
 *     error: Error|null,
 *     createHighlight: async (args) => highlight,
 *     updateHighlight: async (id, patch) => highlight,
 *     deleteHighlight: async (id) => void,
 *     refetch: async () => void,
 *   }
 *
 * Fails soft when migration 014 hasn't been applied — errors are captured
 * and surfaced via `error` but the hook does not throw.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';

export function useHighlights({ userId, lessonId } = {}) {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const channelRef = useRef(null);

  const refetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('highlights').select('*').eq('user_id', userId);
      if (lessonId) query = query.eq('lesson_id', lessonId);
      const { data, error: err } = await query.order('created_at', { ascending: false });
      if (err) throw err;
      setHighlights(data || []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [userId, lessonId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return undefined;
    const channel = supabase
      .channel(`highlights:${userId}:${lessonId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'highlights',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setHighlights((prev) => applyChange(prev, payload));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          refetch();
        }
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

  const createHighlight = useCallback(
    async ({ lesson_id, block_index, anchor_text, anchor_start, anchor_end, color = 'yellow', folder_id = null, block_id = null }) => {
      const payload = {
        user_id: userId,
        lesson_id,
        block_index,
        block_id,
        anchor_text,
        anchor_start,
        anchor_end,
        color,
        folder_id,
      };
      const { data, error: err } = await supabase
        .from('highlights')
        .insert(payload)
        .select()
        .single();
      if (err) throw err;
      return data;
    },
    [userId]
  );

  const updateHighlight = useCallback(async (id, patch) => {
    const { data, error: err } = await supabase
      .from('highlights')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (err) throw err;
    return data;
  }, []);

  const deleteHighlight = useCallback(async (id) => {
    const { error: err } = await supabase.from('highlights').delete().eq('id', id);
    if (err) throw err;
  }, []);

  return { highlights, loading, error, createHighlight, updateHighlight, deleteHighlight, refetch };
}

function applyChange(prev, payload) {
  const { eventType, new: newRow, old: oldRow } = payload;
  if (eventType === 'INSERT') {
    if (prev.find((h) => h.id === newRow.id)) return prev;
    return [newRow, ...prev];
  }
  if (eventType === 'UPDATE') {
    return prev.map((h) => (h.id === newRow.id ? newRow : h));
  }
  if (eventType === 'DELETE') {
    return prev.filter((h) => h.id !== oldRow.id);
  }
  return prev;
}

export default useHighlights;
