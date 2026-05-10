import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getTypeStyle } from './design/typography';

/**
 * PhedrisComingSoon — placeholder for /phedris-coming-soon
 *
 * Renders behind the dual-purpose mobile rail slot 2. Non-admin users land
 * here as a brand-tease for the upcoming HH chat-bot / Phedris integration.
 * If an admin somehow navigates here (edge case — the rail routes them to
 * /admin instead), surfaces a quick CTA back to the admin dashboard.
 */
export default function PhedrisComingSoon() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 py-16">
      <h1 className="sr-only" style={getTypeStyle('heading-1')}>Phedris</h1>
      <div
        className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)' }}
      >
        <img
          src="/phedris-avatar-256.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full"
          style={{ objectFit: 'contain' }}
        />
      </div>
      <div className="text-center max-w-sm">
        <h2 className="font-outfit font-semibold text-foreground text-xl mb-2">
          Phedris is coming
        </h2>
        <p className="text-pt-quiet text-sm leading-relaxed">
          Conversational support for your healing journey — guidance between
          sessions, gentle prompts, and a steady voice when you need one.
          Launching soon.
        </p>
      </div>
      {isAdmin && (
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
          style={{
            backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)',
            color: 'var(--pt-on-accent-hex, #ffffff)',
          }}
        >
          Go to Admin Dashboard
        </button>
      )}
    </div>
  );
}
