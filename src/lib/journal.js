import { supabase } from './supabase';

/**
 * Get journal entries for a user, optionally filtered by lesson or module.
 */
export async function getJournalEntries(userId, { lessonId, moduleId } = {}) {
  let query = supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (lessonId) query = query.eq('lesson_id', lessonId);
  if (moduleId) query = query.eq('module_id', moduleId);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Save a new journal entry.
 */
export async function saveJournalEntry(userId, { lessonId, moduleId, promptText, entryText, mood }) {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: userId,
      lesson_id: lessonId || null,
      module_id: moduleId || null,
      prompt_text: promptText || null,
      entry_text: entryText,
      mood: mood || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update an existing journal entry.
 * The moddatetime trigger handles updated_at automatically.
 */
export async function updateJournalEntry(entryId, { entryText, mood }) {
  const { data, error } = await supabase
    .from('journal_entries')
    .update({
      entry_text: entryText,
      mood: mood || null,
    })
    .eq('id', entryId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
