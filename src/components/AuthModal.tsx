"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthModal() {
  const { isModalOpen, modalMode, closeAuthModal, login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(modalMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);

  // Runs once per modal open (not on every render), so it sets the
  // initial tab correctly without fighting manual tab clicks afterward.
  useEffect(() => {
    if (isModalOpen) {
      setMode(modalMode);
      setError("");
      setCheckEmail(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  // Switching tabs clears the form instead of carrying values across —
  // an email typed into Login shouldn't reappear in Sign Up.
  function switchMode(next: "login" | "signup") {
    setMode(next);
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  }

  function handleClose() {
    closeAuthModal();
    setCheckEmail(false);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password || (mode === "signup" && !name)) {
      setError("Fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        const { needsConfirmation } = await signup(name, email, password);
        if (needsConfirmation) setCheckEmail(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm border border-line bg-surface p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="font-display text-2xl text-ink">
            {mode === "login" ? "Log In" : "Create Account"}
          </p>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="font-mono text-sm text-muted hover:text-ink"
          >
            CLOSE
          </button>
        </div>

        <p className="mt-2 text-sm text-muted">
          {mode === "login"
            ? "Log in to buy equipment or request a coach."
            : "Create an account to buy equipment or request a coach."}
        </p>

        {checkEmail ? (
          <div className="mt-6 border border-line bg-surface2 p-4">
            <p className="font-display text-lg text-ink">Check your email</p>
            <p className="mt-2 text-sm text-muted">
              We sent a confirmation link to <strong>{email}</strong>. Click
              it, then come back and log in.
            </p>
            <button
              onClick={() => {
                setCheckEmail(false);
                switchMode("login");
              }}
              className="mt-4 font-mono text-xs uppercase tracking-wide text-accent hover:underline"
            >
              Back to Log In
            </button>
          </div>
        ) : (
          <>
            <div className="mt-6 flex border-b border-line font-mono text-xs uppercase tracking-wide">
              <button
                className={`flex-1 pb-3 ${
                  mode === "login"
                    ? "border-b-2 border-accent text-ink"
                    : "text-muted hover:text-ink"
                }`}
                onClick={() => switchMode("login")}
              >
                Log In
              </button>
              <button
                className={`flex-1 pb-3 ${
                  mode === "signup"
                    ? "border-b-2 border-accent text-ink"
                    : "text-muted hover:text-ink"
                }`}
                onClick={() => switchMode("signup")}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wide text-muted">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wide text-muted">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase tracking-wide text-muted">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>

              {error && <p className="text-sm text-accent">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-accent py-3 font-mono text-sm uppercase tracking-wide text-bg hover:opacity-90 disabled:opacity-50"
              >
                {submitting
                  ? "Please wait…"
                  : mode === "login"
                  ? "Log In"
                  : "Create Account"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}