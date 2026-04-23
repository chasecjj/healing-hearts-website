/**
 * useMockupMode — detects `?mockup=1` query param for Wave 5 hero states.
 *
 * Returns true when the URL contains `?mockup=1`. Used by PortalDashboard,
 * ModuleOverview, and LessonView to branch into static hero-state renderers
 * that bypass Supabase data dependencies and show target-state visuals for
 * the webinar demo (Thursday 2026-04-23 7pm MT).
 *
 * Production routes without `?mockup=1` continue to render real data paths.
 */
import { useLocation } from 'react-router-dom';

export function useMockupMode() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  return params.get('mockup') === '1';
}
