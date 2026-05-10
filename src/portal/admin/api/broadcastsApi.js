/**
 * broadcastsApi — Supabase data layer for /admin/broadcasts list + detail views.
 *
 * Spec: portal-admin-completion-v1 wave-3.2 S3 spec §3.3 (named exports only).
 * Consumed by useBroadcastsList + useBroadcastDetail hooks.
 *
 *   - listBroadcasts({ statusFilter, searchQuery })
 *       fetch POST to /api/admin/list-broadcasts (service-role-backed,
 *       broadcast_sends RLS blocks direct client SELECT).
 *   - getBroadcast(broadcast_id)
 *       same backend route with broadcast_id filter; returns single grouped row.
 *   - listBroadcastRecipients(broadcast_id)
 *       same backend route, mode='recipients'. The broadcast_sends table
 *       does not allow admin SELECT (migration 025 = service_role-only),
 *       so direct supabase query would return [] regardless of role.
 *   - cancelBroadcast(broadcast_id, actor_id)
 *       supabase.rpc('admin_cancel_broadcast') — admin OR sales-cs gate inside RPC.
 *   - listAuditRows(target_table, target_ids)
 *       direct supabase query against admin_action_audit. admin_action_audit
 *       has an admin SELECT policy (migration 037 PART 1), so this works
 *       client-side for admins. Sales-cs would receive [] (gracefully empty).
 *
 * No service-role keys exposed in this file — all client-side reads + auth-gated RPC.
 * No direct auth.users PostgREST query.
 *
 * NOTE on send-from-template: this lane intentionally does NOT export a send
 * function. The /api/admin/send-broadcast endpoint is dryRun=true by default
 * (G-04 readiness gate); the UI surfaces a disabled button only.
 */

import { supabase } from '../../../lib/supabase';

async function postListBroadcasts(payload) {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) throw new Error('not_authenticated');

  const res = await fetch('/api/admin/list-broadcasts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload || {}),
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const err = new Error(body?.error || `list_broadcasts_failed_${res.status}`);
    err.status = res.status;
    err.payload = body;
    throw err;
  }

  return body || {};
}

export async function listBroadcasts({ statusFilter = 'all', searchQuery = '' } = {}) {
  const body = await postListBroadcasts({
    mode: 'list',
    statusFilter,
    searchQuery,
  });
  return body.broadcasts || [];
}

export async function getBroadcast(broadcast_id) {
  if (!broadcast_id) return null;
  const body = await postListBroadcasts({
    mode: 'list',
    broadcast_id,
  });
  return body.broadcast || null;
}

export async function listBroadcastRecipients(broadcast_id) {
  if (!broadcast_id) return [];
  const body = await postListBroadcasts({
    mode: 'recipients',
    broadcast_id,
  });
  return body.recipients || [];
}

export async function cancelBroadcast(broadcast_id, actor_id) {
  const { data, error } = await supabase.rpc('admin_cancel_broadcast', {
    p_broadcast_id: broadcast_id,
    p_actor_id: actor_id,
  });
  if (error) throw error;
  return data;
}

export async function listAuditRows(broadcast_id) {
  // admin_action_audit rows for cancel_broadcast / send-from-template stash
  // the broadcast_id in payload (target_id is a synthetic uuid because the
  // audit table column is uuid-typed and broadcast_id is text). We filter
  // via payload->>'broadcast_id' = broadcast_id.
  if (!broadcast_id) return [];
  const { data, error } = await supabase
    .from('admin_action_audit')
    .select('*')
    .eq('target_table', 'broadcast_sends')
    .filter('payload->>broadcast_id', 'eq', broadcast_id)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  return data || [];
}
