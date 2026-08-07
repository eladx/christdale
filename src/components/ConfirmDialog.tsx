"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Shared confirm-before-you-regret-it dialog. Used anywhere an action is
// destructive or hard to undo: logout, removing cart items, deleting
// products, etc. Keeping this in one place means every confirmation in
// the app looks and behaves the same way.
//
// This renders through a portal straight onto document.body. It has to —
// the desktop nav's logout button lives inside <header>, which has
// `backdrop-blur` on it, and `backdrop-filter` (like `transform` or
// `filter`) makes an element a new positioning boundary for any
// `position: fixed` descendant. Without the portal, the dialog gets
// trapped inside that header's little strip at the top of the page
// instead of centering on the full viewport. Portaling to <body> sidesteps
// that regardless of what filter/transform effects exist on any ancestor,
// now or in the future.
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(0, 0, 0, 0.7)",
      }}
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        style={{ width: "100%", maxWidth: "24rem" }}
        className="border border-line bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="font-display text-xl text-ink">
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={busy}
            className="border border-line px-4 py-2 font-mono text-xs uppercase tracking-wide text-ink hover:border-accentSoft disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`px-5 py-2 font-mono text-xs uppercase tracking-wide disabled:opacity-50 ${
              danger
                ? "bg-accent text-bg hover:opacity-90"
                : "bg-ink text-bg hover:opacity-90"
            }`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}