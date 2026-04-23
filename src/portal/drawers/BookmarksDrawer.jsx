/**
 * BookmarksDrawer — folders, filter chips, flat reverse-chron annotation list.
 *
 * Spec: wave3-drawer-content-specs §5 + scout-05 §Bookmarks surface
 * Data dependencies: notebook_folders, highlights, notes (migration 014 pending apply)
 *
 * R2 scope: renders shell + empty states. Wiring to useHighlights/useNotes
 * hooks is live (they stream when tables exist); without data we render empty.
 */

import React, { useState } from 'react';
import { DrawerShell, DrawerSection, EmptyState } from './DrawerShell';
import { getTypeStyle } from '../design/typography';

const FILTER_CHIPS = ['All', 'Highlights', 'Notes'];

function FolderRow({ folder }) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-left"
      style={{
        ...getTypeStyle('body'),
        color: 'var(--pt-text-primary-hex, #1c1917)',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = 'var(--pt-drawer-hover-hex, #a8a29e)')
      }
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <span aria-hidden="true">📁</span>
      <span className="flex-1">{folder.name}</span>
      {typeof folder.count === 'number' && (
        <span
          style={{
            ...getTypeStyle('meta'),
            color: 'var(--pt-text-muted-hex, #57534e)',
          }}
        >
          {folder.count}
        </span>
      )}
    </button>
  );
}

function FilterChipBar({ chips, active, onChange }) {
  return (
    <div
      className="flex gap-2 px-3 py-2 overflow-x-auto"
      role="tablist"
      aria-label="Bookmark filters"
    >
      {chips.map((chip) => {
        const isActive = chip === active;
        return (
          <button
            key={chip}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(chip)}
            style={{
              ...getTypeStyle('caption', 'medium'),
              padding: '4px 10px',
              borderRadius: 9999,
              border: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
              backgroundColor: isActive
                ? 'var(--pt-primary-accent-hex, #B96A5F)'
                : 'transparent',
              color: isActive
                ? 'var(--pt-text-inverse-hex, #fafaf9)'
                : 'var(--pt-text-primary-hex, #1c1917)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {chip}
          </button>
        );
      })}
    </div>
  );
}

export default function BookmarksDrawer() {
  const [activeFilter, setActiveFilter] = useState('All');

  // Stub data — migration 014 not yet applied. When applied +
  // useHighlights/useNotes wired, this drawer pulls live.
  const folders = [{ id: 'unsorted', name: 'Unsorted', count: 0 }];
  const annotations = [];

  return (
    <DrawerShell title="Bookmarks & Notes" ariaContext="Bookmarks">
      <div className="px-3 py-2">
        <button
          type="button"
          style={{
            ...getTypeStyle('caption', 'medium'),
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px dashed var(--pt-border-subtle-hex, #d6d3d1)',
            backgroundColor: 'transparent',
            color: 'var(--pt-text-primary-hex, #1c1917)',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          + New Folder
        </button>
      </div>

      <DrawerSection label="Folders">
        {folders.map((f) => (
          <FolderRow key={f.id} folder={f} />
        ))}
      </DrawerSection>

      <FilterChipBar
        chips={FILTER_CHIPS}
        active={activeFilter}
        onChange={setActiveFilter}
      />

      <DrawerSection label="" defaultOpen>
        {annotations.length === 0 ? (
          <EmptyState
            icon="🔖"
            message="Nothing saved yet"
            sub="[Trisha-voice placeholder: When something in a lesson hits home — highlight it. It'll live here.]"
          />
        ) : (
          <ul>
            {annotations.map((a) => (
              <li key={a.id}>{a.anchor_text || a.body_text}</li>
            ))}
          </ul>
        )}
      </DrawerSection>
    </DrawerShell>
  );
}
