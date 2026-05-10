/**
 * JournalPanelContext — share the right-rail journal panel open/toggle state
 * across the portal so descendant routes (LessonView's toast button, future
 * surfaces) can open the panel without prop drilling.
 *
 * Provided by PortalLayout. Default value is a no-op so isolated component
 * mounts (tests, mockup mode) don't crash.
 *
 * Wave 10 J1 — initial shape: { isOpen, open, close, toggle }
 * Wave 11 J1 — extended shape: + currentLessonId, currentModuleId,
 *              setCurrentLessonContext({ lessonId, moduleId })
 *
 * CoursePortal calls setCurrentLessonContext on slug change.
 * PortalLayout reads currentLessonId / currentModuleId from context and
 * passes them to JournalView — no slug→ID computation happens in PortalLayout.
 */

import { createContext, useContext } from 'react';

export const JournalPanelContext = createContext({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
  // Wave 11 J1
  currentLessonId: null,
  currentModuleId: null,
  setCurrentLessonContext: () => {},
});

export function useJournalPanel() {
  return useContext(JournalPanelContext);
}
