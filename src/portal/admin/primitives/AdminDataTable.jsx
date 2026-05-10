/**
 * AdminDataTable — semantic-table primitive for admin list views.
 *
 * Spec: portal-admin-completion-v1 Wave 3.1 design spec §1 (read-only)
 *   - 40px row height (scout-03 midpoint between Stripe 48px / Linear 34px)
 *   - Sticky <thead>; max 7 cols (over-cap → console.warn + truncate, DS-04)
 *   - Sortable headers via aria-sort + client-side comparator (local state)
 *   - Hover-reveal checkbox in left gutter when bulkActions prop present
 *   - Full-row click target; role="button" + aria-label when onRowClick set
 *   - Empty + loading states; skeleton honors prefers-reduced-motion (DS-10)
 *   - Tailwind utility classes only; colors via CSS vars from tokens.js
 *
 * Card-chrome carve-out (decision-3.11): admin surfaces intentionally use
 * card-chrome for scan-density; learner sanctuary surfaces do not.
 *
 * TODO(tokens.js gaps — §6 wave-3.1-primitives-spec.md): adminCardBg →
 * --pt-elevation-1; adminCardHover → --pt-elevation-2; borderMuted →
 * --pt-border-subtle; statusNeutral → --pt-flavor-admin; shimmerKeyframe →
 * CSS-only pulse (D10 prohibits shimmer); fontTabular → tabular-nums.
 * No new tokens added per design-system-lead §2.
 *
 * @typedef {object} AdminDataTableColumn
 * @property {string} key
 * @property {string} label
 * @property {(row: any) => React.ReactNode} [render]
 * @property {boolean} [sortable]
 * @property {string}  [width]
 * @property {'left'|'right'|'center'} [align]
 *
 * @typedef {object} AdminDataTableBulkAction
 * @property {string} key
 * @property {string} label
 * @property {(rows: any[]) => void} onAction
 *
 * @typedef {object} AdminDataTableProps
 * @property {AdminDataTableColumn[]} columns
 * @property {Array<Record<string, any>>} rows
 * @property {(row: any) => string} rowKey
 * @property {(row: any) => void} [onRowClick]
 * @property {React.ReactNode} [emptyState]
 * @property {boolean} [loading]
 * @property {string} [className]
 * @property {AdminDataTableBulkAction[]} [bulkActions]
 */

import React, { useMemo, useState } from 'react';

const MAX_COLUMNS = 7;

const PULSE_KEYFRAMES = `
@keyframes pt-admin-skeleton-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
@media (prefers-reduced-motion: reduce) {
  .pt-admin-skeleton-cell {
    animation: none !important;
    opacity: 0.6 !important;
  }
}
`;

/** @param {AdminDataTableProps} props */
export default function AdminDataTable({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyState,
  loading = false,
  className = '',
  bulkActions,
}) {
  const visibleColumns = useMemo(() => {
    if (!Array.isArray(columns)) return [];
    if (columns.length > MAX_COLUMNS) {
      // eslint-disable-next-line no-console
      console.warn('[AdminDataTable] Column count exceeds 7; truncating to first 7.');
      return columns.slice(0, MAX_COLUMNS);
    }
    return columns;
  }, [columns]);

  const showCheckbox = Array.isArray(bulkActions) && bulkActions.length > 0;
  const [sort, setSort] = useState({ key: null, dir: 'asc' });

  const sortedRows = useMemo(() => {
    if (!sort.key) return rows;
    const sorted = [...rows].sort((a, b) => {
      const av = a?.[sort.key];
      const bv = b?.[sort.key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return av - bv;
      return String(av).localeCompare(String(bv));
    });
    return sort.dir === 'desc' ? sorted.reverse() : sorted;
  }, [rows, sort]);

  const handleSort = (colKey) => {
    setSort((prev) => {
      if (prev.key !== colKey) return { key: colKey, dir: 'asc' };
      if (prev.dir === 'asc') return { key: colKey, dir: 'desc' };
      return { key: null, dir: 'asc' };
    });
  };

  const ariaSortFor = (colKey) =>
    sort.key !== colKey ? 'none' : sort.dir === 'asc' ? 'ascending' : 'descending';
  const sortGlyph = (colKey) =>
    sort.key !== colKey ? '↕' : sort.dir === 'asc' ? '↑' : '↓';

  // Card-chrome wrapper (decision-3.11 carve-out)
  const wrapperClass = ['pt-admin-table-wrapper', 'overflow-x-auto', 'overflow-y-auto', 'rounded-lg', 'border', className]
    .filter(Boolean)
    .join(' ');
  const wrapperStyle = {
    backgroundColor: 'var(--pt-elevation-1)',
    borderColor: 'var(--pt-border-subtle)',
    color: 'var(--pt-text-primary)',
  };

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      <style>{PULSE_KEYFRAMES}</style>
      <table
        className="w-full border-collapse text-left tabular-nums"
        aria-busy={loading ? 'true' : 'false'}
      >
        <thead
          className="sticky top-0 z-10"
          style={{
            backgroundColor: 'var(--pt-elevation-1)',
            borderBottom: '1px solid var(--pt-border-subtle)',
          }}
        >
          <tr style={{ height: '40px' }}>
            {showCheckbox && <th scope="col" style={{ width: '4px' }} aria-label="Row selection" />}
            {visibleColumns.map((col) => {
              const thStyle = {
                width: col.width,
                textAlign: col.align || 'left',
                color: 'var(--pt-text-muted)',
                borderBottom: '1px solid var(--pt-border-subtle)',
              };
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={col.sortable ? ariaSortFor(col.key) : undefined}
                  className="px-3 text-xs font-medium uppercase tracking-wide"
                  style={thStyle}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1 bg-transparent border-0 p-0 cursor-pointer uppercase tracking-wide text-xs font-medium"
                      style={{ color: 'var(--pt-text-muted)' }}
                    >
                      <span>{col.label}</span>
                      <span aria-hidden="true">{sortGlyph(col.key)}</span>
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading && renderSkeletonRows(visibleColumns, showCheckbox)}
          {!loading && sortedRows.length === 0 && (
            <tr>
              <td
                colSpan={visibleColumns.length + (showCheckbox ? 1 : 0)}
                className="px-3 py-6 text-center"
                style={{ color: 'var(--pt-text-muted)' }}
              >
                {emptyState || <p role="status" className="m-0">No data</p>}
              </td>
            </tr>
          )}
          {!loading &&
            sortedRows.length > 0 &&
            sortedRows.map((row) => (
              <DataRow
                key={rowKey(row)}
                row={row}
                columns={visibleColumns}
                onRowClick={onRowClick}
                showCheckbox={showCheckbox}
              />
            ))}
        </tbody>
      </table>
    </div>
  );
}

function DataRow({ row, columns, onRowClick, showCheckbox }) {
  const [hover, setHover] = useState(false);
  const clickable = typeof onRowClick === 'function';
  const ariaLabel = clickable ? `View ${row?.title ?? row?.name ?? ''}`.trim() : undefined;

  return (
    <tr
      onClick={clickable ? () => onRowClick(row) : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      role={clickable ? 'button' : undefined}
      aria-label={ariaLabel || undefined}
      style={{
        height: '40px',
        backgroundColor: hover ? 'var(--pt-elevation-2)' : 'transparent',
        borderBottom: '1px solid var(--pt-border-subtle)',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'background-color 120ms ease',
      }}
    >
      {showCheckbox && (
        <td className="px-1" style={{ width: '4px' }}>
          <input
            type="checkbox"
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
            style={{ opacity: hover ? 1 : 0, transition: 'opacity 120ms ease' }}
          />
        </td>
      )}
      {columns.map((col) => (
        <td
          key={col.key}
          className="px-3 py-0 text-sm"
          style={{
            textAlign: col.align || 'left',
            color: 'var(--pt-text-primary)',
            verticalAlign: 'middle',
          }}
        >
          {typeof col.render === 'function' ? col.render(row) : row?.[col.key]}
        </td>
      ))}
    </tr>
  );
}

function renderSkeletonRows(columns, showCheckbox) {
  const rows = [];
  for (let i = 0; i < 5; i += 1) {
    rows.push(
      <tr
        key={`pt-admin-skeleton-${i}`}
        style={{ height: '40px', borderBottom: '1px solid var(--pt-border-subtle)' }}
      >
        {showCheckbox && <td style={{ width: '4px' }} />}
        {columns.map((col) => (
          <td key={col.key} className="px-3">
            <div
              className="pt-admin-skeleton-cell rounded"
              style={{
                height: '12px',
                width: '70%',
                backgroundColor: 'var(--pt-border-subtle)',
                animation: 'pt-admin-skeleton-pulse 1.5s ease-in-out infinite',
              }}
            />
          </td>
        ))}
      </tr>
    );
  }
  return rows;
}
