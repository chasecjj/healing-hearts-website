import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getCourseWithContent,
  getUserProgress,
  markLessonComplete,
  markLessonIncomplete,
  calculateModuleProgress,
  calculateCourseProgress,
} from '../lib/courses';

/**
 * Hook that loads course data once and caches it in state.
 * Lesson navigation reads from cache — no refetch per click.
 * Progress mutations are optimistic: local state updates immediately,
 * Supabase fires async, reverts on failure.
 */
export function useCourseData(courseSlug = 'healing-hearts-journey') {
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Prevent duplicate fetches on mount
  const hasFetched = useRef(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const courseData = await getCourseWithContent(courseSlug);
      const progressData = await getUserProgress(user.id, courseData.id);
      setCourse(courseData);
      setProgress(progressData);
    } catch (err) {
      console.error('Failed to load course data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, courseSlug]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadData();
  }, [loadData]);

  /**
   * Optimistic toggle: updates local state immediately, fires Supabase
   * upsert in the background, reverts on failure.
   */
  const toggleLessonComplete = useCallback(
    async (lessonId) => {
      if (!user) return;

      const existing = progress.find((p) => p.lesson_id === lessonId);
      const wasCompleted = existing?.completed ?? false;
      const previousProgress = [...progress];

      // Optimistic local update
      if (wasCompleted) {
        setProgress((prev) =>
          prev.map((p) =>
            p.lesson_id === lessonId
              ? { ...p, completed: false, completed_at: null }
              : p
          )
        );
      } else {
        const optimisticRecord = {
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        };
        setProgress((prev) => {
          const filtered = prev.filter((p) => p.lesson_id !== lessonId);
          return [...filtered, optimisticRecord];
        });
      }

      // Fire async Supabase call
      try {
        if (wasCompleted) {
          await markLessonIncomplete(user.id, lessonId);
        } else {
          await markLessonComplete(user.id, lessonId);
        }
      } catch (err) {
        console.error('Failed to update progress, reverting:', err);
        // Revert on failure
        setProgress(previousProgress);
      }
    },
    [user, progress]
  );

  const isLessonCompleted = useCallback(
    (lessonId) => {
      return progress.some((p) => p.lesson_id === lessonId && p.completed);
    },
    [progress]
  );

  const getModuleProgress = useCallback(
    (module) => {
      return calculateModuleProgress(module, progress);
    },
    [progress]
  );

  const getProgressRecord = useCallback(
    (lessonId) => {
      return progress.find((p) => p.lesson_id === lessonId) || null;
    },
    [progress]
  );

  const overallProgress = course?.modules
    ? calculateCourseProgress(course.modules, progress)
    : 0;

  return {
    course,
    progress,
    loading,
    error,
    toggleLessonComplete,
    isLessonCompleted,
    getModuleProgress,
    getProgressRecord,
    overallProgress,
    refetch: loadData,
  };
}
