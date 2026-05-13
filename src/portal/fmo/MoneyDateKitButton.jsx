/**
 * MoneyDateKitButton — FMO Module 1 / section close download CTA (AP-6).
 *
 * Spec: pr-plan.md §PR 2 MoneyDateKitButton.jsx + component-list.md C8.
 * Content: track-c-output/money-date-kit.md (Canva-rendered PDF).
 *
 * PDF URL note:
 *   The Canva-exported PDF URL is not yet wired into the codebase. v1 ships
 *   with a placeholder constant — Track C / Josh delivers the final URL when
 *   the Canva render is approved. Flag: KIT_PDF_URL_TODO.
 *
 * Couples-care: button copy uses "your" (couple-possessive), not individual.
 */

import React from 'react';
import { getTypeStyle } from '../design/typography';

// TODO: replace with final Canva export URL once Track C delivers asset (KIT_PDF_URL_TODO).
const KIT_PDF_URL_TODO = '#money-date-kit-pdf-pending';

export default function MoneyDateKitButton({ pdfUrl }) {
  const href = pdfUrl || KIT_PDF_URL_TODO;
  const isPending = href === KIT_PDF_URL_TODO;
  return (
    <a
      href={href}
      download={!isPending}
      aria-label="Download your Money Date Kit (PDF)"
      style={{
        display: 'inline-block',
        padding: '12px 24px',
        borderRadius: 12,
        backgroundColor: isPending ? 'var(--pt-border-subtle)' : 'var(--pt-primary-accent)',
        color: 'var(--pt-text-inverse)',
        textDecoration: 'none',
        cursor: isPending ? 'not-allowed' : 'pointer',
        ...getTypeStyle('body'),
        fontWeight: 600,
      }}
    >
      {isPending ? 'Money Date Kit (coming soon)' : 'Download Your Money Date Kit (PDF)'}
    </a>
  );
}
