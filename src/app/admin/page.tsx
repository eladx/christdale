"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AdminHomePage() {
  const { user, isAdmin, openAuthModal } = useAuth();

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center sm:px-8">
        <h1 className="font-display text-3xl text-ink">Log In Required</h1>
        <button
          onClick={() => openAuthModal("login")}
          className="mt-6 bg-accent px-6 py-3 font-mono text-sm uppercase tracking-wide text-bg hover:opacity-90"
        >
          Log In
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center sm:px-8">
        <h1 className="font-display text-3xl text-ink">Not Authorized</h1>
        <p className="mt-3 text-muted">
          This account doesn't have admin access.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
      <p className="font-mono text-xs uppercase tracking-widest2 text-accentSoft">
        Admin
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
        Dashboard
      </h1>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/orders"
          className="border border-line bg-surface p-6 transition-colors hover:border-accentSoft"
        >
          <h2 className="font-display text-xl text-ink">Orders</h2>
          <p className="mt-2 text-sm text-muted">
            View all customer orders and update status.
          </p>
        </Link>
        <Link
          href="/admin/products"
          className="border border-line bg-surface p-6 transition-colors hover:border-accentSoft"
        >
          <h2 className="font-display text-xl text-ink">Products</h2>
          <p className="mt-2 text-sm text-muted">
            Manage inventory, pricing, and add new products.
          </p>
        </Link>
      </div>
    </div>
  );
}
