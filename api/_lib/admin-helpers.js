// Server-side helpers for admin routes that need Phase 3.5 webhook logic.
//
// These functions DUPLICATE the file-local helpers in api/webhooks/stripe.js
// (findAuthUserIdByEmail at :827, collectEnrollmentGrants at :846) because
// those are not exported from the webhook module. Keeping a single re-export
// shim here avoids modifying stripe.js (HARD constraint from Wave 3.2 brief).
//
// If api/webhooks/stripe.js ever exports these helpers natively, replace the
// duplicated bodies below with `export { findAuthUserIdByEmail, collectEnrollmentGrants } from '../webhooks/stripe.js'`.
//
// Source-of-truth comments:
//   - findAuthUserIdByEmail:  api/webhooks/stripe.js:827
//   - collectEnrollmentGrants: api/webhooks/stripe.js:846
//
// Both helpers must remain behaviour-identical to their stripe.js counterparts.
// Any divergence is a bug.

import { supabaseAdmin } from './supabase-admin.js';

// auth.users is not queryable via PostgREST. Use the admin API instead.
// Mirror of api/webhooks/stripe.js:827.
export async function findAuthUserIdByEmail(email) {
  if (!email) return null;
  try {
    const { data: listResult } = await supabaseAdmin.auth.admin.listUsers();
    const match = listResult?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    return match?.id || null;
  } catch (err) {
    console.error('[admin-helpers] findAuthUserIdByEmail failed:', err.message);
    return null;
  }
}

// Normalize access_grants into a flat list of enrollment grants.
// Mirror of api/webhooks/stripe.js:846.
// Supports both shapes:
//   { type: 'enrollment', course_id: '...' }
//   { type: 'multi', grants: [{ type: 'enrollment', course_id: '...' }, ...] }
// Returns [] for download-only or unrecognized shapes.
export function collectEnrollmentGrants(accessGrants) {
  if (!accessGrants) return [];
  if (accessGrants.type === 'enrollment' && accessGrants.course_id) {
    return [{ course_id: accessGrants.course_id }];
  }
  if (accessGrants.type === 'multi' && Array.isArray(accessGrants.grants)) {
    return accessGrants.grants
      .filter((g) => g?.type === 'enrollment' && g.course_id)
      .map((g) => ({ course_id: g.course_id }));
  }
  return [];
}

// Extract Bearer token from an Authorization header.
// Returns null if missing or malformed.
export function extractBearerToken(req) {
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (!auth || typeof auth !== 'string') return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

// Verify a Bearer token against Supabase Auth and return the user object,
// or null if the token is invalid / missing. Logs the failure server-side
// but does NOT expose the reason to the caller (security).
export async function getUserFromBearer(token) {
  if (!token) return null;
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return null;
    }
    return data.user;
  } catch (err) {
    console.error('[admin-helpers] getUserFromBearer threw:', err.message);
    return null;
  }
}

// Check whether a given auth user_id has any of the requested roles.
// Uses user_profiles directly (service-role bypasses RLS) so we can verify
// roles even when the caller's JWT doesn't include role claims.
// Returns true/false; never throws.
export async function userHasAnyRole(userId, roles) {
  if (!userId || !Array.isArray(roles) || roles.length === 0) return false;
  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('role, roles')
      .eq('id', userId)
      .maybeSingle();
    if (error || !data) return false;
    const effective = Array.isArray(data.roles) && data.roles.length > 0
      ? data.roles
      : (data.role ? [data.role] : []);
    return roles.some((r) => effective.includes(r));
  } catch (err) {
    console.error('[admin-helpers] userHasAnyRole threw:', err.message);
    return false;
  }
}
