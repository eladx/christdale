"use client";

import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Phase 4: replace with a real submission — POST to an API route
    // that writes a CoachingRequest row (see prisma/schema.prisma)
    // and/or sends an email notification.
    setSubmitted(true);
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16 sm:px-8">
      <p className="font-mono text-xs uppercase tracking-widest2 text-accentSoft">
        Contact
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
        Get In Touch
      </h1>
      <p className="mt-4 text-muted">
        Questions about equipment, coaching requests, or anything else —
        send it over.
      </p>

      {submitted ? (
        <div className="mt-10 border border-line bg-surface p-6">
          <p className="font-display text-xl text-ink">Message sent.</p>
          <p className="mt-2 text-sm text-muted">
            This is a placeholder confirmation — hook this form up to a real
            endpoint before launch.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">
              Name
            </label>
            <input
              required
              type="text"
              className="mt-2 w-full border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">
              Email
            </label>
            <input
              required
              type="email"
              className="mt-2 w-full border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">
              Message
            </label>
            <textarea
              required
              rows={5}
              className="mt-2 w-full border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-accent px-6 py-3 font-mono text-sm uppercase tracking-wide text-bg hover:opacity-90"
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  );
}
