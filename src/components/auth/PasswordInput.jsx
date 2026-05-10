import React, { useState, useEffect, useId } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

/**
 * Wave-9 LOW-04 + MED-04 — shared password input with visibility toggle
 * and optional zxcvbn-ts strength meter.
 *
 * zxcvbn-ts loads lazily (dynamic import) on first keystroke so it doesn't
 * bloat the initial bundle (~13kb gz only when needed).
 *
 * Trauma-tone strength labels: starting / getting there / comfortable / strong.
 *
 * Props mirror native <input> for password fields, plus:
 *   - showStrength?: boolean   render meter under input (Signup, ResetPassword)
 *   - id, label, value, onChange, autoComplete, placeholder, minLength, required
 */
const STRENGTH_LABELS = ['starting', 'getting there', 'comfortable', 'strong'];
// Five thresholds (0-4 from zxcvbn) collapsed to four meter buckets:
// score 0 → bucket 0, score 1 → bucket 1, score 2 → bucket 2, score 3+ → bucket 3.
const STRENGTH_BUCKET = [0, 1, 2, 3, 3];

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete = 'new-password',
  placeholder,
  minLength,
  required,
  showStrength = false,
  className = '',
}) {
  const [visible, setVisible] = useState(false);
  const [score, setScore] = useState(null);
  const meterId = useId();

  // Lazy-load zxcvbn-ts only when meter is enabled and user starts typing.
  // Dynamic import keeps zxcvbn-ts (~13kb gz) out of the initial bundle.
  useEffect(() => {
    if (!showStrength) return;
    if (!value) {
      setScore(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { zxcvbn } = await import('zxcvbn-ts');
        const result = zxcvbn(value);
        if (!cancelled) setScore(result.score);
      } catch {
        // If zxcvbn fails to load, silently skip the meter — minLength still enforced.
        if (!cancelled) setScore(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [value, showStrength]);

  const bucket = score == null ? -1 : STRENGTH_BUCKET[score];
  const label_text = bucket >= 0 ? STRENGTH_LABELS[bucket] : '';

  return (
    <div className={className}>
      <div className="relative">
        <Lock aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-describedby={showStrength && score != null ? meterId : undefined}
          className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-primary/15 bg-background font-sans text-foreground placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-primary transition-colors p-1"
        >
          {visible ? (
            <EyeOff aria-hidden="true" className="w-5 h-5" />
          ) : (
            <Eye aria-hidden="true" className="w-5 h-5" />
          )}
        </button>
      </div>
      {showStrength && score != null && (
        <div id={meterId} className="mt-2" aria-live="polite">
          <div className="flex gap-1.5" role="presentation">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= bucket
                    ? bucket === 0
                      ? 'bg-stone-400'
                      : bucket === 1
                      ? 'bg-amber-400'
                      : bucket === 2
                      ? 'bg-primary/60'
                      : 'bg-primary'
                    : 'bg-stone-200'
                }`}
              />
            ))}
          </div>
          <p className="font-sans text-xs text-stone-600 mt-1.5">
            Password strength: <span className="font-medium">{label_text}</span>
          </p>
        </div>
      )}
    </div>
  );
}
