# Browser Evaluate Scripts — `chrome-devtools-mcp__evaluate_script` Snippets

Used by `visual-analyst` for computed-style analysis. Each snippet is a self-contained JS function to pass as the `function` parameter.

## Check Horizontal Overflow (Dimension 2 — Responsive)

```javascript
() => ({
  hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  viewportWidth: window.innerWidth,
  overflow: document.documentElement.scrollWidth - window.innerWidth
})
```

Run at every viewport. If `hasHorizontalScroll === true` on mobile (375px), emit a finding with severity `critical`.

## Check Z-Index Stacking (Dimension 1 — Layout)

```javascript
() => {
  const positioned = document.querySelectorAll(
    '[style*="position"], .fixed, .absolute, .sticky, .relative'
  );
  return Array.from(positioned).map(el => ({
    tag: el.tagName,
    class: el.className.toString().slice(0, 80),
    zIndex: getComputedStyle(el).zIndex,
    position: getComputedStyle(el).position,
    rect: el.getBoundingClientRect()
  })).filter(el => el.zIndex !== 'auto');
}
```

Look for z-index collisions (same value, overlapping rects) or unexpectedly high values (>9999 often indicates panic stacking).

## Check Clipped Content (Dimension 1 — Layout)

```javascript
() => {
  const hidden = document.querySelectorAll('[class*="overflow-hidden"]');
  return Array.from(hidden).map(parent => {
    const pRect = parent.getBoundingClientRect();
    const clipped = Array.from(parent.children).filter(child => {
      const cRect = child.getBoundingClientRect();
      return cRect.bottom > pRect.bottom || cRect.right > pRect.right ||
             cRect.top < pRect.top || cRect.left < pRect.left;
    });
    return clipped.length > 0 ? {
      parent: { tag: parent.tagName, class: parent.className.toString().slice(0, 80) },
      clippedChildren: clipped.length,
      parentRect: pRect,
      firstClippedClass: clipped[0]?.className.toString().slice(0, 80)
    } : null;
  }).filter(Boolean);
}
```

This is the key snippet for detecting the testimonial clipping bug in `3acb62b`. Look for `overflow-hidden` parents with children whose bounding rects extend beyond the parent's rect.

## Check Touch Target Sizes (Dimension 2 — Responsive, mobile only)

```javascript
() => {
  const interactive = document.querySelectorAll(
    'a, button, [role="button"], input, select, textarea, [onclick]'
  );
  return Array.from(interactive).map(el => {
    const rect = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      text: el.textContent?.trim().slice(0, 40),
      width: rect.width,
      height: rect.height,
      tooSmall: rect.width < 44 || rect.height < 44
    };
  }).filter(el => el.tooSmall);
}
```

Run only at 375×812 (mobile). `chrome-devtools:a11y-debugging` has a more thorough tap-target check — this is a lightweight preflight.
