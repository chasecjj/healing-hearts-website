/**
 * JournalPanelContext — share the right-rail journal panel open/toggle state
 * across the portal so descendant routes (LessonView's toast button, future
 * surfaces) can open the panel without prop drilling.
 *
 * Provided by PortalLayout. Default value is a no-op so isolated component
 * mounts (tests, mockup mode) don't crash.
 *
 * Wave 10 J1.
 */

import { createContext, useContext } from 'react';

export const JournalPanelContext = createContext({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
});

export function useJournalPanel() {
  return useContext(JournalPanelContext);
}
