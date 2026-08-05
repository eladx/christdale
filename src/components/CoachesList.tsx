"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import CoachCard from "@/components/CoachCard";
import type { Coach } from "@/lib/coaches";

export default function CoachesList({ coaches }: { coaches: Coach[] }) {
  const { requireAuth } = useAuth();
  const router = useRouter();

  function handleRequestCoaching() {
    requireAuth(() => {
      router.push("/contact");
    });
  }

  return (
    <>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {coaches.map((c) => (
          <CoachCard key={c.id} coach={c} />
        ))}
      </div>

      <div className="mt-12 border border-line bg-surface p-8 text-center">
        <p className="font-display text-2xl text-ink">Ready to start?</p>
        <p className="mt-2 text-muted">
          Coaching requests go through a short intake so we can match you
          properly.
        </p>
        <button
          onClick={handleRequestCoaching}
          className="mt-6 inline-block bg-accent px-6 py-3 font-mono text-sm uppercase tracking-wide text-bg hover:opacity-90"
        >
          Request Coaching
        </button>
      </div>
    </>
  );
}
