"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type SessionInfo = {
  authenticated: boolean;
  adminSecretConfigured: boolean;
  serviceAccountConfigured: boolean;
};

export default function AdminSignIn() {
  const router = useRouter();
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [secretInput, setSecretInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const refreshSession = useCallback(async () => {
    const res = await fetch("/api/admin/session", { credentials: "include" });
    if (!res.ok) return;
    const j = (await res.json()) as SessionInfo;
    setSession(j);
    if (j.authenticated) {
      router.replace("/admin");
    }
  }, [router]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ secret: secretInput }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setLoginError(j.error ?? `Login failed (${res.status}).`);
        return;
      }
      setSecretInput("");
      // Full navigation ensures the new httpOnly cookie is sent to the server page check
      window.location.assign("/admin");
    } catch {
      setLoginError("Network error signing in.");
    } finally {
      setLoggingIn(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gita-field-warm px-5 py-16 font-sans text-gita-earth">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex text-sm text-gita-muted hover:text-gita-peacock transition-colors">
          ← Back to site
        </Link>

        {session === null ? (
          <p className="text-sm text-gita-muted">Loading…</p>
        ) : !session.adminSecretConfigured ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Set <strong>ADMIN_PANEL_SECRET</strong> in <code className="text-xs">frontend/.env.local</code>{" "}
            (or <code className="text-xs">frontend/.env</code>), then restart the dev server.
          </div>
        ) : (
          <>
            {!session.serviceAccountConfigured ? (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                <strong>FIREBASE_SERVICE_ACCOUNT_JSON</strong> is not configured — you can sign in, but the user
                table will not load until it is set.
              </div>
            ) : null}
          <form
            onSubmit={(e) => void handleLogin(e)}
            className="glass-panel space-y-4 rounded-2xl p-8"
          >
            <h1 className="font-display text-lg font-semibold text-gita-peacock">Admin sign-in</h1>
            <p className="text-sm text-gita-muted">
              Enter the server admin secret. Session is stored in an httpOnly cookie.
            </p>
            <label className="block text-sm font-medium text-gita-earth">
              Admin secret
              <input
                type="password"
                autoComplete="off"
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gita-line bg-white px-3 py-2.5 text-sm outline-none ring-2 ring-transparent focus:border-gita-saffron/35 focus:ring-gita-peacock/10"
              />
            </label>
            {loginError ? (
              <p className="text-sm text-red-700" role="alert">
                {loginError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loggingIn || !secretInput.trim()}
              className="btn-primary w-full py-3 text-sm disabled:opacity-40"
            >
              {loggingIn ? "Checking…" : "Unlock dashboard"}
            </button>
          </form>
          </>
        )}
      </div>
    </div>
  );
}
