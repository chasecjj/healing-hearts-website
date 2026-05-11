/**
 * AssistantView — lazy-loaded top-level admin assistant page.
 *
 * Mobile (≤768px): full-height session list OR thread panel (CSS class toggle).
 * Desktop (≥769px): 280px fixed rail + flex-1 thread panel, both visible.
 *
 * State: selectedSessionId, managed via sessionStorage + useState.
 *
 * Locked-contract ref: §5.2 <AssistantView>
 */

import { useState, useCallback } from 'react';
import { useReducedMotion, durations, easings } from '../../portal/design/motion';
import { useAssistantSessions } from '../../portal/admin/assistant/useAssistantSessions';
import { useAssistantSession } from '../../portal/admin/assistant/useAssistantSession';
import SessionListRail from './assistant/SessionListRail';
import ChatThreadPanel from './assistant/ChatThreadPanel';

function safeSessionSet(key, value) {
  try { sessionStorage.setItem(key, value); } catch { /* sessionStorage unavailable in private browsing */ }
}

function safeSessionRemove(key) {
  try { sessionStorage.removeItem(key); } catch { /* sessionStorage unavailable in private browsing */ }
}

function safeSessionGet(key) {
  try { return sessionStorage.getItem(key) || null; } catch { return null; }
}

const SESSION_KEY = 'assistant_session_id';

export default function AssistantView() {
  const prefersReduced = useReducedMotion();

  const [selectedSessionId, setSelectedSessionId] = useState(() =>
    safeSessionGet(SESSION_KEY)
  );

  // Mobile pane state: 'list' | 'thread'
  const [mobilePane, setMobilePane] = useState(
    selectedSessionId ? 'thread' : 'list'
  );

  const [searchQuery, setSearchQuery] = useState('');

  const {
    sessions,
    loading: sessionsLoading,
    refresh: refreshSessions,
    renameSession,
    archiveSession,
    deleteSession,
  } = useAssistantSessions();

  // Callback when a new session is implicitly created by Phedris
  const handleNewSessionCreated = useCallback((newId) => {
    safeSessionSet(SESSION_KEY, newId);
    setSelectedSessionId(newId);
    refreshSessions();
  }, [refreshSessions]);

  const {
    messages,
    loading: messagesLoading,
    sending,
    streaming,
    streamingText,
    rateLimitError,
    sendStream,
  } = useAssistantSession(selectedSessionId, handleNewSessionCreated);

  const handleSelectSession = useCallback((id) => {
    setSelectedSessionId(id);
    safeSessionSet(SESSION_KEY, id);
    setMobilePane('thread');
  }, []);

  const handleNewChat = useCallback(() => {
    setSelectedSessionId(null);
    safeSessionRemove(SESSION_KEY);
    setMobilePane('thread');
  }, []);

  const handleArchiveSession = useCallback(async (id) => {
    await archiveSession(id);
    if (id === selectedSessionId) {
      setSelectedSessionId(null);
      safeSessionRemove(SESSION_KEY);
      setMobilePane('list');
    }
  }, [archiveSession, selectedSessionId]);

  const handleDeleteSession = useCallback(async (id) => {
    await deleteSession(id);
    if (id === selectedSessionId) {
      setSelectedSessionId(null);
      safeSessionRemove(SESSION_KEY);
      setMobilePane('list');
    }
  }, [deleteSession, selectedSessionId]);

  const handleSend = useCallback((text) => {
    sendStream(text);
  }, [sendStream]);

  const handleBack = useCallback(() => {
    setMobilePane('list');
  }, []);

  const transitionDuration = prefersReduced ? 0 : durations['duration-drawer'];
  const transitionEasing = prefersReduced ? 'step-start' : easings['ease-out-emphasized'];

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        overflow: 'hidden',
        backgroundColor: 'var(--pt-content-bg-hex, #f5f5f4)',
      }}
    >
      {/* Desktop layout: side-by-side */}
      <div className="hidden md:flex" style={{ width: '100%', height: '100%' }}>
        {/* Session rail — 280px fixed */}
        <div style={{ width: 280, flexShrink: 0, height: '100%', overflow: 'hidden' }}>
          <SessionListRail
            sessions={sessions}
            selectedId={selectedSessionId}
            onSelect={handleSelectSession}
            onNew={handleNewChat}
            onRename={renameSession}
            onArchive={handleArchiveSession}
            onDelete={handleDeleteSession}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            loading={sessionsLoading}
          />
        </div>

        {/* Thread panel — flex-1 */}
        <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
          <ChatThreadPanel
            sessionId={selectedSessionId}
            messages={messages}
            loading={messagesLoading}
            sending={sending}
            streaming={streaming}
            streamingText={streamingText}
            rateLimitError={rateLimitError}
            onSend={handleSend}
            onBack={handleBack}
            isMobile={false}
          />
        </div>
      </div>

      {/* Mobile layout: single-pane with slide */}
      <div
        className="flex md:hidden"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Session rail pane */}
        <div
          aria-hidden={mobilePane !== 'list'}
          style={{
            position: 'absolute',
            inset: 0,
            transform: mobilePane === 'list' ? 'translateX(0)' : 'translateX(-100%)',
            transition: `transform ${transitionDuration}ms ${transitionEasing}`,
            visibility: mobilePane === 'list' ? 'visible' : 'hidden',
          }}
        >
          <SessionListRail
            sessions={sessions}
            selectedId={selectedSessionId}
            onSelect={handleSelectSession}
            onNew={handleNewChat}
            onRename={renameSession}
            onArchive={handleArchiveSession}
            onDelete={handleDeleteSession}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            loading={sessionsLoading}
          />
        </div>

        {/* Thread panel pane */}
        <div
          aria-hidden={mobilePane !== 'thread'}
          style={{
            position: 'absolute',
            inset: 0,
            transform: mobilePane === 'thread' ? 'translateX(0)' : 'translateX(100%)',
            transition: `transform ${transitionDuration}ms ${transitionEasing}`,
            visibility: mobilePane === 'thread' ? 'visible' : 'hidden',
          }}
        >
          <ChatThreadPanel
            sessionId={selectedSessionId}
            messages={messages}
            loading={messagesLoading}
            sending={sending}
            streaming={streaming}
            streamingText={streamingText}
            rateLimitError={rateLimitError}
            onSend={handleSend}
            onBack={handleBack}
            isMobile={true}
          />
        </div>
      </div>
    </div>
  );
}
