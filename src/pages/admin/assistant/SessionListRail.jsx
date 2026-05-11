/**
 * SessionListRail — left rail showing conversation list with search + per-row actions.
 *
 * Search: client-side substring on title + last_message_preview.
 * Per-row menu: Rename / Archive / Delete (Delete uses InlineConfirm).
 * Skeleton loading: 3 placeholder rows (shimmer excluded per tokens.js constraint).
 *
 * Locked-contract ref: §5.2 <SessionListRail>
 */

import { useState } from 'react';
import { PhedrisIcon } from '../../../layouts/portalNav.config';
import InlineConfirm from '../../../portal/components/InlineConfirm';
import { getTypeStyle } from '../../../portal/design/typography';
import { useReducedMotion } from '../../../portal/design/motion';

/**
 * Simple relative-time formatter — no date-fns needed for ≤5 cases.
 * @param {string|null} iso
 */
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

function SkeletonRow() {
  return (
    <div
      style={{
        height: 56,
        borderRadius: 8,
        backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)',
        margin: '4px 8px',
      }}
      aria-hidden="true"
    />
  );
}

function RowMenu({ onRename, onArchive, onDelete }) {
  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  if (confirmingDelete) {
    return (
      <div className="px-1" onClick={(e) => e.stopPropagation()}>
        <InlineConfirm
          message="Delete this conversation? This cannot be undone."
          onConfirm={() => { setConfirmingDelete(false); onDelete(); }}
          onCancel={() => setConfirmingDelete(false)}
        />
      </div>
    );
  }

  if (renaming) {
    return (
      <div
        style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 8px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { onRename(renameValue); setRenaming(false); }
            if (e.key === 'Escape') setRenaming(false);
          }}
          style={{
            flex: 1,
            border: '1px solid var(--pt-border-strong-hex, #78716c)',
            borderRadius: 4,
            padding: '3px 6px',
            ...getTypeStyle('caption'),
            fontFamily: 'inherit',
          }}
          aria-label="New title"
        />
        <button
          onClick={() => { onRename(renameValue); setRenaming(false); }}
          style={{
            ...getTypeStyle('caption'),
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: 'var(--pt-primary-accent-hex, #B96A5F)',
            padding: '2px 4px',
          }}
        >
          Save
        </button>
        <button
          onClick={() => setRenaming(false)}
          style={{
            ...getTypeStyle('caption'),
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: 'var(--pt-text-muted-hex, #57534e)',
            padding: '2px 4px',
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        style={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          padding: '4px 6px',
          borderRadius: 4,
          color: 'var(--pt-text-muted-hex, #57534e)',
          ...getTypeStyle('body'),
          lineHeight: 1,
        }}
      >
        ⋯
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            zIndex: 50,
            backgroundColor: 'var(--pt-elevation-2-hex, #ffffff)',
            border: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            minWidth: 140,
            padding: '4px 0',
          }}
        >
          {[
            {
              label: 'Rename', action: () => {
                setOpen(false);
                setRenameValue('');
                setRenaming(true);
              }
            },
            {
              label: 'Archive', action: () => {
                setOpen(false);
                onArchive();
              }
            },
            {
              label: 'Delete', action: () => {
                setOpen(false);
                setConfirmingDelete(true);
              },
              danger: true
            },
          ].map(({ label, action, danger }) => (
            <button
              key={label}
              role="menuitem"
              onClick={(e) => { e.stopPropagation(); action(); }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: '7px 14px',
                ...getTypeStyle('body'),
                color: danger
                  ? 'var(--pt-danger-hex, #b91c1c)'
                  : 'var(--pt-text-primary-hex, #1c1917)',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--pt-elevation-1-hex, #e7e5e4)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = 'transparent')
              }
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SessionListRail({
  sessions,
  selectedId,
  onSelect,
  onNew,
  onRename,
  onArchive,
  onDelete,
  searchQuery,
  onSearchChange,
  loading,
}) {
  const prefersReduced = useReducedMotion();

  // Client-side search filter
  const filtered = searchQuery
    ? sessions.filter((s) => {
        const q = searchQuery.toLowerCase();
        return (
          (s.title ?? '').toLowerCase().includes(q) ||
          (s.last_message_preview ?? '').toLowerCase().includes(q)
        );
      })
    : sessions;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        borderRight: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
      }}
    >
      {/* Top bar: search + new chat button */}
      <div
        style={{
          padding: '12px 12px 8px',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexShrink: 0,
          borderBottom: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
        }}
      >
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search conversations…"
          aria-label="Search conversations"
          style={{
            flex: 1,
            border: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
            borderRadius: 6,
            padding: '6px 10px',
            ...getTypeStyle('caption'),
            fontFamily: 'inherit',
            color: 'var(--pt-text-primary-hex, #1c1917)',
            backgroundColor: 'var(--pt-elevation-2-hex, #ffffff)',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--pt-focus-ring-hex, #B96A5F)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--pt-border-subtle-hex, #d6d3d1)';
          }}
        />
        <button
          onClick={onNew}
          aria-label="New chat"
          title="New chat"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            border: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
            borderRadius: 6,
            padding: '6px 10px',
            backgroundColor: 'var(--pt-elevation-2-hex, #ffffff)',
            cursor: 'pointer',
            ...getTypeStyle('caption', 'medium'),
            color: 'var(--pt-text-primary-hex, #1c1917)',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
            transition: prefersReduced ? 'none' : 'background-color 150ms ease',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = 'var(--pt-elevation-1-hex, #e7e5e4)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = 'var(--pt-elevation-2-hex, #ffffff)')
          }
        >
          <PhedrisIcon style={{ width: 14, height: 14 }} aria-hidden="true" />
          <span className="hidden sm:inline">New chat</span>
        </button>
      </div>

      {/* Session list */}
      <ul
        style={{ flex: 1, overflowY: 'auto', padding: '4px 0', margin: 0, listStyle: 'none' }}
        aria-label="Conversations"
      >
        {loading && filtered.length === 0 ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : filtered.length === 0 ? (
          <li
            style={{
              textAlign: 'center',
              padding: '32px 16px',
              ...getTypeStyle('caption'),
              color: 'var(--pt-text-quiet-hex, #6b6462)',
            }}
          >
            {searchQuery
              ? 'No conversations match your search.'
              : 'No conversations yet. Send a message to start.'}
          </li>
        ) : (
          filtered.map((session) => {
            const isActive = session.session_id === selectedId;
            const displayTitle =
              session.title ??
              session.last_message_preview?.slice(0, 60) ??
              'New conversation';

            return (
              <li key={session.session_id}>
                <div
                  onClick={() => onSelect(session.session_id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    cursor: 'pointer',
                    backgroundColor: isActive
                      ? 'var(--pt-drawer-active-bg-hex, #fafaf9)'
                      : 'transparent',
                    borderRadius: 8,
                    margin: '2px 4px',
                    transition: prefersReduced ? 'none' : 'background-color 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor =
                        'var(--pt-drawer-hover-hex, #a8a29e)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isActive
                      ? 'var(--pt-drawer-active-bg-hex, #fafaf9)'
                      : 'transparent';
                  }}
                  role="button"
                  tabIndex={0}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={displayTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(session.session_id);
                    }
                  }}
                >
                  {/* Text content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        ...getTypeStyle('body'),
                        color: 'var(--pt-text-primary-hex, #1c1917)',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {displayTitle}
                    </p>
                    <p
                      style={{
                        ...getTypeStyle('meta'),
                        color: 'var(--pt-text-muted-hex, #57534e)',
                        margin: 0,
                        marginTop: 2,
                      }}
                    >
                      {formatRelative(session.last_active)}
                    </p>
                  </div>

                  {/* Per-row action menu */}
                  <div
                    className="session-row-menu"
                    onClick={(e) => e.stopPropagation()}
                    style={{ flexShrink: 0 }}
                  >
                    <RowMenu
                      onRename={(title) => onRename(session.session_id, title)}
                      onArchive={() => onArchive(session.session_id)}
                      onDelete={() => onDelete(session.session_id)}
                    />
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
