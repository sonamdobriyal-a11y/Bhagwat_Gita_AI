"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  firebaseSignInWithGoogle,
  firebaseSignOut,
  isFirebaseConfigured,
  subscribeAuthState,
  type AuthSessionUser,
} from "@/lib/firebase";

export type AuthContextValue = {
  user: AuthSessionUser | null;
  loading: boolean;
  firebaseReady: boolean;
  signInWithGoogle: () => Promise<{ ok: boolean; message?: string }>;
  signOutUser: () => Promise<void>;
};

const AuthCtx = createContext<AuthContextValue | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const firebaseReady = isFirebaseConfigured();
  const [user, setUser] = useState<AuthSessionUser | null>(null);
  const [loading, setLoading] = useState(firebaseReady);

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return;
    }
    const unsub = subscribeAuthState((next) => {
      setUser(next);
      setLoading(false);
    });
    return () => unsub();
  }, [firebaseReady]);

  const signInWithGoogle = useCallback(async () => {
    if (!firebaseReady) {
      return { ok: false, message: "Add Firebase keys to `.env.local` first." };
    }
    try {
      await firebaseSignInWithGoogle();
      return { ok: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Google sign-in failed.";
      const code =
        typeof e === "object" && e !== null && "code" in e
          ? String((e as { code?: unknown }).code)
          : "";
      // User dismissed popup — not shown as alarming error if possible
      if (code === "auth/popup-closed-by-user" || msg.includes("popup-closed-by-user")) {
        return { ok: false };
      }
      return { ok: false, message: msg };
    }
  }, [firebaseReady]);

  const signOutUser = useCallback(async () => {
    if (!firebaseReady) return;
    await firebaseSignOut();
  }, [firebaseReady]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      firebaseReady,
      signInWithGoogle,
      signOutUser,
    }),
    [user, loading, firebaseReady, signInWithGoogle, signOutUser],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthCtx);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return ctx;
}
