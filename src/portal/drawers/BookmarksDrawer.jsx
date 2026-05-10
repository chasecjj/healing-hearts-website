/**
 * BookmarksDrawer — pure sub-tab navigation (Wave 9 architectural pivot).
 *
 * Wave 9 E3: search input + filter chips + new-folder stub REMOVED. Drawer is
 * sub-nav only — folders and recent annotations as Link-routed list items.
 * Search + filter affordances live on the main /portal/bookmarks page.
 *
 * Spec amendment: see ./reports/wave-9-spec-amendment.md
 *
 * Data dependencies: notebook_folders, highlights, notes (migration 014).
 * Without data we render empty-state per A-11 rest-permission register.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { DrawerShell, DrawerSection, EmptyState } from './DrawerShell';
import { getTypeStyle } from '../design/typography';

function FolderRow({ folder }) {
  // Routes to /portal/bookmarks?folder=<slug>; the main page reads ?folder= param.
  return (
    <Link
      to={{
        pathname: '/portal/bookmarks',
        search: `?folder=${encodeURIComponent(folder.id)}`,
      }}
      className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-left"
      style={{
        ...getTypeStyle('body'),
        color: 'var(--pt-text-primary-hex, #1c1917)',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        textDecoration: 'none',
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
    </Link>
  );
}

export default function BookmarksDrawer() {
  // Stub data — migration 014 not yet applied. When applied +
  // useHighlights/useNotes wired, this drawer pulls live.
  const folders = [{ id: 'unsorted', name: 'Unsorted', count: 0 }];
  const annotations = [];

  return (
    <DrawerShell title="Bookmarks & Notes" ariaContext="Bookmarks" drawerId="bookmarks">
      <DrawerSection label="Folders">
        {folders.map((f) => (
          <FolderRow key={f.id} folder={f} />
        ))}
      </DrawerSection>

      <DrawerSection label="Recent" defaultOpen>
        {annotations.length === 0 ? (
          <EmptyState
            icon="🔖"
            message="Nothing saved yet"
            sub="When something in a lesson hits home — highlight it. It'll live here."
          />
        ) : (
          <ul className="px-1">
            {annotations.map((a) => (
              <li key={a.id} className="px-3 py-1.5">
                {a.anchor_text || a.body_text}
              </li>
            ))}
          </ul>
        )}
      </DrawerSection>
    </DrawerShell>
  );
}
