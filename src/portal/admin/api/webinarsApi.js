/**
 * webinarsApi — Supabase data layer for /admin/webinars list + detail views.
 *
 * Spec: portal-admin-completion-v1 wave-3.1 S1 spec §6 (named exports only).
 * Consumed by useWebinarsList + useWebinarDetail hooks.
 *
 *   - listWebinars({ statusFilter, dateRange }) — table read
 *   - getWebinar(id) — single row
 *   - listWebinarRegistrations(webinar_id) — registrations join
 *   - resendConfirmation(reg_id) — fetch POST to /api/admin/resend-webinar-confirmation
 *   - revokeRegistration(reg_id, actor_id) — admin_revoke_registration RPC
 *   - listAuditRows(target_table, target_ids) — admin_action_audit reads
 *
 * No service-role keys exposed — all client-side reads + auth-gated RPC.
 */

import { supabase } from '../../../lib/supabase';

export async function listWebinars({ statusFilter = 'all', dateRange = null } = {}) {
  let query = supabase
    .from('webinars')
    .select('*')
    .order('starts_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    // 'upcoming' + 'past' are derived client-side from starts_at vs now,
    // matching the UI chip semantics. The DB `status` column uses values
    // ('scheduled','live','completed','evergreen') which don't map cleanly.
    // Server-side filtering on raw status would mis-categorize; we let the
    // hook do the partition.
  }

  if (dateRange?.from) query = query.gte('starts_at', dateRange.from);
  if (dateRange?.to) query = query.lte('starts_at', dateRange.to);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getWebinar(id) {
  const { data, error } = await supabase
    .from('webinars')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function listWebinarRegistrations(webinar_id) {
  const { data, error } = await supabase
    .from('webinar_registrations')
    .select('*')
    .eq('webinar_id', webinar_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function resendConfirmation(reg_id) {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) throw new Error('not_authenticated');

  const res = await fetch('/api/admin/resend-webinar-confirmation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ reg_id }),
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const err = new Error(body?.error || `resend_failed_${res.status}`);
    err.status = res.status;
    err.payload = body;
    throw err;
  }

  return body || { status: 'sent' };
}

export async function revokeRegistration(reg_id, actor_id) {
  const { data, error } = await supabase.rpc('admin_revoke_registration', {
    p_reg_id: reg_id,
    p_actor_id: actor_id,
  });
  if (error) throw error;
  return data;
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
