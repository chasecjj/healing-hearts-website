import React from 'react';
import { Navigate } from 'react-router-dom';

// Downloads page retired for the 2026-04-17 expo.
// Rescue Kit is now an interactive course (migration 019), not a PDF.
// Card Pack is a physical product (shipping, not portal content).
// Any hit to /portal/downloads redirects to the rescue-kit course entry point.
// Buyers of card-pack-only will bounce through here once; for the rare case
// they click Downloads in the portal nav, ProtectedRoute + course enrollment
// gates handle access control downstream. Polish (distinguishing flows by
// order type, retiring the nav link entirely) is post-expo.
export default function Downloads() {
  return <Navigate to="/portal/course/rescue-kit/module-1" replace />;
}
