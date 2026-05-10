import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * RequireAdmin — guards all /admin/* routes.
 *
 * Admin predicate (dispatch-brief § 4):
 *   Admin = @healingheartscourse.com email  (new email-domain gate, Round 1)
 *        OR  profile.role === 'admin'        (existing role column check — preserved)
 *
 * The email-domain check is an ADDITIONAL affirmative path, not a replacement.
 * Future tiers (e.g. role: 'staff') will layer on top via additional OR clauses.
 *
 * Behaviour:
 *   - Loading → spinner
 *   - No user → redirect to /login (preserves return location)
 *   - Not admin → redirect to /portal
 *   - Admin → render children
 */
export default function RequireAdmin({ children }) {
  const { user, loading, isAdmin: profileRoleIsAdmin } = useAuth();
  const location = useLocation();

  // ── Admin predicate ────────────────────────────────────────────────────
  // Layer 1 (existing): profile.role === 'admin' (via AuthContext.isAdmin)
  // Layer 2 (Round 1):  user email ends with @healingheartscourse.com
  const emailDomainIsAdmin =
    typeof user?.email === 'string' &&
    user.email.endsWith('@healingheartscourse.com');

  const isAdmin = profileRoleIsAdmin === true || emailDomainIsAdmin === true;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="font-outfit text-primary/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/portal" replace />;
  }

  return children;
}
