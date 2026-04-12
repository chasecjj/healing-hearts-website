import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  getCourseWithContent,
  getUserProgress,
  markLessonComplete,
  markLessonIncomplete,
  calculateModuleProgress,
  calculateCourseProgress,
} from '../lib/courses';

const CACHE_KEY_PREFIX = 'hh_course_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function cacheKey(courseSlug) {
  return `${CACHE_KEY_PREFIX}_${courseSlug}`;
}

function readCache(courseSlug) {
  try {
    const raw = sessionStorage.getItem(cacheKey(courseSlug));
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL) return null;
    return cached;
  } catch {
    return null;
  }
}

function writeCache(courseSlug, course, progress) {
  try {
    sessionStorage.setItem(
      cacheKey(courseSlug),
      JSON.stringify({ course, progress, timestamp: Date.now() })
    );
  } catch {
    // sessionStorage full or unavailable — no-op
  }
}

/**
 * Hook that loads course data with stale-while-revalidate caching.
 *
 * 1. On mount: show cached data instantly (no loading spinner)
 * 2. Fetch fresh data from Supabase in background
 * 3. Update UI + cache when fresh data arrives
 * 4. On failure: keep showing cached data, surface error
 *
 * Progress mutations remain optimistic with server sync + revert.
 */
export function useCourseData(courseSlug = 'healing-hearts-journey') {
  const { user } = useAuth();

  // Initialize from cache if available
  const cached = useRef(readCache(courseSlug));
  const [course, setCourse] = useState(cached.current?.course || null);
  const [progress, setProgress] = useState(cached.current?.progress || []);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(!cached.current);
  const [error, setError] = useState(null);

  const fetchingRef = useRef(false);

  const loadData = useCallback(async () => {
    if (!user || fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      // Only show loading spinner if we have no cached data
      if (!course) setLoading(true);
      setError(null);

      const courseData = await getCourseWithContent(courseSlug);
      const progressData = await getUserProgress(user.id, courseData.id);

      // Check for active enrollments
      let enrollmentData = [];
      try {
        const { data } = await supabase
          .from('enrollments')
          .select('course_id, status')
          .eq('user_id', user.id)
          .eq('status', 'active');
        enrollmentData = data || [];
      } catch {
        // Non-critical -- default to no enrollments
      }

      setCourse(courseData);
      setProgress(progressData);
      setEnrollments(enrollmentData);
      writeCache(courseSlug, courseData, progressData);
    } catch (err) {
      console.error('Failed to load course data:', err);
      setError(err.message);
      // If we have cached data, keep showing it — don't blank the screen
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user, courseSlug, course]);

  // Fetch on mount + revalidate when user returns to tab
  useEffect(() => {
    loadData();

    function handleFocus() {
      // Revalidate when user tabs back (catches DB changes)
      const c = readCache(courseSlug);
      if (!c || Date.now() - c.timestamp > CACHE_TTL) {
        loadData();
      }
    }

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
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
      let newProgress;
      if (wasCompleted) {
        newProgress = progress.map((p) =>
          p.lesson_id === lessonId
            ? { ...p, completed: false, completed_at: null }
            : p
        );
      } else {
        const optimisticRecord = {
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        };
        const filtered = progress.filter((p) => p.lesson_id !== lessonId);
        newProgress = [...filtered, optimisticRecord];
      }

      setProgress(newProgress);
      writeCache(courseSlug, course, newProgress);

      // Fire async Supabase call
      try {
        if (wasCompleted) {
          await markLessonIncomplete(user.id, lessonId);
        } else {
          await markLessonComplete(user.id, lessonId);
        }
      } catch (err) {
        console.error('Failed to update progress, reverting:', err);
        setProgress(previousProgress);
        writeCache(courseSlug, course, previousProgress);
      }
    },
    [user, progress, course, courseSlug]
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
    hasActiveEnrollment: enrollments.length > 0,
    refetch: loadData,
  };
}
