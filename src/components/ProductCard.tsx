"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { useQuickView } from "@/context/QuickViewContext";

export default function ProductCard({ product }: { product: Product }) {
  const { openQuickView } = useQuickView();
  const [hoverIndex, setHoverIndex] = useState(0);
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

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

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

        <button
          onClick={() => openQuickView(product)}
          disabled={!product.inStock}
          className="mt-3 w-full bg-accent py-2 font-mono text-xs uppercase tracking-wide text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
        >
          {!product.inStock ? "Out of Stock" : "Buy Now"}
        </button>
      </div>
    </div>
  );
}