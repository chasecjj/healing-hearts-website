import React from 'react';

/**
 * BookmarksPortal — editorial-index for saved items.
 *
 * A-10 (3.7-rev): single-line entries `source-module · quote-or-note-preview · timestamp`
 *   grouped by collection, no tile thumbnails, no card chrome.
 * A-11: rest-permission empty-state copy.
 * 3.18: inline-start/inline-end logical properties throughout.
 *
 * Live data wiring deferred to Wave 6D (migration 014 required).
 */
export default function BookmarksPortal() {
  // Stub data — replace with useHighlights/useNotes query in Wave 6D
  const collections = [];
  const flatItems = [];

  return (
    <div className="px-4 sm:px-8 lg:px-12 py-8 sm:py-16 max-w-[960px] mx-auto w-full">
      <h1
        className="font-drama font-bold mb-8"
        style={{ color: 'var(--pt-text-primary-hex, #1c1917)', fontSize: '2rem', lineHeight: 1.2 }}
      >
        Saved
      </h1>

      {flatItems.length === 0 ? (
        /* A-11 rest-permission empty state — no "Get started!" CTA */
        <p
          className="text-base leading-relaxed"
          style={{ color: 'var(--pt-text-muted-hex, #57534e)' }}
        >
          Nothing saved yet — that&apos;s okay.
        </p>
      ) : collections.length > 0 ? (
        /* Grouped by collection (A-10) */
        <div className="space-y-10">
          {collections.map((col) => (
            <section key={col.id} aria-label={col.name}>
              <h2
                className="font-outfit font-semibold text-sm uppercase tracking-widest mb-4"
                style={{ color: 'var(--pt-text-muted-hex, #57534e)' }}
              >
                {col.name}
              </h2>
              <BookmarkList items={col.items} />
            </section>
          ))}
        </div>
      ) : (
        /* Flat list — no collections yet (A-10) */
        <BookmarkList items={flatItems} />
      )}
    </div>
  );
}

/**
 * BookmarkList — renders single-line editorial entries per A-10.
 * Format: source-module · quote-or-note-preview (120ch max) · timestamp
 * No tile thumbnails, no card chrome per 3.7-rev.
 */
function BookmarkList({ items }) {
  return (
    <ul
      className="divide-y"
      style={{ borderColor: 'var(--pt-border-subtle-hex, #d6d3d1)' }}
    >
      {items.map((item) => (
        <li
          key={item.id}
          className="py-3 flex flex-wrap items-baseline gap-x-2 gap-y-1"
        >
          {/* source-module */}
          <span
            className="font-outfit font-semibold text-sm shrink-0"
            style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)' }}
          >
            {item.sourceModule}
          </span>
          <span
            className="text-xs select-none shrink-0"
            style={{ color: 'var(--pt-text-muted-hex, #57534e)' }}
            aria-hidden="true"
          >
            ·
          </span>
          {/* quote-or-note-preview, 120ch max */}
          <span
            className="text-sm leading-snug flex-1 min-w-0 truncate"
            style={{ color: 'var(--pt-text-primary-hex, #1c1917)' }}
            title={item.preview}
          >
            {item.preview?.slice(0, 120) || '—'}
          </span>
          <span
            className="text-xs shrink-0 ms-auto"
            style={{ color: 'var(--pt-text-muted-hex, #57534e)' }}
          >
            {item.timestamp}
          </span>
        </li>
      ))}
    </ul>
  );
}
