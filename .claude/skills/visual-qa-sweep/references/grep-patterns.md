# Grep Pattern Library — Dimension 3 (Design Token Compliance)

Used by the `visual-analyst` agent. Run each pattern against the JSX file for the URL being analyzed (e.g., `/about` → `src/pages/About.jsx`). For each match, read surrounding context with the Read tool to filter false positives (comments, SVG path attributes, etc.).

## Taste-Skill Forbidden Patterns (hard violations)

```bash
# Inter font (banned entirely — HH uses Cormorant Garamond + system stack)
grep -niE "(Inter|font-inter|'Inter'|\"Inter\")" {file}

# Pure black (use off-black/zinc-950/charcoal)
grep -niE '#000000|#000[^0-9a-fA-F]|bg-black[^/]' {file}

# AI purple/neon glow (banned brand deviation)
grep -niE '(purple|violet|indigo).*glow|(box-shadow.*purple|box-shadow.*violet)' {file}

# Oversized gradient text (flagged for review)
grep -niE 'bg-gradient.*text-transparent.*bg-clip-text' {file}

# h-screen (use min-h-[100dvh] — mobile viewport edge case)
grep -nE 'h-screen' {file}

# 3-column equal grid (banned when DESIGN_VARIANCE > 4 — HH default is 7)
grep -nE 'grid-cols-3\b' {file}
```

## Design-System-Guard Token Violations

```bash
# Hardcoded hex in JSX (use Tailwind tokens instead)
grep -nE '#[0-9a-fA-F]{3,8}' {file}

# Arbitrary Tailwind color classes
grep -nE '(text|bg|border|ring|fill|stroke|from|to|via|divide|outline|decoration|shadow|accent|caret|placeholder)-\[#' {file}

# Arbitrary spacing classes (use Tailwind scale)
grep -nE '(p|m|gap|w|h|top|bottom|left|right|inset)-\[[0-9]+px\]' {file}

# Arbitrary font family (use Tailwind font tokens)
grep -nE "font-\['" {file}
```

## A11y Patterns (supplementary — main a11y handled by chrome-devtools:a11y-debugging)

```bash
# Missing alt on images
grep -nE '<img[^>]*(?!alt=)' {file}

# onClick on non-interactive elements (div, span) without role
grep -nE '<(div|span)[^>]*onClick' {file}
```

## False-Positive Filters

After a raw grep match, Read 3 lines of surrounding context. Skip the match if:

- Inside a JS comment (`//` or `/* */`)
- Inside an SVG `path` or `d=` attribute (hex for color, not CSS)
- Inside a string literal that's a data prop (not applied as a class)
- Inside `tailwind.config.js` or any file ending in `.config.js/.ts` (config is allowed)
- Inside `vendor/` (third-party code — not HH source)
