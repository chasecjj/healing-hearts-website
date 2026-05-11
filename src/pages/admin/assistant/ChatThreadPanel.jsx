/**
 * ChatThreadPanel — scrollable message thread + ChatInput pinned at bottom.
 *
 * User messages: right-aligned, elevation-1 bubble.
 * Assistant messages: left-aligned, elevation-2 bubble, markdown-rendered.
 * Streaming: appends tokens to last assistant bubble (via streamingText prop).
 * Auto-scrolls to bottom on new message.
 *
 * Locked-contract ref: §5.2 <ChatThreadPanel>
 */

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { getTypeStyle } from '../../../portal/design/typography';
import { useReducedMotion } from '../../../portal/design/motion';
import ChatInput from './ChatInput';

/** Simple relative-time formatter (mirrors SessionListRail) */
function formatRelative(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days <= 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function MessageBubble({ msg, isStreaming }) {
  const isUser = msg.role === 'user';

  return (
    <li
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 12,
        paddingLeft: isUser ? '20%' : 0,
        paddingRight: isUser ? 0 : '20%',
      }}
    >
      <div style={{ maxWidth: '100%' }}>
        <div
          style={{
            backgroundColor: isUser
              ? 'var(--pt-elevation-1-hex, #e7e5e4)'
              : 'var(--pt-elevation-2-hex, #ffffff)',
            borderRadius: 12,
            padding: '10px 14px',
            border: isUser
              ? 'none'
              : '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
            ...getTypeStyle('body'),
            color: 'var(--pt-text-primary-hex, #1c1917)',
          }}
        >
          {isUser ? (
            <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
          ) : (
            <div className="markdown-body" style={{ ...getTypeStyle('body') }}>
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                {msg.content || (isStreaming ? '…' : '')}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {msg.timestamp && (
          <p
            style={{
              ...getTypeStyle('meta'),
              color: 'var(--pt-text-muted-hex, #57534e)',
              textAlign: isUser ? 'right' : 'left',
              margin: '2px 0 0',
              padding: '0 4px',
            }}
          >
            {formatRelative(msg.timestamp)}
          </p>
        )}
      </div>
    </li>
  );
}

export default function ChatThreadPanel({
  sessionId,
  messages,
  loading,
  sending,
  streaming,
  streamingText,
  rateLimitError,
  onSend,
  onBack,
  isMobile,
}) {
  const bottomRef = useRef(null);
  const prefersReduced = useReducedMotion();
  const isInFlight = sending || streaming;

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
  }, [messages, streamingText, prefersReduced]);

  // Empty state: no session selected
  if (!sessionId) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--pt-text-muted-hex, #57534e)',
          ...getTypeStyle('body'),
        }}
      >
        Select a conversation or start a new one.
      </div>
    );
  }

  // Build messages to display (add streaming bubble if in progress)
  const displayMessages = [
    ...messages,
    ...(streaming
      ? [{ role: 'assistant', content: streamingText, timestamp: null, _streaming: true }]
      : []),
    ...(sending && !streaming
      ? [{ role: 'assistant', content: '', timestamp: null, _thinking: true }]
      : []),
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          height: 48,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
          gap: 8,
        }}
      >
        <span
          style={{
            ...getTypeStyle('body', 'medium'),
            color: 'var(--pt-text-muted-hex, #57534e)',
          }}
        >
          Admin › Assistant
        </span>
        <span style={{ flex: 1 }} />
        {isMobile && (
          <button
            onClick={onBack}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              ...getTypeStyle('body'),
              color: 'var(--pt-primary-accent-hex, #B96A5F)',
              padding: '4px 8px',
              fontFamily: 'inherit',
            }}
            aria-label="Back to session list"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Message thread */}
      <ul
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          margin: 0,
          listStyle: 'none',
        }}
        aria-live="polite"
        aria-label="Conversation thread"
      >
        {loading && messages.length === 0 ? (
          <li
            style={{
              textAlign: 'center',
              padding: '32px 16px',
              ...getTypeStyle('caption'),
              color: 'var(--pt-text-quiet-hex, #6b6462)',
            }}
          >
            Loading messages…
          </li>
        ) : displayMessages.length === 0 ? (
          <li
            style={{
              textAlign: 'center',
              padding: '32px 16px',
              ...getTypeStyle('body'),
              color: 'var(--pt-text-muted-hex, #57534e)',
            }}
          >
            Start a conversation.
          </li>
        ) : (
          displayMessages.map((msg, idx) => {
            if (msg._thinking) {
              return (
                <li
                  key={`thinking-${idx}`}
                  style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}
                  aria-label="Assistant is thinking"
                >
                  <div
                    style={{
                      backgroundColor: 'var(--pt-elevation-2-hex, #ffffff)',
                      border: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      ...getTypeStyle('body'),
                      color: 'var(--pt-text-muted-hex, #57534e)',
                      fontStyle: 'italic',
                    }}
                  >
                    Assistant is thinking…
                  </div>
                </li>
              );
            }
            return (
              <MessageBubble
                key={msg._streaming ? 'streaming' : idx}
                msg={msg}
                isStreaming={msg._streaming}
              />
            );
          })
        )}
        <li ref={bottomRef} aria-hidden="true" />
      </ul>

      {/* Chat input pinned at bottom */}
      <ChatInput
        onSend={onSend}
        disabled={isInFlight}
        rateLimitError={rateLimitError}
      />
    </div>
  );
}
