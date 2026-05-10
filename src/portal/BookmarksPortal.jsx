import React from 'react';

/**
 * BookmarksPortal — editorial-index for saved items.
 *
 * A-10 (3.7-rev): single-line entries `source-module · quote-or-note-preview · timestamp`
 *   grouped by collection, no tile thumbnails, no card chrome.
 * A-11: rest-permission empty-state copy.
 * 3.18: inline-start/inline-end logical properties throughout.
 *
 * Wave 7 design pass: editorial header (eyebrow + Playfair italic), warmer
 * empty-state copy register, refined list-item rhythm (baseline-aligned
 * source + timestamp meta, increased breathing room between entries).
 *
 * Live data wiring deferred to Wave 6D (migration 014 required).
 */
export default function BookmarksPortal() {
  // Stub data — replace with useHighlights/useNotes query in Wave 6D
  const collections = [];
  const flatItems = [];

  return (
    <div className="px-4 sm:px-8 lg:px-12 py-10 sm:py-16 max-w-[960px] mx-auto w-full">
      {/* Wave 7: editorial header — eyebrow + Playfair italic title */}
      <header className="mb-12 max-w-2xl">
        <p
          style={{
            fontFamily: '"Outfit", sans-serif',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'var(--pt-text-muted-hex, #57534e)',
            margin: '0 0 14px',
          }}
        >
          What you&rsquo;ve kept
        </p>
        <h1
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 300,
            fontSize: 'clamp(34px, 4.5vw, 48px)',
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            color: 'var(--pt-text-primary-hex, #1c1917)',
            margin: '0 0 12px',
          }}
        >
          Saved
        </h1>
        <p
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 17,
            lineHeight: 1.55,
            color: 'var(--pt-text-muted-hex, #57534e)',
            margin: 0,
          }}
        >
          Highlights and notes from across your modules.
        </p>
      </header>

      {flatItems.length === 0 ? (
        /* A-11 rest-permission empty state — warm, no "Get started!" CTA */
        <p
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 19,
            lineHeight: 1.6,
            color: 'var(--pt-text-muted-hex, #57534e)',
            maxWidth: 520,
          }}
        >
          Nothing saved yet &mdash; that&rsquo;s okay.
        </p>
      ) : collections.length > 0 ? (
        /* Grouped by collection (A-10) */
        <div className="space-y-12">
          {collections.map((col) => (
            <section key={col.id} aria-label={col.name}>
              <h2
                style={{
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--pt-text-muted-hex, #57534e)',
                  margin: '0 0 16px',
                }}
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
 * BookmarkList — single-line editorial entries per A-10.
 * Format: source-module · quote-or-note-preview (120ch max) · timestamp
 * No tile thumbnails, no card chrome per 3.7-rev.
 */
function BookmarkList({ items }) {
  return (
    <ul
      className="divide-y"
      style={{ borderColor: 'var(--pt-border-soft-hex, #e7e5e4)' }}
    >
      {items.map((item) => (
        <li
          key={item.id}
          className="py-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 transition-colors duration-150"
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = 'var(--pt-elevation-warm-hex, #faf7f2)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = 'transparent')
          }
        >
          {/* source-module — accent eyebrow */}
          <span
            className="shrink-0"
            style={{
              fontFamily: '"Outfit", sans-serif',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--pt-primary-accent-hex, #B96A5F)',
            }}
          >
            {item.sourceModule}
          </span>
          {/* quote-or-note-preview, 120ch max */}
          <span
            className="flex-1 min-w-0 truncate"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 400,
              fontSize: 16,
              lineHeight: 1.5,
              color: 'var(--pt-text-primary-hex, #1c1917)',
            }}
            title={item.preview}
          >
            {item.preview?.slice(0, 120) || '—'}
          </span>
          <span
            className="shrink-0 ms-auto"
            style={{
              fontFamily: '"Outfit", sans-serif',
              fontSize: 11,
              letterSpacing: '0.04em',
              color: 'var(--pt-text-quiet-hex, #6b6462)',
            }}
          >
            {item.timestamp}
          </span>
        </li>
      ))}
    </ul>
  );
}
