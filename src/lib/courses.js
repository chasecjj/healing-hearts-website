import { supabase } from './supabase';

// ─── Course Listing ────────────────────────────────────────────

/**
 * Fetch all active courses (slug, title, description, course_type).
 * Used by the portal dashboard to show available courses.
 */
export async function getActiveCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('id, slug, title, description, course_type')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// ─── Course Data Queries ────────────────────────────────────────

/**
 * Fetch a single course with its modules and nested lessons.
 * Uses 2 queries max; relies on idx_modules_sort and idx_lessons_sort indexes.
 */
export async function getCourseWithContent(courseSlug) {
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', courseSlug)
    .eq('is_active', true)
    .single();

  if (courseError) throw courseError;

  const { data: modules, error: modError } = await supabase
    .from('modules')
    .select(`
      *,
      lessons (*)
    `)
    .eq('course_id', course.id)
    .order('sort_order', { ascending: true });

  if (modError) throw modError;

  // Sort lessons within each module by sort_order
  modules.forEach((mod) => {
    mod.lessons = (mod.lessons || []).sort((a, b) => a.sort_order - b.sort_order);
  });

  return { ...course, modules };
}

// ─── Progress Queries ───────────────────────────────────────────

/**
 * Fetch all lesson_progress rows for a user within a specific course.
 */
export async function getUserProgress(userId, courseId) {
  const { data: modules } = await supabase
    .from('modules')
    .select('id, lessons(id)')
    .eq('course_id', courseId);

  const lessonIds = modules?.flatMap((m) => m.lessons?.map((l) => l.id) || []) || [];
  if (lessonIds.length === 0) return [];

  const { data: progress, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds);

  if (error) throw error;
  return progress || [];
}

/**
 * Mark a lesson as complete. Uses upsert on composite PK (user_id, lesson_id).
 */
export async function markLessonComplete(userId, lessonId) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark a lesson as incomplete (toggle back).
 */
export async function markLessonIncomplete(userId, lessonId) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completed: false,
        completed_at: null,
      },
      { onConflict: 'user_id,lesson_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Lesson Notes ──────────────────────────────────────────────

/**
 * Save notes for a lesson. Uses upsert — payload is surgically minimal
 * to avoid clobbering completed/last_position_seconds on existing rows.
 */
export async function saveLessonNotes(userId, lessonId, notes) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        notes,
      },
      { onConflict: 'user_id,lesson_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get notes for a specific lesson.
 */
export async function getLessonNotes(userId, lessonId) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('notes')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();
  if (error) throw error;
  return data?.notes || '';
}

// ─── Video Position ────────────────────────────────────────────

/**
 * Save video playback position. Surgically minimal upsert —
 * only touches last_position_seconds, never completed or notes.
 */
export async function saveVideoPosition(userId, lessonId, positionSeconds) {
  const { error } = await supabase
    .from('lesson_progress')
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        last_position_seconds: positionSeconds,
      },
      { onConflict: 'user_id,lesson_id' }
    );
  if (error) throw error;
}

/**
 * Get video playback position for resume-from-where-you-left-off.
 */
export async function getVideoPosition(userId, lessonId) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('last_position_seconds')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();
  if (error) throw error;
  return data?.last_position_seconds || 0;
}

// ─── Pure Progress Calculators (no side effects, easy to test) ──

/**
 * Calculate completion percentage for a single module.
 */
export function calculateModuleProgress(module, progressRecords) {
  if (!module.lessons || module.lessons.length === 0) return 0;
  const completedCount = module.lessons.filter((lesson) =>
    progressRecords.some((p) => p.lesson_id === lesson.id && p.completed)
  ).length;
  return Math.round((completedCount / module.lessons.length) * 100);
}

/**
 * Calculate overall course completion percentage.
 */
export function calculateCourseProgress(modules, progressRecords) {
  const totalLessons = modules.reduce(
    (sum, mod) => sum + (mod.lessons?.length || 0),
    0
  );
  if (totalLessons === 0) return 0;
  const completedCount = modules.reduce(
    (sum, mod) =>
      sum +
      (mod.lessons || []).filter((lesson) =>
        progressRecords.some((p) => p.lesson_id === lesson.id && p.completed)
      ).length,
    0
  );
  return Math.round((completedCount / totalLessons) * 100);
}
