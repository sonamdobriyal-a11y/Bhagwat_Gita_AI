"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { SiteLogo } from "@/components/SiteLogo";

const NAV_LINKS = [
  { href: "/#text", label: "Discover" },
  { href: "/chat", label: "Dialogue" },
  { href: "/journal", label: "Journal" },
  { href: "/stories", label: "Stories" },
  { href: "/about", label: "About" },
];


function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "text-gita-earth"
          : "text-gita-muted hover:text-gita-peacock"
      }`}
    >
      {active && (
        <span
          className="absolute inset-0 -z-10 rounded-full bg-white/80 shadow-sm shadow-gita-earth/5 ring-1 ring-gita-saffron/20"
          aria-hidden
        />
      )}
      {label}
    </Link>
  );
}

export function AppNav() {
  const pathname = usePathname();
  const { user, loading, firebaseReady, signInWithGoogle, signOutUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/session", { credentials: "include" });
        if (!res.ok || cancelled) return;
        const j = (await res.json()) as { authenticated?: boolean };
        if (!cancelled) setIsAdmin(Boolean(j.authenticated));
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/40 bg-gita-ivory/75 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_0_rgba(143,94,58,0.05)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
        <SiteLogo onClick={() => setOpen(false)} />

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} active={isActive(l.href)} />
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={`relative rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive("/admin") ? "text-gita-earth" : "text-gita-muted hover:text-gita-peacock"
              }`}
            >
              {isActive("/admin") && (
                <span
                  className="absolute inset-0 -z-10 rounded-full bg-white/80 shadow-sm shadow-gita-earth/5 ring-1 ring-gita-saffron/20"
                  aria-hidden
                />
              )}
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/chat"
            className="hidden rounded-full bg-gradient-to-r from-gita-saffron-soft to-gita-saffron px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-gita-saffron/20 transition hover:brightness-[1.02] sm:inline-flex"
          >
            Start chatting
          </Link>

          {loading ? (
            <span className="rounded-full px-3 py-1.5 text-xs text-gita-muted">…</span>
          ) : user ? (
            <div className="flex items-center gap-2">
              {user.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={user.image}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-md"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gita-saffron text-xs font-bold text-white">
                  {user.name?.[0]?.toUpperCase() ?? "·"}
                </div>
              )}
              <button
                type="button"
                onClick={() => void signOutUser()}
                className="hidden rounded-full border border-gita-line/80 bg-white/60 px-3 py-1.5 text-xs font-semibold text-gita-muted transition hover:border-gita-saffron/35 hover:text-gita-peacock sm:inline"
              >
                Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!firebaseReady}
              title={!firebaseReady ? "Configure Firebase env first" : undefined}
              onClick={() =>
                void (async () => {
                  const r = await signInWithGoogle();
                  if (r.message) window.alert(r.message);
                })()
              }
              className="rounded-full border border-gita-line/90 bg-gradient-to-b from-orange-50 to-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-gita-earth shadow-sm transition hover:border-gita-saffron/35 hover:shadow-md disabled:opacity-45 sm:text-sm sm:normal-case sm:tracking-normal"
            >
              Sign in
            </button>
          )}

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gita-line/60 bg-white/50 text-gita-earth md:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">Menu</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-gita-line/40 bg-gita-ivory/95 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-3 text-sm font-semibold ${
                  isActive(l.href) ? "bg-gita-saffron/10 text-gita-peacock" : "text-gita-earth"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-3 text-sm font-semibold ${
                  isActive("/admin") ? "bg-gita-saffron/10 text-gita-peacock" : "text-gita-earth"
                }`}
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
