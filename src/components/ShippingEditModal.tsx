"use client";

import { useState } from "react";

export default function ShippingEditModal({
  fullName,
  address,
  phone,
  onSave,
  onClose,
}: {
  fullName: string;
  address: string;
  phone: string;
  onSave: (data: { fullName: string; address: string; phone: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(fullName);
  const [addr, setAddr] = useState(address);
  const [tel, setTel] = useState(phone);
  const [error, setError] = useState("");

  function handleSave() {
    if (!name || !addr || !tel) {
      setError("All fields are required.");
      return;
    }
    onSave({ fullName: name, address: addr, phone: tel });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm border border-line bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">Edit Shipping Details</h2>
          <button onClick={onClose} className="font-mono text-sm text-muted hover:text-ink">
            CLOSE
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">
              Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">
              Address
            </label>
            <textarea
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
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
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-accent">{error}</p>}

          <button
            onClick={handleSave}
            className="w-full bg-accent py-3 font-mono text-sm uppercase tracking-wide text-bg hover:opacity-90"
          >
            Save
          </button>
          <p className="text-center text-xs text-muted">
            This only updates this order — go to Settings to change your saved default.
          </p>
        </div>
      </div>
    </div>
  );
}