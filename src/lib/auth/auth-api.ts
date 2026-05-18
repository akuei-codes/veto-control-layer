/**
 * Unified auth surface. Branches between real Supabase and mock/demo mode.
 *
 * In mock mode user/workspace are stored in localStorage so the existing
 * demo flow is preserved exactly as before.
 */
import { AUTH_REDIRECT_URL, getSupabase, isMockAuthMode } from "./supabase-client";

export interface MockUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  provider: "email" | "google" | "github" | "demo";
}

export interface MockWorkspace {
  id: string;
  name: string;
  company: string;
  role: string;
  agentType: string;
  createdAt: number;
}

const LS_USER = "veto.auth.user";
const LS_WORKSPACE = "veto.workspace";
const LS_ONBOARDED = "veto.onboarded";

// ─── helpers ──────────────────────────────────────────────────────────────
function lsGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function lsSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}
function lsDel(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

function mockUserFromEmail(email: string, provider: MockUser["provider"]): MockUser {
  return {
    id: `mock_${btoa(email).replace(/=/g, "")}`,
    email,
    name: email.split("@")[0]!.replace(/[._-]/g, " "),
    provider,
  };
}

// ─── session / user ──────────────────────────────────────────────────────
export async function getCurrentUser(): Promise<MockUser | null> {
  const sb = getSupabase();
  if (!sb) return lsGet<MockUser>(LS_USER);
  const { data } = await sb.auth.getUser();
  if (!data.user) return null;
  const meta = data.user.user_metadata ?? {};
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    name: (meta.full_name as string) || (meta.name as string) || (data.user.email ?? ""),
    avatar_url: (meta.avatar_url as string) ?? null,
    provider: ((data.user.app_metadata?.provider as MockUser["provider"]) ?? "email"),
  };
}

export async function getCurrentSession() {
  const sb = getSupabase();
  if (!sb) return lsGet<MockUser>(LS_USER) ? { mock: true } : null;
  const { data } = await sb.auth.getSession();
  return data.session;
}

export function listenToAuthState(cb: () => void): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};
  const { data } = sb.auth.onAuthStateChange(() => cb());
  return () => data.subscription.unsubscribe();
}

// ─── email / password ─────────────────────────────────────────────────────
export async function signUpWithEmail(email: string, password: string, name?: string) {
  const sb = getSupabase();
  if (!sb) {
    const user = { ...mockUserFromEmail(email, "email"), name: name || mockUserFromEmail(email, "email").name };
    lsSet(LS_USER, user);
    return { user, needsConfirmation: false };
  }
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: AUTH_REDIRECT_URL,
      data: { full_name: name },
    },
  });
  if (error) throw error;
  return { user: data.user, needsConfirmation: !data.session };
}

export async function signInWithEmail(email: string, password: string) {
  const sb = getSupabase();
  if (!sb) {
    const user = mockUserFromEmail(email, "email");
    lsSet(LS_USER, user);
    return { user };
  }
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { user: data.user };
}

export async function signInWithGoogle() {
  const sb = getSupabase();
  if (!sb) {
    lsSet(LS_USER, mockUserFromEmail("you@google.demo", "google"));
    if (typeof window !== "undefined") window.location.href = "/auth/callback";
    return;
  }
  const { error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: AUTH_REDIRECT_URL },
  });
  if (error) throw error;
}

export async function signInWithGitHub() {
  const sb = getSupabase();
  if (!sb) {
    lsSet(LS_USER, mockUserFromEmail("you@github.demo", "github"));
    if (typeof window !== "undefined") window.location.href = "/auth/callback";
    return;
  }
  const { error } = await sb.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: AUTH_REDIRECT_URL },
  });
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const sb = getSupabase();
  if (!sb) return { ok: true };
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/reset-password` : undefined,
  });
  if (error) throw error;
  return { ok: true };
}

export async function signOut() {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
  lsDel(LS_USER);
  lsDel(LS_WORKSPACE);
  lsDel(LS_ONBOARDED);
}

// ─── workspace ────────────────────────────────────────────────────────────
export async function getUserWorkspace(): Promise<MockWorkspace | null> {
  // For now workspace lives in localStorage in both modes — real persistence
  // wires in once Cloud is enabled.
  return lsGet<MockWorkspace>(LS_WORKSPACE);
}

export async function createWorkspaceForUser(input: {
  workspaceName: string;
  company: string;
  role: string;
  agentType: string;
}): Promise<MockWorkspace> {
  const workspace: MockWorkspace = {
    id: `ws_${Date.now().toString(36)}`,
    name: input.workspaceName,
    company: input.company,
    role: input.role,
    agentType: input.agentType,
    createdAt: Date.now(),
  };
  lsSet(LS_WORKSPACE, workspace);
  lsSet(LS_ONBOARDED, "1");
  return workspace;
}

export { isMockAuthMode };
