import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';

/**
 * AudioPlayer — minimal, warm-styled audio player for meditations.
 * Uses native <audio> with React refs for control.
 * No volume slider — keeps it simple and calming.
 */
export default function AudioPlayer({ src, title }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setPlaying(true);
      }).catch((err) => {
        console.error('Audio playback failed:', err);
        setPlaying(false);
      });
    }
  }, [playing]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    function handleTimeUpdate() {
      setCurrentTime(audio.currentTime);
    }
    function handleLoadedMetadata() {
      setDuration(audio.duration);
    }
    function handleEnded() {
      setPlaying(false);
      setCurrentTime(0);
    }

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  function handleSeek(e) {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  }

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-4 bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        className="flex-shrink-0 w-10 h-10 rounded-full text-white flex items-center justify-center transition-colors shadow-sm active:scale-95"
        style={{ backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)' }}
        aria-label={playing ? `Pause ${title}` : `Play ${title}`}
      >
        {playing ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>

      {/* Progress bar + time */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-xs font-outfit font-medium text-foreground/60 mb-1.5 truncate">
            {title}
          </p>
        )}
        <button
          onClick={handleSeek}
          className="w-full h-1.5 bg-neutral-100 rounded-full cursor-pointer relative group"
          aria-label="Seek audio position"
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-100"
            style={{ width: `${progress}%`, backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)' }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 6px)`, backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)' }}
          />
        </button>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] font-sans text-foreground/40">
            {formatTime(currentTime)}
          </span>
          <span className="text-[10px] font-sans text-foreground/40">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
