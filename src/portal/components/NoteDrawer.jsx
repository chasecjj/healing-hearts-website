/**
 * NoteDrawer — right-side slide-in note editor (320px).
 *
 * Spec: scout-05 §UX-Notes + wave3-drawer-content-specs §8.3
 * Auto-save on blur with 500ms debounce.
 *
 * Props:
 *   open       : boolean
 *   initialText: string — pre-filled body_text when editing
 *   placeholder: string — varies by note_type
 *   onSave     : async (text) => void
 *   onClose    : () => void
 *   onDelete?  : async () => void — trash icon if provided
 */

import React, { useEffect, useRef, useState } from 'react';
import { getTypeStyle } from '../design/typography';
import { durations, easings, useReducedMotion } from '../design/motion';

export function NoteDrawer({
  open,
  initialText = '',
  placeholder = 'What stood out in this lesson?',
  onSave,
  onClose,
  onDelete,
}) {
  const prefersReduced = useReducedMotion();
  const [text, setText] = useState(initialText);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  useEffect(() => {
    if (open) {
      // Focus textarea on open
      const t = setTimeout(() => textareaRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    // debounce auto-save
    if (!open) return undefined;
    if (text === initialText) return undefined;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (!onSave) return;
      setSaving(true);
      try {
        await onSave(text);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      } finally {
        setSaving(false);
      }
    }, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, open, initialText, onSave]);

  const transition = prefersReduced
    ? 'none'
    : `transform ${durations['duration-drawer']}ms ${easings['ease-out-emphasized']}`;

  return (
    <>
      {open && (
        <div
          aria-hidden="true"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.25)',
            zIndex: 55,
          }}
        />
      )}
      <aside
        role="dialog"
        aria-label="Note editor"
        aria-hidden={!open}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: 320,
          maxWidth: '100%',
          backgroundColor: 'var(--pt-elevation-2-hex, #ffffff)',
          color: 'var(--pt-text-primary-hex, #1c1917)',
          boxShadow: '0 0 24px rgba(0,0,0,0.12)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition,
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ ...getTypeStyle('heading-2'), margin: 0 }}>Note</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {saving && (
              <span style={{ ...getTypeStyle('meta'), color: 'var(--pt-text-muted-hex, #57534e)' }}>
                saving…
              </span>
            )}
            {saved && (
              <span
                style={{
                  ...getTypeStyle('meta'),
                  color: 'var(--pt-success-hex, #15803d)',
                }}
              >
                Saved ✓
              </span>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                aria-label="Delete note"
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                🗑
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close note editor"
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              ✕
            </button>
          </div>
        </header>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          style={{
            ...getTypeStyle('body'),
            flex: 1,
            resize: 'none',
            padding: 16,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'inherit',
          }}
        />
      </aside>
    </>
  );
}

export default NoteDrawer;
