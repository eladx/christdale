"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import ShippingEditModal from "@/components/ShippingEditModal";

const PAYMENT_METHODS = ["GCash", "Maya", "Maribank"] as const;

function lineKey(productId: string, variantKey: string) {
  return `${productId}::${variantKey}`;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const { user, openAuthModal } = useAuth();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [payment, setPayment] =
    useState<(typeof PAYMENT_METHODS)[number]>("GCash");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const [showShippingModal, setShowShippingModal] = useState(false);

  // Default to all items selected. New items added later also default in.
  useEffect(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      items.forEach((i) => {
        const key = lineKey(i.productId, i.variantKey);
        if (!prev.has(key)) next.add(key);
      });
      Array.from(next).forEach((key) => {
        if (!items.find((i) => lineKey(i.productId, i.variantKey) === key)) {
          next.delete(key);
        }
      });
      return next;
    });
  }, [items]);

  // Prefill shipping details from saved profile (Settings), still editable.
  useEffect(() => {
    if (user) {
      setFullName((v) => v || user.name);
      setAddress((v) => v || user.address);
      setPhone((v) => v || user.phone);
    }
  }, [user]);

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

  function toggleSelected(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleRemove(productId: string, variantKey: string, name: string) {
    if (confirm(`Remove "${name}" from your cart?`)) {
      removeItem(productId, variantKey);
    }
  }

  const selectedItems = items.filter((i) =>
    selected.has(lineKey(i.productId, i.variantKey))
  );
  const selectedTotal = selectedItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

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
          items: selectedItems.map((i) => ({
            productId: i.productId,
            variantKey: i.variantKey,
          })),
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
          <div className="divide-y divide-line border border-line bg-surface">
            {items.map((item) => {
              const key = lineKey(item.productId, item.variantKey);
              return (
                <div key={key} className="flex items-center gap-4 p-4">
                  <input
                    type="checkbox"
                    checked={selected.has(key)}
                    onChange={() => toggleSelected(key)}
                    className="h-4 w-4 accent-accent"
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
                    {item.selectedOptions && (
                      <p className="font-mono text-xs text-accentSoft">
                        {Object.entries(item.selectedOptions)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")}
                      </p>
                    )}
                    <p className="font-mono text-sm text-muted">
                      ₱{item.price.toLocaleString()} each
                    </p>
                  </div>

                  {/* Quantity stepper */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.variantKey, item.quantity - 1)
                      }
                      className="h-7 w-7 border border-line text-ink hover:border-accentSoft"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-mono text-sm text-ink">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.variantKey, item.quantity + 1)
                      }
                      className="h-7 w-7 border border-line text-ink hover:border-accentSoft"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemove(item.productId, item.variantKey, item.name)}
                    className="font-mono text-xs uppercase tracking-wide text-muted hover:text-accent"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-wide text-muted">
                Shipping Details
              </p>
              <button
                onClick={() => setShowShippingModal(true)}
                aria-label="Edit shipping details"
                className="text-muted hover:text-accent"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
                </svg>
              </button>
            </div>

            {fullName || address || phone ? (
              <div className="mt-2 border border-line bg-surface2 p-3 text-sm">
                <p className="text-ink">{fullName || "—"}</p>
                <p className="mt-1 text-muted">{address || "—"}</p>
                <p className="mt-1 text-muted">{phone || "—"}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">
                No shipping details yet — click the icon to add them.
              </p>
            )}

            {(!user.address || !user.phone) && (
              <p className="mt-2 text-xs text-muted">
                <Link href="/settings" className="text-accent hover:underline">
                  Save your address and verify your phone in Settings
                </Link>{" "}
                to skip this next time.
              </p>
            )}
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
              Total ({selectedItems.length} of {items.length} selected)
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
              : `Checkout (${selectedItems.length})`}
          </button>
          <p className="mt-3 text-center text-xs text-muted">
            Test mode — no real money is charged.
          </p>
        </div>
      )}

      {showShippingModal && (
        <ShippingEditModal
          fullName={fullName}
          address={address}
          phone={phone}
          onSave={({ fullName: n, address: a, phone: p }) => {
            setFullName(n);
            setAddress(a);
            setPhone(p);
          }}
          onClose={() => setShowShippingModal(false)}
        />
      )}
    </div>
  );
}
