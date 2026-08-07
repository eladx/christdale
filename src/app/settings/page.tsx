"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function SettingsPage() {
  const { user, openAuthModal, logout } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const [name, setName] = useState(user?.name ?? "");
  const [nameStatus, setNameStatus] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center sm:px-8">
        <p className="font-mono text-xs uppercase tracking-widest2 text-accentSoft">Settings</p>
        <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">Log In to Manage Your Account</h1>
        <button onClick={() => openAuthModal("login")} className="mt-6 bg-accent px-6 py-3 font-mono text-sm uppercase tracking-wide text-bg hover:opacity-90">
          Log In / Sign Up
        </button>
      </div>
    );
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setNameStatus("");
    setSavingName(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
    setSavingName(false);
    setNameStatus(error ? "Something went wrong." : "Saved.");
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordStatus("");

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordStatus("Password updated.");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16 sm:px-8">
      <p className="font-mono text-xs uppercase tracking-widest2 text-accentSoft">Account</p>
      <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">Settings</h1>

      <div className="mt-10 border border-line bg-surface p-6">
        <h2 className="font-display text-xl text-ink">Profile</h2>

        <div className="mt-4">
          <label className="block font-mono text-xs uppercase tracking-wide text-muted">Email</label>
          <p className="mt-2 text-sm text-ink">{user.email}</p>
          <p className="mt-1 text-xs text-muted">Email can't be changed here — contact support if needed.</p>
        </div>

        <form onSubmit={handleSaveName} className="mt-6">
          <label className="block font-mono text-xs uppercase tracking-wide text-muted">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
          <div className="mt-3 flex items-center gap-3">
            <button type="submit" disabled={savingName} className="bg-accent px-5 py-2 font-mono text-xs uppercase tracking-wide text-bg hover:opacity-90 disabled:opacity-50">
              {savingName ? "Saving…" : "Save"}
            </button>
            {nameStatus && <span className="text-xs text-accentSoft">{nameStatus}</span>}
          </div>
        </form>
      </div>

      <div className="mt-6 border border-line bg-surface p-6">
        <h2 className="font-display text-xl text-ink">Change Password</h2>

        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          {passwordError && <p className="text-sm text-accent">{passwordError}</p>}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={savingPassword} className="bg-accent px-5 py-2 font-mono text-xs uppercase tracking-wide text-bg hover:opacity-90 disabled:opacity-50">
              {savingPassword ? "Saving…" : "Update Password"}
            </button>
            {passwordStatus && <span className="text-xs text-accentSoft">{passwordStatus}</span>}
          </div>
        </form>
      </div>

      <div className="mt-6 border border-line bg-surface p-6">
        <h2 className="font-display text-xl text-ink">Account</h2>
        <button onClick={() => setConfirmLogout(true)} className="mt-4 border border-line px-5 py-2 font-mono text-xs uppercase tracking-wide text-ink hover:border-accentSoft hover:text-accentSoft">
          Log Out
        </button>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Log Out"
        message="Are you sure you want to logout?"
        confirmLabel="Log Out"
        danger
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          logout();
          setConfirmLogout(false);
        }}
      />
    </div>
  );
}