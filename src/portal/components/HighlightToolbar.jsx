/**
 * HighlightToolbar — floating selection toolbar (Readwise/Kindle pattern)
 *
 * Spec: scout-05 §UX-Highlighting + wave3-drawer-content-specs §8.2
 *
 * Appears on mouseup/touchend inside an element carrying [data-lesson-content].
 * Renders 4 color swatches + Note pencil + Close X.
 * Caller owns onColor(color), onNote(), onDismiss() handlers.
 *
 * Self-positioning fixed/z-50 above the selection bounding rect.
 */

import React, { useEffect, useState } from 'react';
import { durations, easings, useReducedMotion } from '../design/motion';

const COLORS = [
  { id: 'yellow', swatch: '#FDE68A' },
  { id: 'rose', swatch: '#FBCFE8' },
  { id: 'sage', swatch: '#BBF7D0' },
  { id: 'sky', swatch: '#BAE6FD' }, // kept as color token only; never a state indicator (D10)
];

/**
 * Hook: useTextSelection
 * Fires onSelect(rect, text, range) when a selection is released inside
 * any element that has data-lesson-content attribute up the DOM tree.
 */
export function useTextSelection({ enabled = true, onSelect, onDismiss } = {}) {
  useEffect(() => {
    if (!enabled) return undefined;
    function handleUp(evt) {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        onDismiss?.();
        return;
      }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (!rect || (rect.width === 0 && rect.height === 0)) {
        onDismiss?.();
        return;
      }

      // Walk up from the anchor to see if we're inside [data-lesson-content]
      let node = sel.anchorNode;
      if (node && node.nodeType === 3) node = node.parentNode;
      let isInLesson = false;
      let blockEl = null;
      while (node && node !== document.body) {
        if (node.dataset && node.dataset.lessonContent !== undefined) {
          isInLesson = true;
        }
        if (node.dataset && node.dataset.blockIndex !== undefined && !blockEl) {
          blockEl = node;
        }
        node = node.parentNode;
      }
      if (!isInLesson) return;

      onSelect?.({
        rect,
        text: sel.toString(),
        range,
        blockIndex: blockEl ? Number(blockEl.dataset.blockIndex) : null,
        blockEl,
      });
    }
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('touchend', handleUp);
    return () => {
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchend', handleUp);
    };
  }, [enabled, onSelect, onDismiss]);
}

export function HighlightToolbar({ position, onColor, onNote, onDismiss }) {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!position) return null;

  const top = Math.max(8, position.top - 44);
  const left = Math.max(8, position.left + position.width / 2 - 120);

  const transition = prefersReduced
    ? 'none'
    : `opacity ${durations['duration-toolbar-reveal']}ms ${easings['ease-out-expo']}, transform ${durations['duration-toolbar-reveal']}ms ${easings['ease-out-expo']}`;

  return (
    <div
      role="toolbar"
      aria-label="Highlight selection"
      style={{
        position: 'fixed',
        top,
        left,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 6px',
        borderRadius: 10,
        backgroundColor: '#ffffff',
        border: '1px solid #d6d3d1',
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(4px)',
        transition,
      }}
    >
      {COLORS.map((c) => (
        <button
          key={c.id}
          type="button"
          aria-label={`Highlight ${c.id}`}
          title={`Highlight ${c.id}`}
          onClick={() => onColor?.(c.id)}
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            border: '1px solid rgba(0,0,0,0.08)',
            backgroundColor: c.swatch,
            cursor: 'pointer',
          }}
        />
      ))}
      <button
        type="button"
        aria-label="Add note"
        onClick={() => onNote?.()}
        style={{
          marginLeft: 4,
          padding: '2px 8px',
          borderRadius: 6,
          border: '1px solid #d6d3d1',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        ✏️ Note
      </button>
      <button
        type="button"
        aria-label="Dismiss toolbar"
        onClick={() => onDismiss?.()}
        style={{
          marginLeft: 2,
          padding: '2px 6px',
          border: 'none',
          backgroundColor: 'transparent',
          color: '#57534e',
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        ✕
      </button>
    </div>
  );
}

export default HighlightToolbar;
