/**
 * DrawerMetaContext — provides section metadata to DrawerShell without
 * requiring individual drawer files to pass explicit props.
 *
 * Provided by PortalLayout's DesktopTwoRail around each DrawerComponent.
 * DrawerShell reads this as fallback; explicit DrawerShell props override.
 *
 * Shape:
 *   flavorToken — key into tokens.js flavor-* map (e.g. 'home', 'courses')
 *   sectionIcon — Lucide icon component for the section
 *   breadcrumb  — human-readable section name (e.g. 'My Courses')
 */

import { createContext } from 'react';

export const DrawerMetaContext = createContext(
  /** @type {{ flavorToken?: string, sectionIcon?: import('react').ComponentType<{className?: string, strokeWidth?: number}>, breadcrumb?: string }} */ ({})
);
