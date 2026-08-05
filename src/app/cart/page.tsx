"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function CartPage() {
  const { items, removeItem, total } = useCart();
  const { user, openAuthModal } = useAuth();

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
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 p-4"
              >
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
                  onClick={() => removeItem(item.productId)}
                  className="font-mono text-xs uppercase tracking-wide text-muted hover:text-accent"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="font-mono text-sm uppercase tracking-wide text-muted">
              Total
            </p>
            <p className="font-display text-2xl text-ink">
              ₱{total.toLocaleString()}
            </p>
          </div>

          <button
            disabled
            title="Checkout ships in Phase 3 — payment gateway integration"
            className="mt-6 w-full cursor-not-allowed bg-line py-3 font-mono text-sm uppercase tracking-wide text-muted"
          >
            Checkout — Coming Soon
          </button>
        </div>
      )}
    </div>
  );
}