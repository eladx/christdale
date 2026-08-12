"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ConfirmDialog({
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: {
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm border border-line bg-surface p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-ink">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="border border-line px-5 py-2 font-mono text-xs uppercase tracking-wide text-ink hover:border-accentSoft"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-accent px-5 py-2 font-mono text-xs uppercase tracking-wide text-bg hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}