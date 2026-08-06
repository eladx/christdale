"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

type OrderItem = { productId: string; name: string; image: string; quantity: number; unitPrice: number };
type Order = { id: string; status: string; totalAmount: number; createdAt: string; items: OrderItem[] };

const STATUS_STYLES: Record<string, string> = {
  PAID: "text-accentSoft border-accentSoft",
  PENDING: "text-muted border-line",
  PROCESSING: "text-accentSoft border-accentSoft",
  SHIPPED: "text-accentSoft border-accentSoft",
  DELIVERED: "text-accent border-accent",
  CANCELLED: "text-muted border-line",
  REFUNDED: "text-muted border-line",
};

const TABS = [
  { label: "All", statuses: null },
  { label: "To Pay", statuses: ["PENDING"] },
  { label: "To Ship", statuses: ["PAID", "PROCESSING"] },
  { label: "To Receive", statuses: ["SHIPPED"] },
  { label: "Completed", statuses: ["DELIVERED"] },
  { label: "Return/Refund", statuses: ["REFUNDED"] },
  { label: "Cancelled", statuses: ["CANCELLED"] },
] as const;

export default function OrdersPage() {
  const { user, openAuthModal } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["label"]>("All");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? "";
      const res = await fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      setOrders(result.orders ?? []);
    })();
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center sm:px-8">
        <p className="font-mono text-xs uppercase tracking-widest2 text-accentSoft">My Purchases</p>
        <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">Log In to View Your Purchases</h1>
        <button onClick={() => openAuthModal("login")} className="mt-6 bg-accent px-6 py-3 font-mono text-sm uppercase tracking-wide text-bg hover:opacity-90">
          Log In / Sign Up
        </button>
      </div>
    );
  }

  const activeStatuses = TABS.find((t) => t.label === activeTab)?.statuses;
  const filtered = orders
    ? activeStatuses
      ? orders.filter((o) => (activeStatuses as readonly string[]).includes(o.status))
      : orders
    : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
      <p className="font-mono text-xs uppercase tracking-widest2 text-accentSoft">Account</p>
      <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">My Purchases</h1>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-line pb-4">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wide ${
              activeTab === tab.label ? "bg-accent text-bg" : "border border-line text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {orders === null && <p className="mt-10 text-sm text-muted">Loading…</p>}

      {filtered?.length === 0 && (
        <div className="mt-10 border border-line bg-surface p-8 text-center">
          <p className="text-muted">{activeTab === "All" ? "No orders yet." : `Nothing in "${activeTab}" right now.`}</p>
          <Link href="/products" className="mt-4 inline-block font-mono text-sm uppercase tracking-wide text-accent hover:underline">
            Browse Equipment →
          </Link>
        </div>
      )}

      {filtered && filtered.length > 0 && (
        <div className="mt-10 space-y-6">
          {filtered.map((order) => (
            <div key={order.id} className="border border-line bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-4">
                <div>
                  <p className="font-mono text-xs text-muted">Order {order.id}</p>
                  <p className="mt-1 font-mono text-xs text-muted">
                    {new Date(order.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
                <span className={`border px-3 py-1 font-mono text-xs uppercase tracking-wide ${STATUS_STYLES[order.status] ?? "text-muted border-line"}`}>
                  {order.status}
                </span>
              </div>

              <div className="divide-y divide-line">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4 p-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-surface2">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-ink">{item.name}</p>
                      <p className="font-mono text-xs text-muted">Qty {item.quantity} · ₱{item.unitPrice.toLocaleString()} each</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-line p-4">
                <p className="font-mono text-xs uppercase tracking-wide text-muted">Total</p>
                <p className="font-display text-lg text-ink">₱{order.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}