"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import ConfirmDialog from "@/components/ConfirmDialog";

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
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, isAdmin, openAuthModal, logout } = useAuth();
  const { count } = useCart();

  function handleLogout() {
    setShowLogoutConfirm(true);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-sm">
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
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-label="Account menu"
                  aria-expanded={profileOpen}
                  className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-line bg-surface2 transition-colors hover:border-accentSoft"
                >
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center font-display text-sm text-muted">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 border border-line bg-surface py-2 shadow-lg">
                      <div className="border-b border-line px-4 py-3">
                        <p className="font-display text-base text-ink">
                          {user.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/orders"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2 text-left normal-case tracking-normal text-ink hover:bg-surface2"
                      >
                        My Purchases
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2 text-left normal-case tracking-normal text-ink hover:bg-surface2"
                      >
                        Settings
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 text-left normal-case tracking-normal text-ink hover:bg-surface2"
                        >
                          Admin
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          handleLogout();
                        }}
                        className="block w-full px-4 py-2 text-left normal-case tracking-normal text-ink hover:bg-surface2"
                      >
                        Log Out
                      </button>
                    </div>
                  </>
                )}
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
          className="relative flex h-8 w-8 flex-col items-center justify-center gap-[5px] text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <span
            className={`h-[2px] w-6 bg-current transition-transform duration-200 ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-[2px] w-6 bg-current transition-opacity duration-200 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`h-[2px] w-6 bg-current transition-transform duration-200 ${
              open ? "translate-y-[-7px] -rotate-45" : ""
            }`}
          />
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
              <Link
                href="/orders"
                className="py-2 transition-colors hover:text-accent"
                onClick={() => setOpen(false)}
              >
                My Purchases ({user.name})
              </Link>
              <Link
                href="/settings"
                className="py-2 transition-colors hover:text-accent"
                onClick={() => setOpen(false)}
              >
                Settings
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="py-2 transition-colors hover:text-accent"
                  onClick={() => setOpen(false)}
                >
                  Admin
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="py-2 text-left hover:text-accent"
              >
                Log Out
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

      {showLogoutConfirm && (
        <ConfirmDialog
          message="Are you sure you want to log out?"
          confirmLabel="Log Out"
          onConfirm={() => {
            setShowLogoutConfirm(false);
            logout();
          }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </header>
  );
}
