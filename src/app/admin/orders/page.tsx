"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

type AdminOrder = {
  id: string;
  userId: string;
  customerEmail: string | null;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: { name: string; quantity: number; unitPrice: number }[];
};

const STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export default function AdminOrdersPage() {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function loadOrders() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token ?? "";
    const res = await fetch("/api/admin/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    setOrders(result.orders ?? []);
  }

  useEffect(() => {
    if (user && isAdmin) loadOrders();
  }, [user, isAdmin]);

  async function updateStatus(orderId: string, status: string) {
    setSavingId(orderId);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token ?? "";
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    setOrders((prev) =>
      prev
        ? prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        : prev
    );
    setSavingId(null);
  }

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center sm:px-8">
        <h1 className="font-display text-3xl text-ink">Not Authorized</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8">
      <p className="font-mono text-xs uppercase tracking-widest2 text-accentSoft">
        Admin
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
        Orders
      </h1>

      {orders === null && <p className="mt-10 text-sm text-muted">Loading…</p>}

      {orders && orders.length === 0 && (
        <p className="mt-10 text-sm text-muted">No orders yet.</p>
      )}

      {orders && orders.length > 0 && (
        <div className="mt-10 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-line bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-muted">{order.id}</p>
                  <p className="mt-1 text-sm text-ink">
                    {order.customerEmail ?? `User ${order.userId.slice(0, 8)}…`}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted">
                    {new Date(order.createdAt).toLocaleString("en-PH")}
                  </p>
                </div>
                <select
                  value={order.status}
                  disabled={savingId === order.id}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="border border-line bg-surface2 px-3 py-2 font-mono text-xs uppercase tracking-wide text-ink focus:border-accent focus:outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3 space-y-1 border-t border-line pt-3">
                {order.items.map((item, i) => (
                  <p key={i} className="text-xs text-muted">
                    {item.quantity}x {item.name} — ₱
                    {(item.unitPrice * item.quantity).toLocaleString()}
                  </p>
                ))}
              </div>

              <p className="mt-3 border-t border-line pt-3 text-right font-mono text-sm text-ink">
                Total: ₱{order.totalAmount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
