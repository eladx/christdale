"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/products";
import { useQuickView } from "@/context/QuickViewContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { openQuickView } = useQuickView();
  const { requireAuth } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();
  const [hoverIndex, setHoverIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasGallery = product.images.length > 1;

  function handleMouseEnter() {
    if (!hasGallery) return;
    let i = 0;
    intervalRef.current = setInterval(() => {
      i = (i + 1) % product.images.length;
      setHoverIndex(i);
    }, 700);
  }

  function handleMouseLeave() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setHoverIndex(0);
  }

  // Clean up if the card unmounts mid-hover (e.g. filter changes it away).
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const hasVariations = product.variations.length > 0;

  function handleAddToCart() {
    if (hasVariations) {
      openQuickView(product);
      return;
    }
    requireAuth(() => {
      addItem(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    });
  }

  function handleBuyNow() {
    if (hasVariations) {
      openQuickView(product);
      return;
    }
    requireAuth(() => {
      addItem(product);
      router.push("/cart");
    });
  }

  return (
    <div className="group border border-line bg-surface transition-colors hover:border-accentSoft">
      <button
        onClick={() => openQuickView(product)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative block aspect-square w-full overflow-hidden bg-surface2"
      >
        <Image
          src={product.images[hoverIndex]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
        {hasGallery && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {product.images.map((_, i) => (
              <span
                key={i}
                className={`h-1 w-1 rounded-full transition-colors ${
                  i === hoverIndex ? "bg-accent" : "bg-ink/40"
                }`}
              />
            ))}
          </div>
        )}
        {!product.inStock && (
          <span className="absolute left-2 top-2 bg-bg/80 px-2 py-1 font-mono text-xs uppercase tracking-wide text-muted">
            Out of Stock
          </span>
        )}
      </button>
      <div className="p-4">
        <p className="font-mono text-xs uppercase tracking-wide text-accentSoft">
          {product.category}
        </p>
        <button
          onClick={() => openQuickView(product)}
          className="mt-1 block text-left font-display text-lg leading-tight text-ink hover:text-accentSoft"
        >
          {product.name}
        </button>
        <p className="mt-2 font-mono text-sm text-ink">
          ₱{product.price.toLocaleString()}
        </p>

        <div className="mt-3 flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="flex-1 border border-line py-2 font-mono text-xs uppercase tracking-wide text-ink transition-colors hover:border-accentSoft disabled:cursor-not-allowed disabled:border-line disabled:text-muted"
          >
            {!product.inStock
              ? "Out of Stock"
              : hasVariations
              ? "Select Options"
              : added
              ? "Added ✓"
              : "Add to Cart"}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!product.inStock}
            className="flex-1 bg-accent py-2 font-mono text-xs uppercase tracking-wide text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
