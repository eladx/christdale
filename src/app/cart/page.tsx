"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import ConfirmDialog from "@/components/ConfirmDialog";

const PAYMENT_METHODS = ["GCash", "Maya", "Maribank"] as const;

export default function CartPage() {
  const {
    items,
    removeItem,
    removeItems,
    selected,
    toggleSelect,
    selectAll,
    deselectAll,
    selectedItems,
    selectedTotal,
  } = useCart();
  const { user, openAuthModal } = useAuth();
  const [payment, setPayment] =
    useState<(typeof PAYMENT_METHODS)[number]>("GCash");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");

  // Which single item (by productId) is pending a Remove confirmation,
  // vs. the bulk "Delete Selected" confirmation — kept separate so the
  // dialog can show the right message for each case.
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // The nav already hides the cart link when logged out, but someone
  // could still hit /cart directly by URL — guard the page itself too.
  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center sm:px-8">
        <p className="font-mono text-xs uppercase tracking-widest2 text-accentSoft">
          Cart
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
          Log In to View Your Cart
        </h1>
        <p className="mt-4 text-muted">
          Your cart is tied to your account so it's there whenever you come
          back.
        </p>
        <button
          onClick={() => openAuthModal("login")}
          className="mt-6 bg-accent px-6 py-3 font-mono text-sm uppercase tracking-wide text-bg hover:opacity-90"
        >
          Log In / Sign Up
        </button>
      </div>
    );
  }

  async function handleCheckout() {
    setError("");
    if (selectedItems.length === 0) {
      setError("Select at least one item to check out.");
      return;
    }
    if (!fullName || !address || !phone) {
      setError("Fill in your shipping details before checking out.");
      return;
    }
    setCheckingOut(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? "";

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod: payment,
          shippingInfo: { fullName, address, phone },
          productIds: selectedItems.map((i) => i.productId),
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error ?? "Checkout failed.");
        setCheckingOut(false);
        return;
      }

      window.location.href = result.checkoutUrl;
    } catch {
      setError("Something went wrong. Try again.");
      setCheckingOut(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
      <p className="font-mono text-xs uppercase tracking-widest2 text-accentSoft">
        Cart
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
        Your Cart
      </h1>

      {items.length === 0 ? (
        <div className="mt-10 border border-line bg-surface p-8 text-center">
          <p className="text-muted">Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-block font-mono text-sm uppercase tracking-wide text-accent hover:underline"
          >
            Browse Equipment →
          </Link>
        </div>
      ) : (
        <div className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-muted">
              <input
                type="checkbox"
                checked={selected.size === items.length}
                onChange={(e) => (e.target.checked ? selectAll() : deselectAll())}
                className="h-4 w-4 accent-accent"
              />
              Select all
            </label>
            <div className="flex items-center gap-4">
              <p className="font-mono text-xs text-muted">
                {selectedItems.length} of {items.length} selected
              </p>
              <button
                onClick={() => setConfirmBulkDelete(true)}
                disabled={selectedItems.length === 0}
                className="font-mono text-xs uppercase tracking-wide text-muted hover:text-accent disabled:opacity-40 disabled:hover:text-muted"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="mt-2 divide-y divide-line border border-line bg-surface">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 p-4"
              >
                <input
                  type="checkbox"
                  checked={selected.has(item.productId)}
                  onChange={() => toggleSelect(item.productId)}
                  className="h-4 w-4 shrink-0 accent-accent"
                  aria-label={`Select ${item.name} for checkout`}
                />
                <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-surface2">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-display text-lg text-ink">
                    {item.name}
                  </p>
                  <p className="font-mono text-sm text-muted">
                    Qty {item.quantity} · ₱{item.price.toLocaleString()} each
                  </p>
                </div>
                <button
                  onClick={() => setConfirmRemoveId(item.productId)}
                  className="font-mono text-xs uppercase tracking-wide text-muted hover:text-accent"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <p className="font-mono text-xs uppercase tracking-wide text-muted">
              Shipping Details
            </p>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wide text-muted">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wide text-muted">
                Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wide text-muted">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">
              Mode of Payment
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method}
                  onClick={() => setPayment(method)}
                  className={`border px-4 py-2 font-mono text-xs uppercase tracking-wide ${
                    payment === method
                      ? "border-accent text-accent"
                      : "border-line text-muted hover:text-ink"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="font-mono text-sm uppercase tracking-wide text-muted">
              Total ({selectedItems.length} item{selectedItems.length === 1 ? "" : "s"})
            </p>
            <p className="font-display text-2xl text-ink">
              ₱{selectedTotal.toLocaleString()}
            </p>
          </div>

          {error && <p className="mt-3 text-sm text-accent">{error}</p>}

          <button
            onClick={handleCheckout}
            disabled={checkingOut || selectedItems.length === 0}
            className="mt-6 w-full bg-accent py-3 font-mono text-sm uppercase tracking-wide text-bg hover:opacity-90 disabled:opacity-50"
          >
            {checkingOut
              ? "Redirecting…"
              : selectedItems.length === 0
              ? "Select items to check out"
              : `Checkout (${selectedItems.length})`}
          </button>
          <p className="mt-3 text-center text-xs text-muted">
            Test mode — no real money is charged.
          </p>
        </div>
      )}

      <ConfirmDialog
        open={confirmRemoveId !== null}
        title="Remove Item"
        message={
          confirmRemoveId
            ? `Are you sure you want to remove "${items.find((i) => i.productId === confirmRemoveId)?.name ?? "this item"}"?`
            : ""
        }
        confirmLabel="Remove"
        danger
        busy={deleting}
        onCancel={() => setConfirmRemoveId(null)}
        onConfirm={async () => {
          if (!confirmRemoveId) return;
          setDeleting(true);
          await removeItem(confirmRemoveId);
          setDeleting(false);
          setConfirmRemoveId(null);
        }}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        title="Delete Items"
        message={`Are you sure you want to delete ${selectedItems.length} selected item${selectedItems.length === 1 ? "" : "s"}?`}
        confirmLabel="Delete"
        danger
        busy={deleting}
        onCancel={() => setConfirmBulkDelete(false)}
        onConfirm={async () => {
          setDeleting(true);
          await removeItems(selectedItems.map((i) => i.productId));
          setDeleting(false);
          setConfirmBulkDelete(false);
        }}
      />
    </div>
  );
}