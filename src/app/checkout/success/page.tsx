"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const [status, setStatus] = useState<"checking" | "PAID" | "PENDING" | "error">("checking");

  useEffect(() => {
    if (!orderId) { setStatus("error"); return; }
    (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? "";
      try {
        const res = await fetch(`/api/checkout/verify?order=${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        setStatus(result.status === "PAID" ? "PAID" : "PENDING");
      } catch {
        setStatus("error");
      }
    })();
  }, [orderId]);

  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center sm:px-8">
      {status === "checking" && <p className="font-mono text-sm text-muted">Confirming your payment…</p>}
      {status === "PAID" && (
        <>
          <p className="font-mono text-xs uppercase tracking-widest2 text-accentSoft">Order Confirmed</p>
          <h1 className="mt-3 font-display text-4xl text-ink">Thanks for your order</h1>
          <p className="mt-4 text-muted">
            Payment received. Order reference: <span className="font-mono text-ink">{orderId}</span>
          </p>
          <Link href="/products" className="mt-8 inline-block bg-accent px-6 py-3 font-mono text-sm uppercase tracking-wide text-bg hover:opacity-90">
            Continue Shopping
          </Link>
        </>
      )}
      {status === "PENDING" && (
        <>
          <h1 className="font-display text-3xl text-ink">Payment Not Confirmed Yet</h1>
          <p className="mt-4 text-muted">
            If you completed payment, it may take a moment to confirm. Refresh this page, or check your cart in a minute.
          </p>
        </>
      )}
      {status === "error" && (
        <p className="text-muted">Something went wrong confirming this order. Contact support if you were charged.</p>
      )}
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-6 py-24 text-center sm:px-8"><p className="font-mono text-sm text-muted">Loading…</p></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}