/**
 * AdminFilterBar — always-visible filter chips for admin list views.
 *
 * Spec: portal-admin-completion-v1 Wave 3.1 design spec §2 (read-only)
 *   - Always-visible chips (NOT collapsed); pinned chips render leftmost
 *   - useSearchParams URL persistence; aria-pressed per chip
 *   - Multi-select count badge when ≥2 values; date-range popover (role=dialog
 *     + focus trap + Escape revert); search debounced 300ms; reset-all "×"
 *   - Mobile horizontal-scroll; Tailwind utility classes only
 *
 * Chip variant implementations are in ./_FilterChips.jsx (private). Splitting
 * keeps this primitive entry ≤300 lines per design-system-lead constraint.
 *
 * TODO(tokens.js gaps — §6 wave-3.1-primitives-spec.md): accentPrimary →
 * --pt-primary-accent; adminCardBg → --pt-elevation-1; borderMuted →
 * --pt-border-subtle; statusNeutral → --pt-text-muted. No new tokens added
 * per design-system-lead §2.
 *
 * @typedef {object} AdminFilterBarFilterOption
 * @property {string} value
 * @property {string} label
 *
 * @typedef {object} AdminFilterBarFilter
 * @property {string} key
 * @property {string} label
 * @property {'select'|'multi-select'|'date-range'|'search'} type
 * @property {AdminFilterBarFilterOption[]} [options]
 * @property {string|string[]} [defaultValue]
 * @property {boolean} [pinned]
 *
 * @typedef {object} AdminFilterBarProps
 * @property {AdminFilterBarFilter[]} filters
 * @property {(filterKey: string, value: any) => void} [onChange]
 * @property {string} [className]
 */

import React, { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SelectChip,
  MultiSelectChip,
  DateRangeChip,
  SearchChip,
} from './_FilterChips';

function FilterChip({ filter, rawValue, onCommit }) {
  if (filter.type === 'search') return <SearchChip filter={filter} rawValue={rawValue} onCommit={onCommit} />;
  if (filter.type === 'date-range') return <DateRangeChip filter={filter} rawValue={rawValue} onCommit={onCommit} />;
  if (filter.type === 'multi-select') return <MultiSelectChip filter={filter} rawValue={rawValue} onCommit={onCommit} />;
  return <SelectChip filter={filter} rawValue={rawValue} onCommit={onCommit} />;
}

/** @param {AdminFilterBarProps} props */
export default function AdminFilterBar({ filters, onChange, className = '' }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const orderedFilters = useMemo(() => {
    if (!Array.isArray(filters)) return [];
    const pinned = filters.filter((f) => f.pinned);
    const rest = filters.filter((f) => !f.pinned);
    return [...pinned, ...rest];
  }, [filters]);

  const anyActive = useMemo(
    () =>
      orderedFilters.some((f) => {
        const raw = searchParams.get(f.key);
        return raw != null && raw !== '';
      }),
    [orderedFilters, searchParams]
  );

  const setParam = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
          next.delete(key);
        } else if (Array.isArray(value)) {
          next.set(key, value.join(','));
        } else {
          next.set(key, String(value));
        }
        return next;
      });
      onChange?.(key, value);
    },
    [setSearchParams, onChange]
  );

  const resetAll = useCallback(() => {
    setSearchParams(new URLSearchParams());
    orderedFilters.forEach((f) => onChange?.(f.key, null));
  }, [setSearchParams, orderedFilters, onChange]);

  const wrapperClass = ['flex', 'items-center', 'gap-2', 'overflow-x-auto', 'py-2', 'px-1', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={wrapperClass}
      style={{ WebkitOverflowScrolling: 'touch' }}
      role="toolbar"
      aria-label="Filters"
    >
      {orderedFilters.map((filter) => (
        <FilterChip
          key={filter.key}
          filter={filter}
          rawValue={searchParams.get(filter.key)}
          onCommit={(value) => setParam(filter.key, value)}
        />
      ))}
      {anyActive && (
        <button
          type="button"
          onClick={resetAll}
          aria-label="Clear all filters"
          className="flex-shrink-0 inline-flex items-center justify-center rounded-full text-sm border-0 cursor-pointer"
          style={{
            width: '24px',
            height: '24px',
            backgroundColor: 'transparent',
            color: 'var(--pt-text-muted)',
          }}
        >
          {'×'}
        </button>
      )}
    </div>
  );
}
