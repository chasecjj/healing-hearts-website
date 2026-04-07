import React, { useRef, useCallback, useEffect } from 'react';

/**
 * MuxVideoPlayer — lazy-loaded Mux player wrapper with HH styling.
 * Saves position every ~15s and auto-completes at 90% threshold.
 *
 * Uses dynamic import so @mux/mux-player-react only loads on video pages.
 */
const MuxPlayer = React.lazy(() => import('@mux/mux-player-react'));

export default function MuxVideoPlayer({
  playbackId,
  title,
  startPosition = 0,
  onPositionUpdate,
  onComplete,
  className = '',
}) {
  const completeFiredRef = useRef(false);
  const intervalRef = useRef(null);
  const playerRef = useRef(null);
  const startPosRef = useRef(startPosition);

  useEffect(() => {
    startPosRef.current = startPosition;
  }, [startPosition]);

  // Position reporting interval (every 15s of playback)
  const handlePlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const el = playerRef.current;
      if (!el) return;
      const currentTime = el.currentTime;
      const duration = el.duration;
      if (onPositionUpdate && currentTime > 0) {
        onPositionUpdate(currentTime);
      }
      // Auto-complete at 90%
      if (
        !completeFiredRef.current &&
        duration > 0 &&
        currentTime / duration >= 0.9 &&
        onComplete
      ) {
        completeFiredRef.current = true;
        onComplete();
      }
    }, 15000);
  }, [onPositionUpdate, onComplete]);

  const handlePause = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    // Save position immediately on pause
    const el = playerRef.current;
    if (el && onPositionUpdate && el.currentTime > 0) {
      onPositionUpdate(el.currentTime);
    }
  }, [onPositionUpdate]);

  const handleEnded = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!completeFiredRef.current && onComplete) {
      completeFiredRef.current = true;
      onComplete();
    }
  }, [onComplete]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Stable ref callback — reads startPosition from ref, not closure
  const handleRef = useCallback((el) => {
    playerRef.current = el;
    if (el && startPosRef.current > 0) {
      const setStart = () => {
        if (el.duration && startPosRef.current < el.duration) {
          el.currentTime = startPosRef.current;
        }
        el.removeEventListener('loadedmetadata', setStart);
      };
      // Handle case where metadata already loaded
      if (el.readyState >= 1) {
        setStart();
      } else {
        el.addEventListener('loadedmetadata', setStart);
      }
    }
  }, []);

  return (
    <React.Suspense
      fallback={
        <div className={`bg-neutral-100 rounded-2xl aspect-video animate-pulse ${className}`} />
      }
    >
      <MuxPlayer
        ref={handleRef}
        playbackId={playbackId}
        metadata={{ video_title: title }}
        accentColor="#1191B1"
        streamType="on-demand"
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        className={`rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(7,58,71,0.12)] ${className}`}
        style={{ aspectRatio: '16/9', width: '100%' }}
      />
    </React.Suspense>
  );
}
