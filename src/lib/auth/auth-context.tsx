import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getCurrentUser,
  getUserWorkspace,
  isMockAuthMode,
  listenToAuthState,
  signOut as apiSignOut,
  type MockUser,
  type MockWorkspace,
} from "./auth-api";

type Status = "loading" | "authed" | "anon";

interface AuthContextValue {
  status: Status;
  user: MockUser | null;
  workspace: MockWorkspace | null;
  isMockMode: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<MockUser | null>(null);
  const [workspace, setWorkspace] = useState<MockWorkspace | null>(null);

  const refresh = useCallback(async () => {
    const u = await getCurrentUser();
    const w = await getUserWorkspace();
    setUser(u);
    setWorkspace(w);
    setStatus(u ? "authed" : "anon");
  }, []);

  useEffect(() => {
    refresh();
    const unsub = listenToAuthState(() => refresh());
    // In mock mode, listen for storage events from other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === "veto.auth.user" || e.key === "veto.workspace") refresh();
    };
    if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
    return () => {
      unsub();
      if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  const signOut = useCallback(async () => {
    await apiSignOut();
    setUser(null);
    setWorkspace(null);
    setStatus("anon");
    if (typeof window !== "undefined") window.location.href = "/auth/sign-in";
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, workspace, isMockMode: isMockAuthMode, refresh, signOut }),
    [status, user, workspace, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
