/**
 * roleSectionAccess — 3-tier RBAC section map for Admin drawer.
 *
 * Spec: §12.1 A-01 (P0 security), decision-2.8-rev (v1.1)
 * Source: Chase role taxonomy 2026-04-23
 *
 * Learners are NOT in this map. They are blocked by route-level
 * RequireAdmin before reaching the Admin drawer.
 */

export const ROLE_SECTION_ACCESS = {
  admin:      ['users', 'applications', 'webinars', 'broadcasts', 'crm',
               'enrollments', 'content', 'analytics', 'settings', 'assistant'],
  coach:      ['users', 'webinars', 'content'],
  'sales-cs': ['applications', 'crm', 'broadcasts'],
};

/**
 * hasAnyRole — true iff user has at least one role that grants access to sectionKey.
 *
 * Multi-role: user.roles is string[] (e.g. ['learner', 'coach'] → coach access).
 * Legacy adapter: if user.roles is absent but user.isAdmin is truthy,
 *   roles is treated as ['admin'] (supports AuthContext isAdmin-boolean-only).
 *
 * No hardcoded user assignments. Role grants come solely from ROLE_SECTION_ACCESS.
 *
 * @param {{ roles?: string[], isAdmin?: boolean }} user
 * @param {string} sectionKey
 * @returns {boolean}
 */
export function hasAnyRole(user, sectionKey) {
  let roles;

  if (Array.isArray(user?.roles) && user.roles.length > 0) {
    roles = user.roles;
  } else if (user?.isAdmin) {
    // Legacy adapter: isAdmin boolean → treat as ['admin']
    roles = ['admin'];
  } else {
    roles = [];
  }

  return roles.some(
    (role) => (ROLE_SECTION_ACCESS[role] ?? []).includes(sectionKey)
  );
}
