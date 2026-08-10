"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuickView } from "@/context/QuickViewContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const PAYMENT_METHODS = ["GCash", "Maya", "Maribank"] as const;

export default function ProductQuickView() {
  const { product, isOpen, closeQuickView } = useQuickView();
  const { addItem } = useCart();
  const { requireAuth } = useAuth();
  const router = useRouter();

  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [variantError, setVariantError] = useState("");
  const [voucher, setVoucher] = useState("");
  const [voucherMessage, setVoucherMessage] = useState("");
  const [payment, setPayment] =
    useState<(typeof PAYMENT_METHODS)[number]>("GCash");
  const [added, setAdded] = useState(false);

  // Reset transient state whenever a different product is opened.
  useEffect(() => {
    if (isOpen) {
      setImageIndex(0);
      setQuantity(1);
      setSelectedOptions({});
      setVariantError("");
      setVoucher("");
      setVoucherMessage("");
      setAdded(false);
    }
  }, [isOpen, product?.id]);

  if (!isOpen || !product) return null;

  const images = product.images;
  const needsVariantSelection = product.variations.length > 0;
  const allVariantsSelected = product.variations.every(
    (v) => selectedOptions[v.name]
  );

  function handleAddToCart() {
    if (needsVariantSelection && !allVariantsSelected) {
      setVariantError("Select an option for each variation.");
      return;
    }
    setVariantError("");
    requireAuth(() => {
      addItem(product!, quantity, needsVariantSelection ? selectedOptions : undefined);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    });
  }

  function handleBuyNow() {
    if (needsVariantSelection && !allVariantsSelected) {
      setVariantError("Select an option for each variation.");
      return;
    }
    setVariantError("");
    requireAuth(() => {
      addItem(product!, quantity, needsVariantSelection ? selectedOptions : undefined);
      closeQuickView();
      router.push("/cart");
    });
  }

  function handleApplyVoucher() {
    if (!voucher.trim()) return;
    // No voucher/discount model exists yet — this just confirms the
    // code was noted, real validation comes with checkout (Phase 3c).
    setVoucherMessage(`"${voucher}" will be applied at checkout.`);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-8"
      onClick={closeQuickView}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-full w-full max-w-3xl overflow-y-auto border border-line bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line p-4">
          <p className="font-mono text-xs uppercase tracking-wide text-accentSoft">
            {product.category}
          </p>
          <button
            onClick={closeQuickView}
            aria-label="Close"
            className="font-mono text-sm text-muted hover:text-ink"
          >
            CLOSE
          </button>
        </div>

        <div className="grid gap-0 md:grid-cols-2">
          {/* Image carousel */}
          <div className="relative aspect-square bg-surface2">
            <Image
              src={images[imageIndex]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setImageIndex(
                      (i) => (i - 1 + images.length) % images.length
                    )
                  }
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-bg/80 px-3 py-2 font-mono text-ink hover:bg-bg"
                >
                  ‹
                </button>
                <button
                  onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-bg/80 px-3 py-2 font-mono text-ink hover:bg-bg"
                >
                  ›
                </button>
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${
                        i === imageIndex ? "bg-accent" : "bg-ink/30"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            {!product.inStock && (
              <span className="absolute left-2 top-2 bg-bg/80 px-2 py-1 font-mono text-xs uppercase tracking-wide text-muted">
                Out of Stock
              </span>
            )}
          </div>

          {/* Details */}
          <div className="p-6">
            <h2 className="font-display text-2xl text-ink">{product.name}</h2>
            <p className="mt-2 font-mono text-lg text-ink">
              ₱{product.price.toLocaleString()}
            </p>
            <p className="mt-4 text-sm text-muted">{product.description}</p>

            {/* Variations */}
            {product.variations.map((group) => (
              <div key={group.name} className="mt-6">
                <label className="block font-mono text-xs uppercase tracking-wide text-muted">
                  {group.name}
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {group.options.map((option) => (
                    <button
                      key={option}
                      onClick={() =>
                        setSelectedOptions((prev) => ({ ...prev, [group.name]: option }))
                      }
                      className={`border px-4 py-2 font-mono text-xs uppercase tracking-wide ${
                        selectedOptions[group.name] === option
                          ? "border-accent text-accent"
                          : "border-line text-muted hover:text-ink"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {variantError && (
              <p className="mt-2 text-xs text-accent">{variantError}</p>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <label className="block font-mono text-xs uppercase tracking-wide text-muted">
                Quantity
              </label>
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-8 w-8 border border-line text-ink hover:border-accentSoft"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-6 text-center font-mono text-ink">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="h-8 w-8 border border-line text-ink hover:border-accentSoft"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Voucher */}
            <div className="mt-6">
              <label className="block font-mono text-xs uppercase tracking-wide text-muted">
                Voucher Code
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={voucher}
                  onChange={(e) => setVoucher(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 border border-line bg-surface2 px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
                />
                <button
                  onClick={handleApplyVoucher}
                  className="border border-line px-4 font-mono text-xs uppercase tracking-wide text-ink hover:border-accentSoft"
                >
                  Apply
                </button>
              </div>
              {voucherMessage && (
                <p className="mt-2 text-xs text-accentSoft">
                  {voucherMessage}
                </p>
              )}
            </div>

            {/* Payment method */}
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

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 border border-line py-3 font-mono text-sm uppercase tracking-wide text-ink hover:border-accentSoft disabled:cursor-not-allowed disabled:border-line disabled:text-muted"
              >
                {!product.inStock
                  ? "Out of Stock"
                  : added
                  ? "Added ✓"
                  : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="flex-1 bg-accent py-3 font-mono text-sm uppercase tracking-wide text-bg hover:opacity-90 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
              >
                Buy Now
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-muted">
              Payment method is noted for checkout — actual payment
              processing isn't wired up yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
