/**
 * AdminComingSoon — generic scaffold for admin sub-routes not yet built.
 *
 * Mirrors AuthoringRoute scaffold pattern (admin card-chrome, Wave 6D backend-data
 * deferral, "Back to Admin" anchor). Used by routes registered in App.jsx for
 * /admin/users, /admin/enrollments, /admin/webinars, /admin/broadcasts,
 * /admin/content, /admin/settings — drawer nav surfaces declared in Wave 4B but
 * implementation deferred.
 *
 * Pass `title` + `breadcrumb` props to differentiate per route.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { getTypeStyle } from '../../portal/design/typography';

const routeFadeStyle = {
  animation: 'admin-comingsoon-route-enter 220ms cubic-bezier(0,0,0.2,1) both',
};

export default function AdminComingSoon({ title = 'Coming soon', breadcrumb = 'Admin' }) {
  return (
    <>
      <style>{`
        @keyframes admin-comingsoon-route-enter {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .admin-comingsoon-root { animation: none !important; }
        }
      `}</style>

      <div
        className="admin-comingsoon-root"
        style={{
          ...routeFadeStyle,
          padding: '2rem',
          maxWidth: 640,
        }}
      >
        <div
          style={{
            border: '1px solid rgba(28, 25, 23, 0.12)',
            borderRadius: 12,
            padding: '1.5rem',
            backgroundColor: 'var(--pt-elevation-0-hex, #fafaf9)',
          }}
        >
          <p
            style={{
              ...getTypeStyle('meta', 'medium'),
              color: 'var(--pt-text-muted-hex, #57534e)',
              marginBottom: '0.5rem',
            }}
          >
            Admin › {breadcrumb}
          </p>

          <h1
            style={{
              ...getTypeStyle('heading'),
              color: 'var(--pt-text-primary-hex, #1c1917)',
              marginBottom: '1rem',
            }}
          >
            {title} — under construction.
          </h1>

          <p
            style={{
              ...getTypeStyle('body'),
              color: 'var(--pt-text-muted-hex, #57534e)',
              marginBottom: '1.5rem',
            }}
          >
            This admin section ships in a future wave. The drawer link is
            available so the IA stays consistent across the admin surface, but
            the page itself is a scaffold while we wire the backend.
          </p>

          <Link
            to="/admin"
            style={{
              ...getTypeStyle('body', 'medium'),
              color: 'var(--pt-primary-accent-hex, #B96A5F)',
              textDecoration: 'none',
            }}
          >
            ← Back to Admin
          </Link>
        </div>
      </div>
    </>
  );
}
