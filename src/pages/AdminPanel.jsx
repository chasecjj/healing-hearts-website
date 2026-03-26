import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, FileText, BarChart3, CreditCard, Mail, Calendar, BookOpen } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

const PLANNED_FEATURES = [
  { icon: Users, title: 'Application Review', description: 'View, filter, and respond to incoming applications. See qualification flags and lead warmth scores.' },
  { icon: Calendar, title: 'Webinar Management', description: 'Schedule webinars, view registrations, send reminders, and manage replay access.' },
  { icon: Mail, title: 'Email Dashboard', description: 'Monitor Spark Challenge drip progress, webinar follow-ups, and email delivery health.' },
  { icon: BookOpen, title: 'Content Management', description: 'Edit course modules and lessons directly. Manage content blocks without touching code.' },
  { icon: CreditCard, title: 'Enrollment & Payments', description: 'Stripe payment dashboard, enrollment status, and coupon management.' },
  { icon: BarChart3, title: 'Analytics', description: 'Funnel conversion rates, lesson completion tracking, and engagement metrics.' },
  { icon: FileText, title: 'CRM & Close Process', description: 'Track leads through the consultation pipeline. Makayla close SOP integration.' },
];

export default function AdminPanel() {
  usePageMeta('Admin Panel', 'Healing Hearts administration dashboard.');

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 pt-32 md:pt-40 pb-24">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-drama italic text-4xl md:text-5xl text-primary mb-4">
            Admin Panel
          </h1>
          <p className="font-sans text-foreground/60 text-lg font-light max-w-md mx-auto">
            This dashboard is being built. Here's what's coming.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            to="/portal"
            className="px-6 py-3 rounded-full bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-lg"
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

        {/* Planned Features Grid */}
        <h2 className="font-outfit font-bold text-2xl text-primary mb-8 text-center">
          Planned Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLANNED_FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-6 border border-primary/5 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-outfit font-bold text-base text-primary mb-1">
                    {feature.title}
                  </h3>
                  <p className="font-sans text-foreground/60 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
