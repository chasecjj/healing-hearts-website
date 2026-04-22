import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Users, Mail, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import usePageMeta from '../../hooks/usePageMeta';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'responded', label: 'Responded' },
  { value: 'converted', label: 'Converted' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_STYLES = {
  new: 'bg-accent/10 text-accent',
  reviewing: 'bg-primary/10 text-primary',
  contacted: 'bg-primary/20 text-primary',
  responded: 'bg-amber-100 text-amber-700',
  converted: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-neutral-100 text-neutral-500',
};

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CrmListView() {
  usePageMeta('CRM — Leads', 'Healing Hearts application pipeline.');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [hotLeadIds, setHotLeadIds] = useState(new Set());
  const [hotLeadsOnly, setHotLeadsOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('crm_lead_pipeline')
        .select('*')
        .order('next_action_due', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else {
        setLeads(data ?? []);
        setError(null);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    async function loadHotLeads() {
      const { data } = await supabase
        .from('crm_webinar_hot_leads')
        .select('application_id');
      if (data) {
        setHotLeadIds(new Set(data.map((r) => r.application_id)));
      }
    }
    loadHotLeads();
  }, []);

  const filtered = useMemo(() => {
    let result = statusFilter === 'all' ? leads : leads.filter((l) => l.status === statusFilter);
    if (hotLeadsOnly) result = result.filter((l) => hotLeadIds.has(l.id));
    return result;
  }, [leads, statusFilter, hotLeadsOnly, hotLeadIds]);

  const hotLeadsCount = useMemo(
    () => leads.filter((l) => hotLeadIds.has(l.id)).length,
    [leads, hotLeadIds]
  );

  const counts = useMemo(() => {
    const c = {};
    for (const l of leads) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [leads]);

  const overdueCount = useMemo(
    () => leads.filter((l) => l.is_overdue).length,
    [leads]
  );

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-32 pb-24">
        {/* Back link */}
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm text-primary/60 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin
        </Link>

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-drama italic text-3xl md:text-4xl text-primary mb-1">
              CRM — Leads
            </h1>
            <p className="font-sans text-foreground/60 text-sm">
              {leads.length} total {leads.length === 1 ? 'application' : 'applications'}
              {overdueCount > 0 && (
                <span className="ml-3 inline-flex items-center gap-1 text-amber-700">
                  <AlertCircle className="w-4 h-4" />
                  {overdueCount} overdue
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.value;
            const count = f.value === 'all' ? leads.length : counts[f.value] ?? 0;
            return (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary text-white'
                    : 'bg-white text-primary/70 border border-primary/10 hover:border-primary/30'
                }`}
              >
                {f.label} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
          <button
            onClick={() => setHotLeadsOnly(!hotLeadsOnly)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              hotLeadsOnly
                ? 'bg-orange-500 text-white'
                : 'bg-white text-orange-600 border border-orange-200 hover:border-orange-400'
            }`}
          >
            🔥 Hot Leads <span className="opacity-60">({hotLeadsCount})</span>
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 border border-primary/5 text-center">
            <div className="inline-block w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="mt-4 text-foreground/60 text-sm">Loading leads...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-8 border border-red-200 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700 text-sm font-medium">Failed to load leads</p>
            <p className="text-foreground/60 text-xs mt-1">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-primary/5 text-center">
            <Users className="w-10 h-10 text-primary/30 mx-auto mb-3" />
            <p className="text-foreground/60 text-sm">
              No applications match this filter.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-primary/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-primary/5">
                  <tr className="text-left text-primary/70 font-outfit font-medium text-xs uppercase tracking-wide">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Urgency</th>
                    <th className="px-6 py-3">Next action</th>
                    <th className="px-6 py-3">Due</th>
                    <th className="px-6 py-3">Signals</th>
                    <th className="px-6 py-3">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {filtered.map((lead) => (
                    <tr
                      key={lead.id}
                      className={`hover:bg-primary/[0.02] transition-colors ${
                        lead.is_overdue ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/admin/crm/${lead.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {lead.name || '(no name)'}
                          </Link>
                          {hotLeadIds.has(lead.id) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 text-orange-700">
                              🔥 Hot Lead
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-foreground/50 mt-0.5 flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                          {lead.phone && (
                            <>
                              <Phone className="w-3 h-3 ml-2" />
                              {lead.phone}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_STYLES[lead.status] ?? STATUS_STYLES.new
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-foreground/70">
                        {lead.urgency || '—'}
                      </td>
                      <td className="px-6 py-4 text-foreground/80 max-w-xs">
                        <div className="line-clamp-2">{lead.next_action || '—'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {lead.next_action_due ? (
                          <span
                            className={
                              lead.is_overdue
                                ? 'text-amber-700 font-medium'
                                : 'text-foreground/70'
                            }
                          >
                            {formatDate(lead.next_action_due)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {lead.is_webinar_registered && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                              webinar
                            </span>
                          )}
                          {lead.is_rescue_kit_buyer && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/10 text-accent">
                              rescue kit
                            </span>
                          )}
                          {lead.spark_signup_id && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                              spark
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground/60 text-xs">
                        {formatDate(lead.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
