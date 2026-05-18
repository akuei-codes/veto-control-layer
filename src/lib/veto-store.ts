/**
 * Veto in-memory store.
 *
 * One source of truth for the running session: events, approvals, policies,
 * audit logs, notifications, integrations, api keys. Components subscribe
 * via `useVeto*` selectors and get re-rendered on change.
 *
 * Designed so the entire data layer can later be replaced with a Supabase
 * realtime adapter without touching components: same shapes, same selectors.
 */

import { useSyncExternalStore } from "react";
import {
  type ActionEvent,
  type ActionStatus,
  type ApiKey,
  type ApprovalRequest,
  type AuditLog,
  type AuditKind,
  type Integration,
  type Notification,
  type Organization,
  type Policy,
  type ReplaySession,
  type User,
  type Workspace,
} from "./veto-schema";
import {
  seedAgents,
  seedApiKeys,
  seedAuditLogs,
  seedEvents,
  seedIntegrations,
  seedNotifications,
  seedOrg,
  seedPolicies,
  seedUser,
  seedWorkspace,
  nextEvent,
  storyInitialEvent,
  STORY_EVENT_ID,
} from "./seed";
import type { Agent } from "./veto-schema";

// ─── State shape ──────────────────────────────────────────────────────────
export interface VetoState {
  org: Organization;
  workspace: Workspace;
  user: User;
  agents: Agent[];
  events: ActionEvent[];
  approvals: ApprovalRequest[];
  policies: Policy[];
  integrations: Integration[];
  apiKeys: ApiKey[];
  audit: AuditLog[];
  notifications: Notification[];
  replay: Record<string, ReplaySession>;
  /** Demo scenario UI state. */
  demo: {
    running: boolean;
    caption: string | null;
    resolved: string | null;
  };
}

// ─── Pub/sub ──────────────────────────────────────────────────────────────
type Listener = () => void;
const listeners = new Set<Listener>();
let state: VetoState = initialState();
let initialized = false;

function initialState(): VetoState {
  return {
    org: seedOrg,
    workspace: seedWorkspace,
    user: seedUser,
    agents: seedAgents,
    events: [],
    approvals: [],
    policies: seedPolicies,
    integrations: seedIntegrations,
    apiKeys: seedApiKeys,
    audit: [],
    notifications: [],
    replay: {},
    demo: { running: false, caption: null, resolved: null },
  };
}

function emit() {
  for (const l of listeners) l();
}

function set(updater: (s: VetoState) => VetoState) {
  state = updater(state);
  emit();
}

function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  // Hydrate seed events lazily on the client so SSR snapshot stays empty.
  set((s) => ({
    ...s,
    events: seedEvents(),
    audit: seedAuditLogs(),
    notifications: seedNotifications(),
  }));
  // Start the ambient stream.
  startAmbientStream();
}

// ─── Mutations ────────────────────────────────────────────────────────────
function addAudit(
  kind: AuditKind,
  message: string,
  opts: { target_id?: string; actor_kind?: AuditLog["actor_kind"] } = {},
) {
  set((s) => ({
    ...s,
    audit: [
      {
        id: `log_${cryptoId()}`,
        workspace_id: s.workspace.id,
        actor_id: opts.actor_kind === "agent" ? "agent" : s.user.id,
        actor_kind: opts.actor_kind ?? "user",
        kind,
        target_id: opts.target_id,
        message,
        at: new Date().toISOString(),
      },
      ...s.audit,
    ].slice(0, 200),
  }));
}

function pushNotification(n: Omit<Notification, "id" | "at" | "read">) {
  set((s) => ({
    ...s,
    notifications: [
      {
        ...n,
        id: `ntf_${cryptoId()}`,
        at: new Date().toISOString(),
        read: false,
      },
      ...s.notifications,
    ].slice(0, 50),
  }));
}

export const vetoActions = {
  ingestEvent(event: ActionEvent) {
    set((s) => ({
      ...s,
      events: [event, ...s.events.filter((e) => e.id !== event.id)].slice(0, 200),
      replay: {
        ...s.replay,
        [event.id]: buildReplay(event),
      },
    }));
    addAudit("action.intercepted", `${event.agent_name} → ${event.tool}`, {
      target_id: event.id,
      actor_kind: "agent",
    });
    if (event.requires_approval) {
      pushNotification({
        kind: "approval_required",
        title: `Approval required · ${event.agent_name}`,
        body: event.summary,
        event_id: event.id,
        level: event.risk.level === "critical" ? "critical" : "warning",
      });
    } else if (event.status === "blocked") {
      pushNotification({
        kind: "action_blocked",
        title: `Auto-blocked · ${event.tool}`,
        body: event.summary,
        event_id: event.id,
        level: "warning",
      });
    }
  },

  decide(eventId: string, decision: Extract<ActionStatus, "approved" | "denied" | "escalated" | "blocked">, note?: string) {
    const now = new Date().toISOString();
    set((s) => {
      const events = s.events.map((e): ActionEvent =>
        e.id === eventId
          ? {
              ...e,
              status: decision,
              phase: decision === "approved" ? ("executed" as const) : ("terminated" as const),
              decided_at: now,
              decided_by: s.user.id,
              decision_note: note,
            }
          : e,
      );
      return {
        ...s,
        events,
        replay: { ...s.replay, [eventId]: appendReplay(s.replay[eventId], decision, now) },
      };
    });
    const ev = state.events.find((e) => e.id === eventId);
    if (!ev) return;
    addAudit("action.decided", `${decision.toUpperCase()} · ${ev.tool}`, { target_id: eventId });

    if (decision === "approved") {
      // Optimistic execution after a beat.
      setTimeout(() => {
        set((s) => ({
          ...s,
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, status: "executed", phase: "executed" } : e,
          ),
        }));
        addAudit("action.executed", `Executed ${ev.tool}`, { target_id: eventId });
        pushNotification({
          kind: "info",
          title: `Executed · ${ev.tool}`,
          body: ev.summary,
          event_id: eventId,
          level: "success",
        });
      }, 900);
    } else {
      pushNotification({
        kind: "action_blocked",
        title: `${decision === "denied" ? "Denied" : decision === "blocked" ? "Blocked" : "Escalated"} · ${ev.tool}`,
        body: ev.summary,
        event_id: eventId,
        level: decision === "escalated" ? "info" : "success",
      });
    }
  },

  togglePolicy(policyId: string) {
    set((s) => ({
      ...s,
      policies: s.policies.map((p) =>
        p.id === policyId ? { ...p, enabled: !p.enabled } : p,
      ),
    }));
    const p = state.policies.find((x) => x.id === policyId);
    if (p) addAudit("policy.toggled", `${p.enabled ? "Enabled" : "Disabled"} · ${p.title}`, { target_id: p.id });
  },

  markAllNotificationsRead() {
    set((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  rotateApiKey(id: string) {
    set((s) => ({
      ...s,
      apiKeys: s.apiKeys.map((k) =>
        k.id === id
          ? {
              ...k,
              last4: Math.random().toString(36).slice(-4),
              created_at: new Date().toISOString(),
            }
          : k,
      ),
    }));
    addAudit("apikey.rotated", `Rotated key ${id}`, { target_id: id });
  },

  /** Story-mode: scripted critical incident. */
  async runStoryDemo() {
    if (state.demo.running) return;
    set((s) => ({ ...s, demo: { running: true, caption: null, resolved: null } }));

    const event = storyInitialEvent();
    vetoActions.ingestEvent(event);

    const beats: { delay: number; caption: string; patch?: Partial<ActionEvent> }[] = [
      { delay: 700, caption: "Cursor agent dispatched `postgres.execute` to production-db-east-1" },
      { delay: 1100, caption: "Veto intercepted — extracting tool call, resolving connection target" },
      { delay: 1100, caption: "Risk engine: destructive DDL + production cluster + irreversible" },
      { delay: 1100, caption: "Estimating blast radius: 412,118 active users · 1.2B rows" },
      { delay: 1000, caption: "Policy P-001 matched — human approval required" },
      { delay: 800, caption: "Awaiting human decision · Deny to protect production" },
    ];

    for (const b of beats) {
      await wait(b.delay);
      set((s) => ({ ...s, demo: { ...s.demo, caption: b.caption } }));
      if (b.patch) {
        set((s) => ({
          ...s,
          events: s.events.map((e) => (e.id === event.id ? { ...e, ...b.patch! } : e)),
        }));
      }
    }
    set((s) => ({ ...s, demo: { ...s.demo, running: false } }));
  },

  markStoryResolved() {
    set((s) => ({
      ...s,
      demo: { ...s.demo, resolved: "Production database protected.", caption: "Human denied destructive action. Zero rows touched." },
    }));
  },
};

// ─── Ambient stream (mock realtime) ───────────────────────────────────────
let ambientHandle: ReturnType<typeof setInterval> | null = null;
function startAmbientStream() {
  if (ambientHandle) return;
  ambientHandle = setInterval(() => {
    // Pause ambient stream while a story demo is being driven.
    if (state.demo.running) return;
    const event = nextEvent(state.workspace.id, state.agents);
    vetoActions.ingestEvent(event);
  }, 4800);
}

// ─── Replay assembly ──────────────────────────────────────────────────────
function buildReplay(e: ActionEvent): ReplaySession {
  const now = e.created_at;
  return {
    event_id: e.id,
    final_status: e.status,
    steps: [
      { phase: "proposed", label: "Agent proposed", detail: e.tool, at: now },
      { phase: "intercepted", label: "Intercepted", detail: "Veto control plane", at: now },
      {
        phase: "analyzing",
        label: "Risk analyzed",
        detail: `score ${e.risk.score} · ${e.risk.level}`,
        at: now,
      },
      {
        phase: "policy_eval",
        label: "Policies evaluated",
        detail: e.policy_violations[0] ?? "No violations",
        at: now,
      },
      {
        phase: "decision",
        label: e.requires_approval ? "Awaiting human" : "Auto-decision",
        detail: e.status.toUpperCase(),
        at: now,
      },
    ],
  };
}

function appendReplay(
  base: ReplaySession | undefined,
  decision: ActionStatus,
  at: string,
): ReplaySession {
  if (!base) return { event_id: "", steps: [], final_status: decision };
  return {
    ...base,
    final_status: decision,
    steps: [
      ...base.steps,
      {
        phase: decision === "approved" ? "executed" : "terminated",
        label: decision === "approved" ? "Executed" : "Terminated",
        detail:
          decision === "approved"
            ? "Action allowed to proceed"
            : decision === "denied" || decision === "blocked"
              ? "Disaster prevented"
              : "Routed to sandbox / senior reviewer",
        at,
      },
    ],
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
function cryptoId() {
  return Math.random().toString(36).slice(2, 10);
}
export { STORY_EVENT_ID };

// ─── React bindings ───────────────────────────────────────────────────────
const subscribe = (l: Listener) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;
const getServerSnapshot = () => state;

export function useVetoStore<T>(selector: (s: VetoState) => T): T {
  ensureInit();
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(getServerSnapshot()),
  );
}

export const useVetoEvents = () => useVetoStore((s) => s.events);
export const useVetoPolicies = () => useVetoStore((s) => s.policies);
export const useVetoApiKeys = () => useVetoStore((s) => s.apiKeys);
export const useVetoIntegrations = () => useVetoStore((s) => s.integrations);
export const useVetoNotifications = () => useVetoStore((s) => s.notifications);
export const useVetoAudit = () => useVetoStore((s) => s.audit);
export const useVetoWorkspace = () => useVetoStore((s) => s.workspace);
export const useVetoUser = () => useVetoStore((s) => s.user);
export const useVetoOrg = () => useVetoStore((s) => s.org);
export const useVetoDemo = () => useVetoStore((s) => s.demo);
export const useVetoReplay = (id: string | null) =>
  useVetoStore((s) => (id ? s.replay[id] ?? null : null));

export const useVetoUnreadCount = () =>
  useVetoStore((s) => s.notifications.filter((n) => !n.read).length);
export const useVetoPendingCount = () =>
  useVetoStore((s) => s.events.filter((e) => e.status === "pending" || e.status === "intercepted").length);
