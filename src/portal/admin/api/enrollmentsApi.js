/**
 * enrollmentsApi — Supabase data layer for /admin/enrollments list + detail views.
 *
 * Spec: portal-admin-completion-v1 wave-3.2 S2 spec §3.2 (named exports only).
 * Consumed by useEnrollmentsList + useEnrollmentDetail hooks.
 *
 *   - listEnrollments({ courseFilter, statusFilter, grantSourceFilter, utmFilter })
 *   - getEnrollment(id)                              — single row + course join
 *   - resolveLearner(user_id)                        — admin_resolve_user RPC
 *   - listOrdersForUser(user_id)                     — orders join via auth_user_id
 *   - revokeEnrollment(enrollment_id, actor_id)      — admin_revoke_enrollment RPC
 *   - grantReplay(user_id, course_id)                — POST /api/admin/grant-replay
 *   - listAuditRows(target_table, target_ids)        — admin_action_audit read
 *
 * No service-role keys exposed — all client-side reads + auth-gated RPC.
 * No direct auth.users PostgREST query; learner identity is admin_resolve_user only.
 */

import { supabase } from '../../../lib/supabase';

export async function listEnrollments({
  courseFilter = null,
  statusFilter = 'all',
  grantSourceFilter = 'all',
  utmFilter = null,
} = {}) {
  let query = supabase
    .from('enrollments')
    .select('*, courses(id, slug, title)')
    .order('enrolled_at', { ascending: false });

  // Course filter: comma-separated multi-select from URL searchParams
  if (courseFilter) {
    const ids = String(courseFilter).split(',').filter(Boolean);
    if (ids.length > 0) {
      query = query.in('course_id', ids);
    }
  }

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  // grant-source: stripe = stripe_payment_id IS NOT NULL ; admin-grant = IS NULL.
  // utmFilter is applied client-side after join with orders (utm lives on orders.metadata).
  if (grantSourceFilter === 'stripe') {
    query = query.not('stripe_payment_id', 'is', null);
  } else if (grantSourceFilter === 'admin-grant') {
    query = query.is('stripe_payment_id', null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getEnrollment(id) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*, courses(id, slug, title)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function listCourses() {
  // Lightweight reference for the course-filter chip options.
  const { data, error } = await supabase
    .from('courses')
    .select('id, slug, title')
    .order('title', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function resolveLearner(user_id) {
  if (!user_id) return null;
  const { data, error } = await supabase.rpc('admin_resolve_user', {
    p_user_id: user_id,
  });
  if (error) throw error;
  // RPC returns TABLE(email, display_name) — array of 0/1 row. Non-admin → [].
  const row = Array.isArray(data) ? data[0] : data;
  return row || null;
}

export async function listOrdersForUser(user_id) {
  if (!user_id) return [];
  const { data, error } = await supabase
    .from('orders')
    .select('id, product_slug, amount_cents, currency, status, metadata, stripe_session_id, stripe_payment_intent, created_at')
    .eq('auth_user_id', user_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function revokeEnrollment(enrollment_id, actor_id) {
  const { data, error } = await supabase.rpc('admin_revoke_enrollment', {
    p_enrollment_id: enrollment_id,
    p_actor_id: actor_id,
  });
  if (error) throw error;
  return data;
}

export async function grantReplay(user_id, course_id) {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) throw new Error('not_authenticated');

  const res = await fetch('/api/admin/grant-replay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ user_id, course_id }),
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const err = new Error(body?.error || `grant_replay_failed_${res.status}`);
    err.status = res.status;
    err.payload = body;
    throw err;
  }

  return body || { status: 'replayed' };
}

export async function listAuditRows(target_table, target_ids) {
  if (!Array.isArray(target_ids) || target_ids.length === 0) return [];
  const { data, error } = await supabase
    .from('admin_action_audit')
    .select('*')
    .eq('target_table', target_table)
    .in('target_id', target_ids)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  return data || [];
}
