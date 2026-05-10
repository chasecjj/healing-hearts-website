import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Lock, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

export default function AccountPassword() {
  usePageMeta('Change Password', 'Update your Healing Hearts account password.');
  const { user, updatePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from current password.');
      return;
    }

    setLoading(true);

    // Reauthenticate: verify current password before allowing the change.
    // Supabase's updateUser({password}) only requires an active session, so
    // without this check a stolen session could set a new password freely.
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (reauthError) {
      setError('Current password is incorrect.');
      setLoading(false);
      return;
    }

    const { error: updateError } = await updatePassword(newPassword);
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link
        to="/portal"
        className="inline-flex items-center gap-2 font-sans text-sm text-foreground/60 hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to portal
      </Link>

      <h1 className="font-outfit font-bold text-3xl text-primary mb-2">Change password</h1>
      <p className="font-sans text-foreground/60 mb-8">
        Signed in as <strong className="text-primary">{user?.email}</strong>
      </p>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl mb-6 text-sm font-sans flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Password updated successfully.</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm font-sans">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm">
        <PasswordField
          label="Current password"
          value={currentPassword}
          onChange={setCurrentPassword}
          autoComplete="current-password"
          placeholder="Enter your current password"
        />
        <PasswordField
          label="New password"
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
          placeholder="At least 6 characters"
          minLength={6}
        />
        <PasswordField
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          minLength={6}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-primary text-background font-outfit font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
          ) : (
            <>
              Update password
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-foreground/50">
        Forgot your current password?{' '}
        <Link to="/forgot-password" className="text-accent hover:underline">
          Reset it by email
        </Link>
      </p>
    </div>
  );
}

function PasswordField({ label, value, onChange, autoComplete, placeholder, minLength }) {
  return (
    <div className="mb-4">
      <label className="block font-outfit text-sm font-medium text-primary/80 mb-2">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-primary/15 bg-background font-sans text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
        />
      </div>
    </div>
  );
}
