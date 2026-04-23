/**
 * portalNav.config.js
 *
 * Single source of truth for portal and admin rail items.
 * Rail renders icons only; drawer renders icon + label.
 * Config-driven pattern allows Phase 2 reorder/hide without JSX edits.
 */
import { Home, BookOpen, LifeBuoy, Bookmark, Calendar, Shield } from 'lucide-react';

/**
 * Student rail items (bottom-nav on mobile, first 5 items).
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
