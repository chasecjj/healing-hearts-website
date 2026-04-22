import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, CheckSquare } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';
import KpiCards from '../components/admin/KpiCards';

export default function AdminPanel() {
  usePageMeta('Admin Panel', 'Healing Hearts administration dashboard.');

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 pt-8 md:pt-12 pb-24">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-drama italic text-4xl md:text-5xl text-primary mb-4">
            Admin Panel
          </h1>
          <p className="font-sans text-foreground/60 text-lg font-light max-w-md mx-auto">
            Live stats across the Healing Hearts funnel.
          </p>
        </div>

        {/* KPI Cards */}
        <section className="mb-16">
          <div className="relative rounded-3xl overflow-hidden mb-8 p-8 sm:p-12 bg-primary/10 min-h-[200px] flex flex-col justify-center">
            {/* Ambient blurred glow layer */}
            <div className="absolute inset-0 z-0 opacity-30 overflow-hidden" aria-hidden="true">
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-accent blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="font-outfit font-bold text-xl text-primary mb-6">
                Live Dashboard
              </h2>
              <KpiCards />
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            to="/admin/crm"
            className="px-6 py-3 rounded-full bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-lg inline-flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            CRM — Leads
          </Link>
          <Link
            to="/admin/tasks"
            className="px-6 py-3 rounded-full bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors shadow-lg inline-flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            Team Tasks
          </Link>
          <Link
            to="/portal"
            className="px-6 py-3 rounded-full border-2 border-primary/20 text-primary font-medium text-sm hover:bg-primary hover:text-white transition-all"
          >
            Course Portal (Full Access)
          </Link>
          <a
            href="https://supabase.com/dashboard/project/qleojrlqnbiutyhfnqgb"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full border-2 border-primary/20 text-primary font-medium text-sm hover:bg-primary hover:text-white transition-all"
          >
            Supabase Dashboard
          </a>
          <a
            href="https://resend.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full border-2 border-primary/20 text-primary font-medium text-sm hover:bg-primary hover:text-white transition-all"
          >
            Resend (Email)
          </a>
        </div>
      </div>
    </div>
  );
}
