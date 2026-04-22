import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Mail, Phone, Calendar, Heart, Church, Sparkles, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import usePageMeta from '../../hooks/usePageMeta';
import Contact360Timeline from '../../components/admin/Contact360Timeline';

const STATUS_VALUES = ['new', 'reviewing', 'contacted', 'responded', 'converted', 'archived'];

const STATUS_STYLES = {
  new: 'bg-accent/10 text-accent',
  reviewing: 'bg-primary/10 text-primary',
  contacted: 'bg-primary/20 text-primary',
  responded: 'bg-amber-100 text-amber-700',
  converted: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-neutral-100 text-neutral-500',
};

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function actorLabel(profile, user) {
  return profile?.display_name || user?.email?.split('@')[0] || 'admin';
}

export default function CrmDetailView() {
  usePageMeta('CRM — Application', 'Healing Hearts application detail.');
  const { applicationId } = useParams();
  const { user, profile } = useAuth();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Contact 360 state
  const [contact360, setContact360] = useState(null);
  const [contact360Loading, setContact360Loading] = useState(false);

  // Edit form state
  const [status, setStatus] = useState('new');
  const [nextAction, setNextAction] = useState('');
  const [nextActionDue, setNextActionDue] = useState('');
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else {
        setApplication(data);
        setStatus(data.status ?? 'new');
        setNextAction(data.next_action ?? '');
        setNextActionDue(data.next_action_due ?? '');
        setError(null);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [applicationId]);

  useEffect(() => {
    if (!application?.email) return;
    let cancelled = false;
    async function load360() {
      setContact360Loading(true);
      const { data } = await supabase
        .from('crm_contact_360')
        .select('*')
        .eq('email', application.email)
        .maybeSingle();
      if (!cancelled) {
        setContact360(data ?? null);
        setContact360Loading(false);
      }
    }
    load360();
    return () => { cancelled = true; };
  }, [application?.email]);

  async function refresh() {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();
    if (!error) setApplication(data);
  }

  async function handleStatusAndAction(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);

    const patch = {
      status,
      next_action: nextAction.trim() || null,
      next_action_due: nextActionDue || null,
    };

    // When moving out of 'new' for the first time, mark who reviewed + when
    if (application.status === 'new' && status !== 'new') {
      patch.reviewed_at = new Date().toISOString();
      patch.reviewed_by = user?.email ?? 'admin';
    }

    const { error } = await supabase
      .from('applications')
      .update(patch)
      .eq('id', applicationId);

    if (error) {
      setSaveMessage({ type: 'error', text: error.message });
    } else {
      setSaveMessage({ type: 'success', text: 'Saved.' });
      await refresh();
    }
    setSaving(false);
  }

  async function handleAppendNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSaving(true);
    setSaveMessage(null);

    const date = new Date().toISOString().split('T')[0];
    const actor = actorLabel(profile, user);
    const entry = `[${date}] (${actor}) ${noteText.trim()}`;

    const { error } = await supabase.rpc('append_application_note', {
      p_app_id: applicationId,
      p_entry: entry,
    });

    if (error) {
      setSaveMessage({ type: 'error', text: error.message });
    } else {
      setSaveMessage({ type: 'success', text: 'Note added.' });
      setNoteText('');
      await refresh();
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <div className="inline-block w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="w-full min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 pt-24 md:pt-32 pb-24">
          <Link to="/admin/crm" className="inline-flex items-center gap-2 text-sm text-primary/60 hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to CRM
          </Link>
          <div className="bg-white rounded-2xl p-8 border border-red-200 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700 text-sm font-medium">Application not found</p>
            {error && <p className="text-foreground/60 text-xs mt-1">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 pt-24 md:pt-32 pb-24">
        <Link to="/admin/crm" className="inline-flex items-center gap-2 text-sm text-primary/60 hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to CRM
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-primary/5 p-6 md:p-8 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="font-drama italic text-3xl md:text-4xl text-primary mb-1">
                {application.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/70">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${application.email}`} className="hover:underline">{application.email}</a>
                </span>
                {application.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    {application.phone}
                  </span>
                )}
              </div>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[application.status] ?? STATUS_STYLES.new}`}>
              {application.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4 pt-4 border-t border-primary/5">
            <Meta label="Submitted" value={formatDateTime(application.created_at)} />
            <Meta label="Reviewed" value={application.reviewed_at ? formatDateTime(application.reviewed_at) : '—'} />
            <Meta label="Urgency" value={application.urgency || '—'} />
            <Meta label="Relationship" value={application.relationship_rating ? `${application.relationship_rating}/10` : '—'} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — application content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Biggest challenge */}
            <Section title="Biggest challenge" icon={Heart}>
              <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {application.biggest_challenge || '—'}
              </p>
            </Section>

            {/* Ideal outcome */}
            {application.ideal_outcome && (
              <Section title="Ideal outcome" icon={Sparkles}>
                <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {application.ideal_outcome}
                </p>
              </Section>
            )}

            {/* Context fields */}
            <Section title="Context">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <Field label="Relationship status" value={application.relationship_status} />
                <Field label="Years together" value={application.years_together} />
                <Field label="Tried before" value={application.tried_before} />
                <Field label="Partner aware" value={formatBool(application.partner_aware)} />
                <Field label="Partner willing" value={formatBool(application.partner_willing)} />
                <Field label="Investment readiness" value={application.investment_readiness} />
                <Field label="Faith role" value={application.faith_role} icon={Church} />
                <Field label="How heard" value={application.how_heard} />
              </div>
              {application.additional_notes && (
                <div className="mt-4 pt-4 border-t border-primary/5">
                  <div className="text-xs uppercase tracking-wide text-primary/60 font-medium mb-1">
                    Additional notes from applicant
                  </div>
                  <p className="text-foreground/80 whitespace-pre-wrap text-sm">{application.additional_notes}</p>
                </div>
              )}
            </Section>

            {/* Contact 360° */}
            <Section title="Contact 360°" icon={Activity}>
              {contact360Loading ? (
                <p className="text-foreground/50 text-sm">Loading signals…</p>
              ) : (
                <Contact360Timeline
                  data={contact360}
                  applicationCreatedAt={application.created_at}
                />
              )}
            </Section>

            {/* Notes log */}
            <Section title="Internal notes" icon={Calendar}>
              {application.notes ? (
                <pre className="whitespace-pre-wrap font-mono text-xs text-foreground/70 bg-primary/5 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {application.notes}
                </pre>
              ) : (
                <p className="text-foreground/50 text-sm italic">No notes yet.</p>
              )}

              <form onSubmit={handleAppendNote} className="mt-4">
                <label className="block text-xs uppercase tracking-wide text-primary/60 font-medium mb-2">
                  Append note (auto-prefixed with date + author)
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-primary/10 px-3 py-2 text-sm focus:outline-none focus:border-primary/40 bg-white"
                  placeholder="Replied via email re: timeline. Asked about budget."
                />
                <button
                  type="submit"
                  disabled={saving || !noteText.trim()}
                  className="mt-2 px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Append note'}
                </button>
              </form>
            </Section>
          </div>

          {/* Right column — triage form */}
          <div className="space-y-6">
            <Section title="Triage">
              <form onSubmit={handleStatusAndAction} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wide text-primary/60 font-medium mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border border-primary/10 px-3 py-2 text-sm focus:outline-none focus:border-primary/40 bg-white"
                  >
                    {STATUS_VALUES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wide text-primary/60 font-medium mb-1.5">
                    Next action
                  </label>
                  <textarea
                    value={nextAction}
                    onChange={(e) => setNextAction(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-primary/10 px-3 py-2 text-sm focus:outline-none focus:border-primary/40 bg-white"
                    placeholder="Reply re: 3-month timeline"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wide text-primary/60 font-medium mb-1.5">
                    Due date
                  </label>
                  <input
                    type="date"
                    value={nextActionDue}
                    onChange={(e) => setNextActionDue(e.target.value)}
                    className="w-full rounded-lg border border-primary/10 px-3 py-2 text-sm focus:outline-none focus:border-primary/40 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save triage'}
                </button>
              </form>

              {saveMessage && (
                <div
                  className={`mt-3 text-xs px-3 py-2 rounded-lg ${
                    saveMessage.type === 'error'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {saveMessage.text}
                </div>
              )}
            </Section>

            {application.board_thread_ref && (
              <Section title="Board thread">
                <span className="text-xs font-mono text-foreground/60 bg-primary/5 px-2 py-1 rounded-full">
                  {application.board_thread_ref}
                </span>
              </Section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-primary/5 p-5 md:p-6">
      <h2 className="font-outfit font-bold text-sm text-primary mb-3 inline-flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {title}
      </h2>
      {children}
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-primary/60 font-medium mb-0.5">
        {label}
      </div>
      <div className="text-sm text-foreground/80">{value}</div>
    </div>
  );
}

function Field({ label, value, icon: Icon }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-primary/60 font-medium mb-0.5 inline-flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </div>
      <div className="text-sm text-foreground/80">{value || '—'}</div>
    </div>
  );
}

function formatBool(v) {
  if (v === true) return 'Yes';
  if (v === false) return 'No';
  return '—';
}
