/**
 * ChatInput — auto-expanding textarea + send button for the assistant chat.
 *
 * Enter sends; Shift+Enter = newline.
 * Disabled during in-flight sends.
 * 503 thinking-lock surfaced as banner (locked-api-contract §8 item 4).
 * useReducedMotion guard per WCAG 2.1 SC 2.3.3.
 *
 * Locked-contract ref: §5.2 <ChatInput>
 */

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useReducedMotion } from '../../../portal/design/motion';
import { getTypeStyle } from '../../../portal/design/typography';

export default function ChatInput({ onSend, disabled, rateLimitError }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);
  const prefersReduced = useReducedMotion();

  // Auto-expand textarea height
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    // Max 6 rows ≈ 6 * 1.55 * 15px line-height ≈ 140px
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const canSend = value.trim().length > 0 && !disabled;
  const transitionStyle = prefersReduced ? 'none' : 'opacity 150ms ease, background-color 150ms ease';

  return (
    <div style={{ borderTop: '1px solid var(--pt-border-subtle-hex, #d6d3d1)' }}>
      {/* Rate-limit / thinking-lock banner — §8 item 4 */}
      {rateLimitError && (
        <div
          role="alert"
          style={{
            ...getTypeStyle('caption'),
            backgroundColor: 'rgba(180, 83, 9, 0.08)',
            color: 'var(--pt-warning-hex, #b45309)',
            padding: '8px 16px',
            textAlign: 'center',
          }}
        >
          The assistant is busy. Please wait a moment and try again.
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
          padding: 12,
        }}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask an admin question…"
          aria-label="Chat message"
          disabled={disabled}
          style={{
            flex: 1,
            resize: 'none',
            overflow: 'hidden',
            border: '1px solid var(--pt-border-strong-hex, #78716c)',
            borderRadius: 8,
            padding: '8px 12px',
            ...getTypeStyle('body'),
            color: 'var(--pt-text-primary-hex, #1c1917)',
            backgroundColor: 'var(--pt-elevation-2-hex, #ffffff)',
            outline: 'none',
            fontFamily: 'inherit',
            lineHeight: 1.55,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--pt-focus-ring-hex, #B96A5F)';
            e.target.style.boxShadow = '0 0 0 2px rgba(185, 106, 95, 0.18)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--pt-border-strong-hex, #78716c)';
            e.target.style.boxShadow = 'none';
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* In-flight indicator */}
          {disabled && (
            <span
              aria-label="Sending…"
              style={{
                display: 'flex',
                gap: 3,
                alignItems: 'center',
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    backgroundColor: 'var(--pt-text-muted-hex, #57534e)',
                    animation: prefersReduced
                      ? 'none'
                      : `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    opacity: prefersReduced ? 0.7 : undefined,
                  }}
                />
              ))}
              <style>{`
                @keyframes pulse {
                  0%, 100% { opacity: 0.3; }
                  50% { opacity: 1; }
                }
              `}</style>
            </span>
          )}

          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send message"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              border: 'none',
              cursor: canSend ? 'pointer' : 'not-allowed',
              backgroundColor: canSend
                ? 'var(--pt-primary-accent-hex, #B96A5F)'
                : 'var(--pt-elevation-1-hex, #e7e5e4)',
              color: canSend
                ? 'var(--pt-text-inverse-hex, #fafaf9)'
                : 'var(--pt-text-muted-hex, #57534e)',
              transition: transitionStyle,
              ...getTypeStyle('body', 'medium'),
            }}
          >
            <Send size={15} aria-hidden="true" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
