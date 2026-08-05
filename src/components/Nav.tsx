"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Shop" },
  { href: "/coaches", label: "Coaches" },
  { href: "/contact", label: "Contact" },
];

function CartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { user, openAuthModal, logout } = useAuth();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur">
      <div className="wrap flex items-center justify-between py-4 md:grid md:grid-cols-[auto_1fr_auto] md:gap-4">
        <Link
          href="/"
          className="font-display text-xl tracking-widest2 text-ink"
        >
          CHRISTDALE
        </Link>

        <nav className="hidden items-center justify-center gap-8 font-mono text-sm uppercase tracking-wide text-muted md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-accent"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-6 font-mono text-sm uppercase tracking-wide text-muted md:flex">
          {user ? (
            <>
              <Link
                href="/cart"
                aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}
                className="relative flex items-center text-ink transition-colors hover:text-accent"
              >
                <CartIcon />
                {count > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent font-mono text-[10px] text-bg">
                    {count}
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-accentSoft">Hi, {user.name}</span>
                <button onClick={logout} className="hover:text-accent">
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => openAuthModal("login")}
                className="hover:text-accent"
              >
                Login
              </button>
              <button
                onClick={() => openAuthModal("signup")}
                className="border border-line px-4 py-1.5 text-ink hover:border-accentSoft hover:text-accentSoft"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        <button
          className="text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <span className="font-mono text-sm">{open ? "CLOSE" : "MENU"}</span>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-line px-6 py-4 font-mono text-sm uppercase tracking-wide text-muted md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="py-2 transition-colors hover:text-accent"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}

          {user ? (
            <>
              <Link
                href="/cart"
                className="flex items-center gap-2 py-2 transition-colors hover:text-accent"
                onClick={() => setOpen(false)}
              >
                <CartIcon />
                Cart{count > 0 ? ` (${count})` : ""}
              </Link>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="py-2 text-left hover:text-accent"
              >
                Log Out ({user.name})
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  openAuthModal("login");
                  setOpen(false);
                }}
                className="py-2 text-left hover:text-accent"
              >
                Login
              </button>
              <button
                onClick={() => {
                  openAuthModal("signup");
                  setOpen(false);
                }}
                className="py-2 text-left hover:text-accent"
              >
                Sign Up
              </button>
            </>
          )}
        </nav>
      )}
    </header>
  );
}