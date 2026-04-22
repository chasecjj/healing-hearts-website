import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Download,
  LayoutDashboard,
  Users,
  CheckSquare,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// ── Sidebar content ────────────────────────────────────────────────────────
function SidebarContent({ onNavClick }) {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Student';
  const email = user?.email || '';
  const rolePill = isAdmin ? 'Admin' : 'Student';

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary font-semibold'
        : 'text-foreground/60 hover:text-foreground hover:bg-primary/5'
    }`;

  return (
    <div className="flex flex-col h-full px-4 py-6 gap-6">
      {/* ── Account card ─────────────────────────────────── */}
      <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4 flex flex-col gap-3">
        <div>
          <p className="font-outfit font-semibold text-foreground text-sm leading-tight">
            {displayName}
          </p>
          <p className="font-sans text-xs text-foreground/50 truncate mt-0.5" title={email}>
            {email}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-outfit font-bold uppercase tracking-wider ${
              isAdmin
                ? 'bg-accent/10 text-accent'
                : 'bg-primary/10 text-primary'
            }`}
          >
            {rolePill}
          </span>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 text-xs text-foreground/50 hover:text-foreground transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>

      {/* ── Student nav ──────────────────────────────────── */}
      <nav className="flex flex-col gap-1">
        <p className="px-3 mb-1 text-[10px] font-outfit font-bold uppercase tracking-widest text-foreground/30">
          My Portal
        </p>
        <NavLink to="/portal" end className={navLinkClass} onClick={onNavClick}>
          <BookOpen className="w-4 h-4 flex-shrink-0" />
          My Course
        </NavLink>
        <NavLink to="/portal/downloads" className={navLinkClass} onClick={onNavClick}>
          <Download className="w-4 h-4 flex-shrink-0" />
          Downloads
        </NavLink>
      </nav>

      {/* ── Admin nav (role-gated) ────────────────────────── */}
      {isAdmin && (
        <>
          <div className="h-px bg-primary/10" />
          <nav className="flex flex-col gap-1">
            <p className="px-3 mb-1 text-[10px] font-outfit font-bold uppercase tracking-widest text-foreground/30">
              Admin
            </p>
            <NavLink to="/admin" end className={navLinkClass} onClick={onNavClick}>
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              Dashboard
            </NavLink>
            <NavLink to="/admin/crm" className={navLinkClass} onClick={onNavClick}>
              <Users className="w-4 h-4 flex-shrink-0" />
              CRM
            </NavLink>
            <NavLink to="/admin/tasks" className={navLinkClass} onClick={onNavClick}>
              <CheckSquare className="w-4 h-4 flex-shrink-0" />
              Tasks
            </NavLink>
          </nav>
        </>
      )}

      {/* ── Footer spacer + contact ──────────────────────── */}
      <div className="mt-auto pt-4 border-t border-primary/10">
        <p className="px-3 text-[10px] text-foreground/30 leading-relaxed">
          Healing Hearts v2026 ·{' '}
          <a href="/contact" className="hover:text-primary transition-colors">
            Contact
          </a>
        </p>
      </div>
    </div>
  );
}

// ── PortalLayout ───────────────────────────────────────────────────────────
export default function PortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* ── Desktop sidebar (fixed) ─────────────────────────── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-background border-r border-primary/10 z-40 overflow-y-auto">
        <SidebarContent onNavClick={() => {}} />
      </aside>

      {/* ── Mobile sidebar backdrop ─────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 md:hidden"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile sidebar overlay ───────────────────────────── */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-background border-r border-primary/10 z-50 overflow-y-auto transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onNavClick={() => setSidebarOpen(false)} />
      </aside>

      {/* ── Mobile hamburger ─────────────────────────────────── */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-xl bg-background border border-primary/15 shadow-sm flex items-center justify-center text-primary hover:bg-primary/5 transition-colors"
        onClick={() => setSidebarOpen((prev) => !prev)}
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen overflow-y-auto pt-16 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
