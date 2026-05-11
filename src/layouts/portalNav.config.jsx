/**
 * portalNav.config.js
 *
 * Single source of truth for portal and admin rail items.
 * Rail renders icons only; drawer renders icon + label.
 * Config-driven pattern allows reorder/hide without JSX edits.
 */
import { Home, BookOpen, LifeBuoy, Bookmark, Calendar, Shield } from 'lucide-react';

/**
 * PhedrisIcon — small wrapper rendering the Phedris avatar PNG with
 * Lucide-compatible props (className, style, aria-hidden). strokeWidth
 * is accepted but ignored (raster image has no stroke).
 */
export function PhedrisIcon({ className, style, 'aria-hidden': ariaHidden, strokeWidth: _strokeWidth, ...rest }) {
  return (
    <img
      src="/phedris-avatar-256.png"
      alt=""
      aria-hidden={ariaHidden ?? true}
      className={className}
      style={{ ...style, objectFit: 'contain', borderRadius: '9999px' }}
      {...rest}
    />
  );
}

/**
 * Student rail items (desktop rail). 5 items + Account at bottom.
 * Admin is NEVER shown in mobile bottom-nav — desktop only.
 */
export const studentNavItems = [
  { id: 'home',      path: '/portal',            label: 'Home',       icon: Home },
  { id: 'courses',   path: '/portal/courses',    label: 'My Courses', icon: BookOpen },
  { id: 'rescue',    path: '/portal/rescue-kit', label: 'Rescue Kit', icon: LifeBuoy },
  { id: 'bookmarks', path: '/portal/bookmarks',  label: 'Bookmarks',  icon: Bookmark },
  { id: 'calendar',  path: '/portal/calendar',   label: 'Calendar',   icon: Calendar },
];

/**
 * Admin rail items — desktop rail only, shown when isAdmin === true.
 * Phedris Sessions folds in as an admin drawer sub-item (Phase 2).
 */
export const adminNavItems = [
  { id: 'admin', path: '/admin', label: 'Admin', icon: Shield },
];

/**
 * Mobile bottom-nav items (5 slots). Slot 2 is the dual-purpose
 * Phedris slot: admin users land on /admin (otherwise unreachable from
 * mobile rail), non-admin users land on /phedris-coming-soon as a
 * brand-tease placeholder for the upcoming HH chat-bot integration.
 *
 * Replaces the prior duplicate /portal/courses destination (which
 * rendered the same CoursePortal component as /portal Home).
 */
export function getMobileBottomNavItems(isAdmin) {
  const slot2 = isAdmin
    ? { id: 'admin',    path: '/admin/assistant',        label: 'Assistant', icon: PhedrisIcon }
    : { id: 'phedris',  path: '/phedris-coming-soon',   label: 'Phedris',  icon: PhedrisIcon };
  return [
    studentNavItems[0],   // Home
    slot2,                // Phedris (dual-purpose)
    studentNavItems[2],   // Rescue Kit
    studentNavItems[3],   // Bookmarks
    studentNavItems[4],   // Calendar
  ];
}
