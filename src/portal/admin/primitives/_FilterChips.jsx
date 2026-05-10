/**
 * _FilterChips — private chip implementations for AdminFilterBar (spec §2).
 * Underscore prefix marks this internal; consume AdminFilterBar, not this.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const SEARCH_DEBOUNCE_MS = 300;

export function chipStyles(active) {
  return {
    flexShrink: 0,
    borderRadius: '9999px',
    padding: '4px 12px',
    fontSize: '13px',
    lineHeight: '1.4',
    cursor: 'pointer',
    border: '1px solid var(--pt-border-subtle)',
    backgroundColor: active ? 'var(--pt-primary-accent)' : 'var(--pt-elevation-1)',
    color: active ? 'var(--pt-text-inverse)' : 'var(--pt-text-primary)',
    transition: 'background-color 120ms ease, color 120ms ease',
  };
}

export function SelectChip({ filter, rawValue, onCommit }) {
  const value = rawValue ?? filter.defaultValue ?? '';
  const active = value !== '' && value != null;
  const selectedLabel = filter.options?.find((o) => o.value === value)?.label || filter.label;

  return (
    <label
      aria-label={`Filter by ${filter.label}: ${selectedLabel}`}
      style={chipStyles(active)}
      data-chip
      data-pinned={filter.pinned ? 'true' : 'false'}
    >
      <span className="mr-1" aria-hidden="true">{filter.label}:</span>
      <select
        value={value || ''}
        onChange={(e) => onCommit(e.target.value || null)}
        aria-pressed={active ? 'true' : 'false'}
        className="bg-transparent border-0 outline-none cursor-pointer"
        style={{ color: 'inherit' }}
      >
        <option value="">{filter.label}</option>
        {filter.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}

export function MultiSelectChip({ filter, rawValue, onCommit }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedValues = useMemo(() => {
    if (rawValue == null || rawValue === '') {
      return Array.isArray(filter.defaultValue) ? filter.defaultValue : [];
    }
    return rawValue.split(',').filter(Boolean);
  }, [rawValue, filter.defaultValue]);

  const active = selectedValues.length > 0;
  const countBadge = selectedValues.length >= 2 ? `${selectedValues.length} selected` : null;

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const toggleValue = (val) => {
    const next = selectedValues.includes(val)
      ? selectedValues.filter((v) => v !== val)
      : [...selectedValues, val];
    onCommit(next);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-shrink-0"
      data-chip
      data-pinned={filter.pinned ? 'true' : 'false'}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-pressed={active ? 'true' : 'false'}
        aria-label={`Filter by ${filter.label}: ${selectedValues.length} selected`}
        aria-expanded={open}
        style={chipStyles(active)}
      >
        <span>{filter.label}</span>
        {countBadge && (
          <span
            className="ml-2 text-xs"
            style={{ color: active ? 'var(--pt-text-inverse)' : 'var(--pt-text-muted)' }}
          >
            {countBadge}
          </span>
        )}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 mt-2 rounded-lg shadow z-20 p-2 min-w-[180px]"
          style={{ backgroundColor: 'var(--pt-elevation-2)', border: '1px solid var(--pt-border-subtle)' }}
        >
          {filter.options?.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-2 py-1 cursor-pointer text-sm"
              style={{ color: 'var(--pt-text-primary)' }}
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(opt.value)}
                onChange={() => toggleValue(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function parseRange(raw) {
  if (!raw || typeof raw !== 'string') return { start: '', end: '' };
  const [start = '', end = ''] = raw.split('|');
  return { start, end };
}

export function DateRangeChip({ filter, rawValue, onCommit }) {
  const [open, setOpen] = useState(false);
  const initialRange = useMemo(() => parseRange(rawValue), [rawValue]);
  const [start, setStart] = useState(initialRange.start);
  const [end, setEnd] = useState(initialRange.end);
  const popoverRef = useRef(null);
  const firstFieldRef = useRef(null);

  const active = Boolean(initialRange.start || initialRange.end);
  const label = active ? `${initialRange.start || '…'} – ${initialRange.end || '…'}` : filter.label;

  useEffect(() => {
    if (!open) return undefined;
    firstFieldRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setStart(initialRange.start);
        setEnd(initialRange.end);
        setOpen(false);
      } else if (e.key === 'Tab') {
        const root = popoverRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll('input,button');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, initialRange.start, initialRange.end]);

  const apply = () => {
    onCommit(start || end ? `${start || ''}|${end || ''}` : null);
    setOpen(false);
  };

  const inputStyle = {
    border: '1px solid var(--pt-border-strong)',
    color: 'var(--pt-text-primary)',
    backgroundColor: 'var(--pt-elevation-2)',
  };

  return (
    <div className="relative flex-shrink-0" data-chip data-pinned={filter.pinned ? 'true' : 'false'}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-pressed={active ? 'true' : 'false'}
        aria-label={`Filter by ${filter.label}: ${label}`}
        aria-expanded={open}
        style={chipStyles(active)}
      >
        {label}
      </button>
      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={`${filter.label} range`}
          className="absolute left-0 mt-2 rounded-lg shadow z-20 p-3"
          style={{
            backgroundColor: 'var(--pt-elevation-2)',
            border: '1px solid var(--pt-border-subtle)',
            minWidth: '240px',
          }}
        >
          <div className="flex flex-col gap-2">
            <label className="flex flex-col text-xs" style={{ color: 'var(--pt-text-muted)' }}>
              Start
              <input
                ref={firstFieldRef}
                type="date"
                value={start || ''}
                onChange={(e) => setStart(e.target.value)}
                className="mt-1 px-2 py-1 rounded text-sm"
                style={inputStyle}
              />
            </label>
            <label className="flex flex-col text-xs" style={{ color: 'var(--pt-text-muted)' }}>
              End
              <input
                type="date"
                value={end || ''}
                onChange={(e) => setEnd(e.target.value)}
                className="mt-1 px-2 py-1 rounded text-sm"
                style={inputStyle}
              />
            </label>
            <button
              type="button"
              onClick={apply}
              className="mt-1 rounded text-sm cursor-pointer"
              style={{
                padding: '4px 10px',
                backgroundColor: 'var(--pt-primary-accent)',
                color: 'var(--pt-text-inverse)',
                border: '1px solid var(--pt-border-subtle)',
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SearchChip({ filter, rawValue, onCommit }) {
  const [local, setLocal] = useState(rawValue ?? filter.defaultValue ?? '');
  const timeoutRef = useRef(null);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);
  useEffect(() => { setLocal(rawValue ?? ''); }, [rawValue]);

  const handleChange = useCallback(
    (e) => {
      const value = e.target.value;
      setLocal(value);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => onCommit(value || null), SEARCH_DEBOUNCE_MS);
    },
    [onCommit]
  );

  const inputId = `pt-admin-search-${filter.key}`;
  const active = Boolean(local);

  return (
    <div className="flex-shrink-0" data-chip data-pinned={filter.pinned ? 'true' : 'false'}>
      <label htmlFor={inputId} className="sr-only">{filter.label}</label>
      <input
        id={inputId}
        type="search"
        value={local}
        onChange={handleChange}
        placeholder={filter.label}
        aria-pressed={active ? 'true' : 'false'}
        className="rounded-full text-sm outline-none"
        style={{
          padding: '4px 12px',
          border: '1px solid var(--pt-border-subtle)',
          backgroundColor: 'var(--pt-elevation-1)',
          color: 'var(--pt-text-primary)',
          minWidth: '160px',
        }}
      />
    </div>
  );
}
