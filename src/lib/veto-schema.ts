/**
 * Veto — production schema layer.
 *
 * These types model the full backend-ready domain. Mock adapters in
 * `veto-store.ts` populate them in-memory today; tomorrow they map 1:1 to
 * Supabase / Postgres tables with the same column names.
 */

// ─── Primitive aliases ────────────────────────────────────────────────────
export type ID = string;
export type ISODate = string;
export type Millis = number;

// ─── Identity ─────────────────────────────────────────────────────────────
export interface Organization {
  id: ID;
  name: string;
  slug: string;
  created_at: ISODate;
  plan: "free" | "team" | "enterprise";
}

export interface Workspace {
  id: ID;
  org_id: ID;
  name: string;
  environment: "development" | "staging" | "production";
  created_at: ISODate;
}

export interface User {
  id: ID;
  email: string;
  name: string;
  avatar_initials: string;
  role: "owner" | "admin" | "engineer" | "viewer";
  org_id: ID;
}

// ─── Agents (the AI clients calling Veto) ─────────────────────────────────
export interface Agent {
  id: ID;
  workspace_id: ID;
  name: string;
  vendor: "anthropic" | "openai" | "cursor" | "replit" | "internal" | "other";
  icon: string;
  fingerprint: string; // sdk + version
  last_seen: ISODate;
  status: "active" | "idle" | "quarantined";
  intercepts_24h: number;
}

// ─── Policies ─────────────────────────────────────────────────────────────
export type PolicyCategory = "Data" | "Secrets" | "Comms" | "Billing" | "Infra" | "Identity";
export type PolicyAction = "block" | "approve" | "sandbox" | "log";

export interface Policy {
  id: ID;
  workspace_id: ID;
  code: string;          // human handle, e.g. "P-001"
  title: string;
  description: string;
  category: PolicyCategory;
  action: PolicyAction;
  enabled: boolean;
  triggered_count: number;
  created_at: ISODate;
}

// ─── Risk ─────────────────────────────────────────────────────────────────
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskFactor {
  key: string;          // e.g. "production_target"
  label: string;        // human label
  weight: number;       // 0..1
  contribution: number; // 0..100
}

export interface RiskAssessment {
  score: number;                       // 0..100
  level: RiskLevel;
  confidence: number;                  // model confidence 0..1
  factors: RiskFactor[];
  estimated_users_affected: number;
  estimated_financial_impact_usd: number;
  reversibility: "reversible" | "partial" | "irreversible";
  environment: "development" | "staging" | "production";
  computed_at: ISODate;
}

// ─── Actions & events ─────────────────────────────────────────────────────
export type ActionStatus =
  | "intercepted"
  | "analyzing"
  | "pending"        // awaiting human
  | "approved"
  | "denied"
  | "executed"       // approved + completed
  | "blocked"        // auto-blocked by policy
  | "escalated"      // routed to senior approver / sandbox
  | "expired";

export type InterceptionPhase =
  | "proposed"
  | "intercepted"
  | "analyzing"
  | "policy_eval"
  | "decision"
  | "executed"
  | "terminated";

export interface ActionEvent {
  id: ID;
  workspace_id: ID;
  agent_id: ID;
  agent_name: string;
  agent_icon: string;

  tool: string;                  // "postgres.execute"
  summary: string;               // natural-language one-liner
  reasoning: string;             // agent's chain-of-thought
  raw_call: string;              // serialized tool call
  resources: string[];           // affected resource URNs

  risk: RiskAssessment;
  blast_radius: string;          // narrative blast description
  policy_violations: string[];   // policy.code list
  recommendation: string;        // Veto recommendation

  status: ActionStatus;
  phase: InterceptionPhase;
  requires_approval: boolean;

  created_at: ISODate;
  decided_at?: ISODate;
  decided_by?: ID;
  decision_note?: string;
}

// ─── Approval requests (1:1 with pending action events) ───────────────────
export interface ApprovalRequest {
  id: ID;
  event_id: ID;
  requested_at: ISODate;
  expires_at: ISODate;
  required_approvers: number;
  approvers: { user_id: ID; decision: "approve" | "deny"; at: ISODate }[];
  status: "open" | "resolved" | "expired";
}

// ─── Integrations / credentials ───────────────────────────────────────────
export interface Integration {
  id: ID;
  workspace_id: ID;
  kind: "sdk" | "webhook" | "github" | "slack" | "pagerduty";
  label: string;
  status: "connected" | "pending" | "error";
  connected_at?: ISODate;
  meta: Record<string, string>;
}

export interface ApiKey {
  id: ID;
  workspace_id: ID;
  name: string;
  environment: "development" | "staging" | "production";
  prefix: string;       // "vk_live_"
  last4: string;
  created_at: ISODate;
  last_used_at?: ISODate;
  revoked: boolean;
}

// ─── Audit log ────────────────────────────────────────────────────────────
export type AuditKind =
  | "action.intercepted"
  | "action.decided"
  | "action.executed"
  | "policy.toggled"
  | "policy.created"
  | "integration.connected"
  | "apikey.rotated"
  | "user.invited";

export interface AuditLog {
  id: ID;
  workspace_id: ID;
  actor_id: ID;          // user or agent id
  actor_kind: "user" | "agent" | "system";
  kind: AuditKind;
  target_id?: ID;
  message: string;
  at: ISODate;
}

// ─── Notifications (in-app) ───────────────────────────────────────────────
export interface Notification {
  id: ID;
  kind: "approval_required" | "action_blocked" | "policy_triggered" | "info";
  title: string;
  body?: string;
  event_id?: ID;
  level: "info" | "warning" | "critical" | "success";
  read: boolean;
  at: ISODate;
}

// ─── Replay sessions ──────────────────────────────────────────────────────
export interface ReplayStep {
  phase: InterceptionPhase;
  label: string;
  detail: string;
  at: ISODate;
}

export interface ReplaySession {
  event_id: ID;
  steps: ReplayStep[];
  final_status: ActionStatus;
}

// ─── Back-compat shim for existing components ─────────────────────────────
// The old UI used a flat `AgentAction` shape. We provide an adapter so old
// imports keep compiling while we migrate.
export interface AgentAction {
  id: string;
  ts: number;
  agent: string;
  agentIcon: string;
  tool: string;
  summary: string;
  reasoning: string;
  rawCall: string;
  resources: string[];
  blastRadius: string;
  confidence: number;
  riskScore: number;
  riskLevel: RiskLevel;
  status: ActionStatus;
  policyViolations: string[];
  recommendation: string;
}

export function eventToAction(e: ActionEvent): AgentAction {
  return {
    id: e.id,
    ts: new Date(e.created_at).getTime(),
    agent: e.agent_name,
    agentIcon: e.agent_icon,
    tool: e.tool,
    summary: e.summary,
    reasoning: e.reasoning,
    rawCall: e.raw_call,
    resources: e.resources,
    blastRadius: e.blast_radius,
    confidence: e.risk.confidence,
    riskScore: e.risk.score,
    riskLevel: e.risk.level,
    status: e.status,
    policyViolations: e.policy_violations,
    recommendation: e.recommendation,
  };
}
