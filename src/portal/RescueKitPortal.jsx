import React from 'react';
import { LifeBuoy, Lock } from 'lucide-react';

/**
 * RescueKitPortal — placeholder for /portal/rescue-kit
 * Round 2 will replace this with the full Rescue Kit framework library.
 */
export default function RescueKitPortal() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 py-16">
      <div className="w-16 h-16 rounded-2xl bg-elevation-1 flex items-center justify-center">
        <LifeBuoy className="w-8 h-8 text-primary/60" />
      </div>
      <div className="text-center max-w-sm">
        <h2 className="font-outfit font-semibold text-foreground text-xl mb-2">
          Rescue Kit
        </h2>
        <p className="text-foreground/55 text-sm leading-relaxed">
          Your framework library is being prepared. Check back soon — we're building
          something beautiful for you.
        </p>
      </div>
      <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-outfit font-semibold uppercase tracking-wider">
        Coming Soon
      </span>

      {/* Preview tiles — signals intent, Round 2 will populate with real content */}
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        {[
          { title: 'Regulation First' },
          { title: 'Nervous System Reset' },
          { title: 'Rupture → Repair' },
        ].map(({ title }) => (
          <div
            key={title}
            className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center gap-3 opacity-60"
          >
            <Lock className="w-5 h-5 text-foreground/40" />
            <span className="font-outfit font-semibold text-sm text-foreground/70 text-center leading-snug">
              {title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
