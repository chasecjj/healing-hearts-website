import React from 'react';
import { Bookmark } from 'lucide-react';

/**
 * BookmarksPortal — placeholder for /portal/bookmarks
 * Round 2 will replace this with saved lessons and moments.
 */
export default function BookmarksPortal() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 py-16">
      <div className="w-16 h-16 rounded-2xl bg-elevation-1 flex items-center justify-center">
        <Bookmark className="w-8 h-8 text-primary/60" />
      </div>
      <div className="text-center max-w-sm">
        <h2 className="font-outfit font-semibold text-foreground text-xl mb-2">
          Bookmarks
        </h2>
        <p className="text-foreground/55 text-sm leading-relaxed">
          Save your favorite lessons and moments here. This feature is on its way.
        </p>
      </div>
      <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-outfit font-semibold uppercase tracking-wider">
        Coming Soon
      </span>
    </div>
  );
}
