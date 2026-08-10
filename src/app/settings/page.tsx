"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { uploadAvatar } from "@/lib/supabase/storage";
import PasswordInput from "@/components/PasswordInput";

export default function SettingsPage() {
  const { user, openAuthModal, logout } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarStatus, setAvatarStatus] = useState("");
  const [nameStatus, setNameStatus] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [address, setAddress] = useState(user?.address ?? "");
  const [addressStatus, setAddressStatus] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);

  const [phone, setPhone] = useState(user?.phone ?? "");
  const [editingPhone, setEditingPhone] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneBusy, setPhoneBusy] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center sm:px-8">
        <p className="font-mono text-xs uppercase tracking-widest2 text-accentSoft">
          Settings
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
          Log In to Manage Your Account
        </h1>
        <button
          onClick={() => openAuthModal("login")}
          className="mt-6 bg-accent px-6 py-3 font-mono text-sm uppercase tracking-wide text-bg hover:opacity-90"
        >
          Log In / Sign Up
        </button>
      </div>
    );
  }

  async function authHeader() {
    const { data } = await supabase.auth.getSession();
    return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError("");
    setAvatarStatus("");
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleAvatarSave() {
    if (!avatarFile) return;
    setAvatarError("");
    setAvatarUploading(true);
    try {
      const url = await uploadAvatar(avatarFile);
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: url },
      });
      if (error) throw error;
      setAvatarFile(null);
      setAvatarPreview(null);
      setAvatarStatus("Saved.");
    } catch (err) {
      setAvatarError(
        "Upload failed — make sure the 'avatars' Storage bucket exists and is public."
      );
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setNameStatus("");
    setSavingName(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name },
    });
    setSavingName(false);
    setNameStatus(error ? "Something went wrong." : "Saved.");
  }

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    setAddressStatus("");
    setSavingAddress(true);
    const { error } = await supabase.auth.updateUser({
      data: { address },
    });
    setSavingAddress(false);
    setAddressStatus(error ? "Something went wrong." : "Saved.");
  }

  async function handleSendCode() {
    setPhoneError("");
    if (!phone || phone.length < 10) {
      setPhoneError("Enter a valid phone number.");
      return;
    }
    setPhoneBusy(true);
    const headers = await authHeader();
    const res = await fetch("/api/sms/send-otp", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    setPhoneBusy(false);
    if (!res.ok) {
      setPhoneError("Couldn't send code. Try again.");
      return;
    }
    setOtpSent(true);
  }

  async function handleVerifyCode() {
    setPhoneError("");
    setPhoneBusy(true);
    const headers = await authHeader();
    const res = await fetch("/api/sms/verify-otp", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ code: otpCode }),
    });
    const result = await res.json();
    setPhoneBusy(false);

    if (!res.ok) {
      setPhoneError(result.error ?? "Invalid code.");
      return;
    }

    await supabase.auth.updateUser({
      data: { phone: result.phone, phone_verified: true },
    });
    setOtpSent(false);
    setEditingPhone(false);
    setOtpCode("");
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
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setSavingPassword(false);

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordStatus("Password updated.");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  function handleLogout() {
    if (confirm("Log out of your account?")) {
      logout();
    }
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16 sm:px-8">
      <p className="font-mono text-xs uppercase tracking-widest2 text-accentSoft">
        Account
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
        Settings
      </h1>

      {/* Profile */}
      <div className="mt-10 border border-line bg-surface p-6">
        <h2 className="font-display text-xl text-ink">Profile</h2>

        <div className="mt-4 flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-line bg-surface2">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Preview"
                fill
                className="object-cover"
                sizes="64px"
                unoptimized
              />
            ) : user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt="Profile photo"
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-xl text-muted">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <label className="inline-block cursor-pointer border border-line px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-ink hover:border-accentSoft">
                Choose Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={avatarUploading}
                  className="hidden"
                />
              </label>
              {avatarFile && (
                <button
                  onClick={handleAvatarSave}
                  disabled={avatarUploading}
                  className="bg-accent px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-bg hover:opacity-90 disabled:opacity-50"
                >
                  {avatarUploading ? "Saving…" : "Save"}
                </button>
              )}
            </div>
            {avatarStatus && (
              <p className="mt-1 text-xs text-accentSoft">{avatarStatus}</p>
            )}
            {avatarError && (
              <p className="mt-1 text-xs text-accent">{avatarError}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block font-mono text-xs uppercase tracking-wide text-muted">
            Email
          </label>
          <p className="mt-2 text-sm text-ink">{user.email}</p>
          <p className="mt-1 text-xs text-muted">
            Email can't be changed here — contact support if needed.
          </p>
        </div>

        <form onSubmit={handleSaveName} className="mt-6">
          <label className="block font-mono text-xs uppercase tracking-wide text-muted">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={savingName}
              className="bg-accent px-5 py-2 font-mono text-xs uppercase tracking-wide text-bg hover:opacity-90 disabled:opacity-50"
            >
              {savingName ? "Saving…" : "Save"}
            </button>
            {nameStatus && (
              <span className="text-xs text-accentSoft">{nameStatus}</span>
            )}
          </div>
        </form>
      </div>

      {/* Shipping info */}
      <div className="mt-6 border border-line bg-surface p-6">
        <h2 className="font-display text-xl text-ink">Shipping Info</h2>
        <p className="mt-1 text-xs text-muted">
          Saved here so checkout fills it in automatically.
        </p>

        <form onSubmit={handleSaveAddress} className="mt-4">
          <label className="block font-mono text-xs uppercase tracking-wide text-muted">
            Address
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={savingAddress}
              className="bg-accent px-5 py-2 font-mono text-xs uppercase tracking-wide text-bg hover:opacity-90 disabled:opacity-50"
            >
              {savingAddress ? "Saving…" : "Save Address"}
            </button>
            {addressStatus && (
              <span className="text-xs text-accentSoft">{addressStatus}</span>
            )}
          </div>
        </form>

        <div className="mt-6 border-t border-line pt-6">
          <label className="block font-mono text-xs uppercase tracking-wide text-muted">
            Phone Number
          </label>

          {user.phoneVerified && !editingPhone ? (
            <div className="mt-2 flex items-center gap-3">
              <p className="text-sm text-ink">{user.phone}</p>
              <span className="font-mono text-xs uppercase text-accentSoft">
                Verified ✓
              </span>
              <button
                onClick={() => {
                  setEditingPhone(true);
                  setOtpSent(false);
                  setPhone(user.phone);
                }}
                className="font-mono text-xs uppercase text-muted hover:text-accent"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <div className="mt-2 flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09XXXXXXXXX"
                  disabled={otpSent}
                  className="flex-1 border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none disabled:opacity-50"
                />
                {!otpSent && (
                  <button
                    onClick={handleSendCode}
                    disabled={phoneBusy}
                    className="border border-line px-4 font-mono text-xs uppercase tracking-wide text-ink hover:border-accentSoft disabled:opacity-50"
                  >
                    {phoneBusy ? "Sending…" : "Send Code"}
                  </button>
                )}
              </div>

              {otpSent && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="6-digit code"
                    className="flex-1 border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                  />
                  <button
                    onClick={handleVerifyCode}
                    disabled={phoneBusy}
                    className="bg-accent px-4 font-mono text-xs uppercase tracking-wide text-bg hover:opacity-90 disabled:opacity-50"
                  >
                    Verify
                  </button>
                </div>
              )}

              {phoneError && (
                <p className="mt-2 text-xs text-accent">{phoneError}</p>
              )}
              {otpSent && (
                <p className="mt-2 text-xs text-muted">
                  Code sent — check the server console for now (real SMS
                  sending isn't connected yet).
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Password */}
      <div className="mt-6 border border-line bg-surface p-6">
        <h2 className="font-display text-xl text-ink">Change Password</h2>

        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">
              New Password
            </label>
            <div className="mt-2">
              <PasswordInput value={newPassword} onChange={setNewPassword} />
            </div>
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">
              Confirm New Password
            </label>
            <div className="mt-2">
              <PasswordInput
                value={confirmPassword}
                onChange={setConfirmPassword}
              />
            </div>
          </div>

          {passwordError && (
            <p className="text-sm text-accent">{passwordError}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={savingPassword}
              className="bg-accent px-5 py-2 font-mono text-xs uppercase tracking-wide text-bg hover:opacity-90 disabled:opacity-50"
            >
              {savingPassword ? "Saving…" : "Update Password"}
            </button>
            {passwordStatus && (
              <span className="text-xs text-accentSoft">{passwordStatus}</span>
            )}
          </div>
        </form>
      </div>

      {/* Account actions */}
      <div className="mt-6 border border-line bg-surface p-6">
        <h2 className="font-display text-xl text-ink">Account</h2>
        <button
          onClick={handleLogout}
          className="mt-4 border border-line px-5 py-2 font-mono text-xs uppercase tracking-wide text-ink hover:border-accentSoft hover:text-accentSoft"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}