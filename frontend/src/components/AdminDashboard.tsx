"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type AuthUserRow = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  disabled: boolean;
  providers: string[];
  createdAt: string | null;
  lastSignInAt: string | null;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<AuthUserRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  const loadTables = useCallback(async () => {
    setLoadError(null);
    setLoadingData(true);
    try {
      const uRes = await fetch("/api/admin/users", { credentials: "include" });
      if (uRes.status === 401) {
        setLoadError("Session expired or invalid. Sign in again at /admin/signin.");
        return;
      }
      if (!uRes.ok) {
        const j = (await uRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `Users request failed (${uRes.status})`);
      }
      const uJson = (await uRes.json()) as { users: AuthUserRow[] };
      setUsers(uJson.users ?? []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load data.");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    void loadTables();
  }, [loadTables]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setUsers([]);
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-gita-field-warm pb-16 font-sans text-gita-earth">
      <header className="border-b border-gita-line/60 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="label mb-1">Internal</p>
            <h1 className="font-display text-xl font-semibold tracking-tight text-gita-peacock md:text-2xl">
              Admin dashboard
            </h1>
            <p className="mt-1 text-sm text-gita-muted">
              Firebase Authentication users · Firestore <code className="text-xs">feedback</code> entries
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/" className="btn-secondary px-4 py-2 text-sm">
              Exit to site
            </Link>
            <button type="button" onClick={() => void handleLogout()} className="btn-accent px-4 py-2 text-sm">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-base font-semibold text-gita-peacock">
                Registered users <span className="ml-1 font-sans text-sm font-normal text-gita-muted">({users.length})</span>
              </h2>
              <button
                type="button"
                disabled={loadingData}
                onClick={() => void loadTables()}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-45"
              >
                {loadingData ? "Refreshing…" : "Refresh"}
              </button>
            </div>

            {loadError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{loadError}</p>
            ) : null}

            <div className="overflow-x-auto rounded-2xl border border-gita-line bg-white shadow-sm">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-gita-line bg-gita-field-warm/80 text-xs uppercase tracking-wide text-gita-muted">
                    <th className="px-3 py-3">UID</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Providers</th>
                    <th className="px-3 py-3">Created</th>
                    <th className="px-3 py-3">Last sign-in</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-gita-muted">
                        {loadingData ? "Loading…" : "No users yet."}
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.uid} className="border-b border-gita-line/60 hover:bg-gita-field-warm/40">
                        <td className="max-w-[9rem] truncate px-3 py-2 font-mono text-xs text-gita-peacock">{u.uid}</td>
                        <td className="px-3 py-2">{u.email ?? "—"}</td>
                        <td className="px-3 py-2">{u.displayName ?? "—"}</td>
                        <td className="px-3 py-2 text-xs">{u.providers.join(", ") || "—"}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-xs text-gita-muted">
                          {u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-xs text-gita-muted">
                          {u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleString() : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </main>
    </div>
  );
}
