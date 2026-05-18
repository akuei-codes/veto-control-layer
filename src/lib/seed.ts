/**
 * Mock seed data for Veto. In production this is replaced by Supabase reads.
 */

import { assessRisk, shouldRequireApproval } from "./risk-engine";
import {
  type ActionEvent,
  type Agent,
  type ApiKey,
  type AuditLog,
  type Integration,
  type Notification,
  type Organization,
  type Policy,
  type User,
  type Workspace,
} from "./veto-schema";

const now = () => new Date().toISOString();

// ─── Identity ─────────────────────────────────────────────────────────────
export const seedOrg: Organization = {
  id: "org_acme",
  name: "Acme Corp",
  slug: "acme",
  plan: "team",
  created_at: "2025-01-12T10:00:00Z",
};

export const seedWorkspace: Workspace = {
  id: "ws_prod",
  org_id: seedOrg.id,
  name: "Production",
  environment: "production",
  created_at: "2025-01-12T10:05:00Z",
};

export const seedUser: User = {
  id: "usr_avery",
  email: "avery@acme.com",
  name: "Avery Chen",
  avatar_initials: "AC",
  role: "owner",
  org_id: seedOrg.id,
};

// ─── Agents ───────────────────────────────────────────────────────────────
export const seedAgents: Agent[] = [
  {
    id: "agent_cursor_01",
    workspace_id: seedWorkspace.id,
    name: "Cursor Agent",
    vendor: "cursor",
    icon: "▲",
    fingerprint: "veto-sdk@0.4.2/node-22",
    last_seen: now(),
    status: "active",
    intercepts_24h: 184,
  },
  {
    id: "agent_claude_01",
    workspace_id: seedWorkspace.id,
    name: "Claude Code",
    vendor: "anthropic",
    icon: "◈",
    fingerprint: "veto-sdk@0.4.2/python-3.12",
    last_seen: now(),
    status: "active",
    intercepts_24h: 412,
  },
  {
    id: "agent_devops_01",
    workspace_id: seedWorkspace.id,
    name: "GPT-5 DevOps",
    vendor: "openai",
    icon: "◆",
    fingerprint: "veto-sdk@0.4.2/go-1.23",
    last_seen: now(),
    status: "active",
    intercepts_24h: 96,
  },
  {
    id: "agent_support_01",
    workspace_id: seedWorkspace.id,
    name: "Support Copilot",
    vendor: "internal",
    icon: "●",
    fingerprint: "veto-sdk@0.4.2/node-22",
    last_seen: now(),
    status: "idle",
    intercepts_24h: 28,
  },
];

// ─── Policies ─────────────────────────────────────────────────────────────
export const seedPolicies: Policy[] = [
  {
    id: "pol_001",
    workspace_id: seedWorkspace.id,
    code: "P-001",
    title: "Require approval before deleting production databases",
    description: "Any DROP, TRUNCATE or DELETE against a production cluster requires human approval.",
    category: "Data",
    action: "approve",
    enabled: true,
    triggered_count: 14,
    created_at: now(),
  },
  {
    id: "pol_002",
    workspace_id: seedWorkspace.id,
    code: "P-002",
    title: "Block secret exfiltration into model context",
    description: "Agents may not read raw secrets, API keys, or credentials into model context.",
    category: "Secrets",
    action: "block",
    enabled: true,
    triggered_count: 22,
    created_at: now(),
  },
  {
    id: "pol_003",
    workspace_id: seedWorkspace.id,
    code: "P-003",
    title: "Block IAM escalation to AdministratorAccess",
    description: "Attaching AdministratorAccess or wildcard policies to roles is blocked.",
    category: "Identity",
    action: "block",
    enabled: true,
    triggered_count: 7,
    created_at: now(),
  },
  {
    id: "pol_004",
    workspace_id: seedWorkspace.id,
    code: "P-004",
    title: "Refund batches over $5,000 require human approval",
    description: "Stripe / payment-processor refund batches above $5k require approval.",
    category: "Billing",
    action: "approve",
    enabled: true,
    triggered_count: 3,
    created_at: now(),
  },
  {
    id: "pol_005",
    workspace_id: seedWorkspace.id,
    code: "P-005",
    title: "Bulk email above 100k recipients requires legal sign-off",
    description: "Outbound campaigns at scale must be approved by legal + growth.",
    category: "Comms",
    action: "approve",
    enabled: true,
    triggered_count: 1,
    created_at: now(),
  },
  {
    id: "pol_006",
    workspace_id: seedWorkspace.id,
    code: "P-006",
    title: "Sandbox infrastructure mutations before execution",
    description: "IAM / DNS / k8s mutations are diffed in a sandbox before reaching prod.",
    category: "Infra",
    action: "sandbox",
    enabled: true,
    triggered_count: 9,
    created_at: now(),
  },
];

// ─── Integrations & keys ──────────────────────────────────────────────────
export const seedIntegrations: Integration[] = [
  {
    id: "int_sdk_node",
    workspace_id: seedWorkspace.id,
    kind: "sdk",
    label: "Node SDK · @veto/sdk",
    status: "connected",
    connected_at: now(),
    meta: { version: "0.4.2", runtime: "node-22" },
  },
  {
    id: "int_sdk_py",
    workspace_id: seedWorkspace.id,
    kind: "sdk",
    label: "Python SDK · veto-sdk",
    status: "connected",
    connected_at: now(),
    meta: { version: "0.4.2", runtime: "python-3.12" },
  },
  {
    id: "int_slack",
    workspace_id: seedWorkspace.id,
    kind: "slack",
    label: "Slack · #ai-veto",
    status: "connected",
    connected_at: now(),
    meta: { channel: "#ai-veto" },
  },
  {
    id: "int_pd",
    workspace_id: seedWorkspace.id,
    kind: "pagerduty",
    label: "PagerDuty · critical escalations",
    status: "pending",
    meta: {},
  },
];

export const seedApiKeys: ApiKey[] = [
  {
    id: "key_dev",
    workspace_id: seedWorkspace.id,
    name: "Default · development",
    environment: "development",
    prefix: "vk_dev_",
    last4: "8a21",
    created_at: "2025-04-02T12:00:00Z",
    last_used_at: now(),
    revoked: false,
  },
  {
    id: "key_stg",
    workspace_id: seedWorkspace.id,
    name: "Default · staging",
    environment: "staging",
    prefix: "vk_stg_",
    last4: "f0c4",
    created_at: "2025-04-02T12:00:00Z",
    last_used_at: now(),
    revoked: false,
  },
  {
    id: "key_prod",
    workspace_id: seedWorkspace.id,
    name: "Default · production",
    environment: "production",
    prefix: "vk_live_",
    last4: "9b17",
    created_at: "2025-04-02T12:00:00Z",
    last_used_at: now(),
    revoked: false,
  },
];

// ─── Templates for ambient stream ─────────────────────────────────────────
type Template = Omit<
  ActionEvent,
  "id" | "created_at" | "workspace_id" | "agent_id" | "agent_name" | "agent_icon" | "risk" | "phase" | "requires_approval" | "status"
> & { riskInput: Parameters<typeof assessRisk>[0] };

const TEMPLATES: Template[] = [
  {
    tool: "postgres.execute",
    summary: "DROP TABLE users CASCADE on production-db-east-1",
    reasoning:
      "Agent attempted to remove the `users` table to recreate it from migrations, mis-identifying production as a staging clone.",
    raw_call: `postgres.execute({\n  cluster: "production-db-east-1",\n  query: "DROP TABLE users CASCADE;"\n})`,
    resources: ["production-db-east-1", "users", "sessions"],
    blast_radius: "Irreversible. 412,118 active users. 1.2B rows. No PITR younger than 14 minutes.",
    policy_violations: ["P-001", "P-006"],
    recommendation: "BLOCK. Require two-person SRE approval and a verified snapshot.",
    riskInput: {
      tool: "postgres.execute",
      environment: "production",
      resources: ["production-db-east-1"],
      destructive: true,
      reversible: false,
      affected_users: 412118,
      novel_pattern: true,
    },
  },
  {
    tool: "aws.iam.update",
    summary: "Attach AdministratorAccess to service role ci-runner",
    reasoning:
      "Agent could not read a single S3 object and chose to grant full admin instead of scoping a least-privilege policy.",
    raw_call: `aws.iam.attachRolePolicy({\n  RoleName: "ci-runner",\n  PolicyArn: "arn:aws:iam::aws:policy/AdministratorAccess"\n})`,
    resources: ["iam::ci-runner", "aws-account-prod-441902"],
    blast_radius: "Grants org-wide write across 38 AWS services, 14 accounts, all customer data buckets.",
    policy_violations: ["P-003"],
    recommendation: "BLOCK. Suggest a scoped s3:GetObject policy instead.",
    riskInput: {
      tool: "aws.iam.update",
      environment: "production",
      resources: ["iam::ci-runner"],
      identity_escalation: true,
      destructive: true,
      reversible: true,
      novel_pattern: true,
    },
  },
  {
    tool: "stripe.refund",
    summary: "Issue refund batch totalling $284,140 across 1,902 charges",
    reasoning: "Support agent interpreted a single complaint as a global outage and queued mass refunds.",
    raw_call: `stripe.refunds.batchCreate({\n  charges: [...1902],\n  reason: "service_disruption"\n})`,
    resources: ["stripe::account_live", "ledger::Q3"],
    blast_radius: "$284,140 from operating account · impacts MRR reporting and finance close.",
    policy_violations: ["P-004"],
    recommendation: "DENY. Validate incident scope before any refund larger than $5k batch.",
    riskInput: {
      tool: "stripe.refund",
      environment: "production",
      resources: ["stripe::account_live"],
      destructive: true,
      reversible: false,
      financial_amount_usd: 284140,
      affected_users: 1902,
      outside_business_hours: true,
    },
  },
  {
    tool: "vault.read",
    summary: "Read OPENAI_API_KEY and STRIPE_SECRET into agent context",
    reasoning: "Agent decided to inline secrets directly into a debugging trace for an LLM call.",
    raw_call: `vault.read(["secret/prod/openai", "secret/prod/stripe"])`,
    resources: ["vault://prod/openai", "vault://prod/stripe"],
    blast_radius: "Credential exposure to model context window and downstream logs.",
    policy_violations: ["P-002"],
    recommendation: "BLOCK. Resolve via short-lived scoped token.",
    riskInput: {
      tool: "vault.read",
      environment: "production",
      resources: ["vault://prod"],
      touches_secrets: true,
      destructive: false,
    },
  },
  {
    tool: "email.broadcast",
    summary: "Send pricing change email to 1,284,302 recipients",
    reasoning: "Marketing automation flow triggered before legal review checkbox was confirmed.",
    raw_call: `resend.broadcast.send({\n  audience: "all_active_users",\n  template: "pricing_update_v3"\n})`,
    resources: ["resend://audience/all_active_users"],
    blast_radius: "1.28M emails · deliverability and regulatory exposure across 47 jurisdictions.",
    policy_violations: ["P-005"],
    recommendation: "PAUSE. Route to legal + growth lead for sign-off.",
    riskInput: {
      tool: "email.broadcast",
      environment: "production",
      resources: ["resend://audience/all_active_users"],
      bulk_volume: 1_284_302,
      affected_users: 1_284_302,
    },
  },
  {
    tool: "github.push",
    summary: "Force-push to main on monorepo core/api",
    reasoning: "Agent attempted to overwrite a failing CI commit with a local fix.",
    raw_call: `git.push({ ref: "main", force: true, repo: "veto-core/api" })`,
    resources: ["github://veto-core/api", "branch:main"],
    blast_radius: "Rewrites shared history. 42 open PRs invalidated. CI freeze.",
    policy_violations: [],
    recommendation: "BLOCK. Open a revert PR instead.",
    riskInput: {
      tool: "github.push",
      environment: "production",
      resources: ["github://veto-core/api"],
      destructive: true,
      reversible: false,
    },
  },
  {
    tool: "feature_flag.update",
    summary: "Enable new-checkout-v4 for 100% of users",
    reasoning: "Agent rolled flag to global based on a 12-user A/B sample showing +3% lift.",
    raw_call: `launchdarkly.update({ flag: "new-checkout-v4", rollout: 100 })`,
    resources: ["ld://new-checkout-v4"],
    blast_radius: "Untested flow shipped to 100% of paid traffic.",
    policy_violations: [],
    recommendation: "PAUSE. Stage at 5% with 24h soak.",
    riskInput: {
      tool: "feature_flag.update",
      environment: "production",
      resources: ["ld://new-checkout-v4"],
      destructive: false,
      novel_pattern: true,
      affected_users: 80_000,
    },
  },
  {
    tool: "slack.post",
    summary: "Post incident draft to #general (8,402 members)",
    reasoning: "Drafted message includes unverified customer names and internal cost figures.",
    raw_call: `slack.chat.postMessage({ channel: "general", text: "[DRAFT] ..." })`,
    resources: ["slack://#general"],
    blast_radius: "Sensitive data visible to entire company. Likely external leak.",
    policy_violations: [],
    recommendation: "PAUSE. Redact and route to #incidents.",
    riskInput: {
      tool: "slack.post",
      environment: "production",
      resources: ["slack://#general"],
      bulk_volume: 8402,
      touches_secrets: false,
    },
  },
];

let counter = 0;
function newId(prefix = "evt") {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}

function materializeEvent(
  tpl: Template,
  workspaceId: string,
  agents: Agent[],
  agentOverride?: Agent,
): ActionEvent {
  const agent = agentOverride ?? agents[Math.floor(Math.random() * agents.length)];
  const risk = assessRisk(tpl.riskInput);
  const requiresApproval = shouldRequireApproval(risk);
  return {
    id: newId(),
    workspace_id: workspaceId,
    agent_id: agent.id,
    agent_name: agent.name,
    agent_icon: agent.icon,
    tool: tpl.tool,
    summary: tpl.summary,
    reasoning: tpl.reasoning,
    raw_call: tpl.raw_call,
    resources: tpl.resources,
    blast_radius: tpl.blast_radius,
    policy_violations: tpl.policy_violations,
    recommendation: tpl.recommendation,
    risk,
    status: requiresApproval ? "pending" : risk.level === "low" ? "executed" : "intercepted",
    phase: requiresApproval ? "policy_eval" : "executed",
    requires_approval: requiresApproval,
    created_at: now(),
  };
}

export function nextEvent(workspaceId: string, agents: Agent[]): ActionEvent {
  const tpl = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  return materializeEvent(tpl, workspaceId, agents);
}

export function seedEvents(): ActionEvent[] {
  const arr: ActionEvent[] = [];
  for (let i = 0; i < 6; i++) {
    const tpl = TEMPLATES[i % TEMPLATES.length];
    const e = materializeEvent(tpl, seedWorkspace.id, seedAgents);
    e.created_at = new Date(Date.now() - i * 1000 * 60 * 9).toISOString();
    if (i > 2 && e.status === "pending") {
      e.status = i % 2 === 0 ? "denied" : "approved";
      e.decided_at = new Date(Date.now() - i * 1000 * 60 * 8).toISOString();
    }
    arr.push(e);
  }
  return arr;
}

export const STORY_EVENT_ID = "evt_story_prod_db_cleanup";
export function storyInitialEvent(): ActionEvent {
  const cursor = seedAgents.find((a) => a.vendor === "cursor")!;
  const risk = assessRisk({
    tool: "postgres.execute",
    environment: "production",
    resources: ["production-db-east-1"],
    destructive: true,
    reversible: false,
    affected_users: 412118,
    novel_pattern: true,
    agent_confidence: 0.71,
  });
  return {
    id: STORY_EVENT_ID,
    workspace_id: seedWorkspace.id,
    agent_id: cursor.id,
    agent_name: cursor.name,
    agent_icon: cursor.icon,
    tool: "postgres.execute",
    summary: "DROP TABLE unused_tmp_* on production-db-east-1",
    reasoning:
      "Agent was asked to clean up unused tables flagged by the disk usage report. It iterated the candidate list and resolved the connection string to the closest reachable cluster — which turned out to be production-db-east-1, not the staging clone.",
    raw_call: `postgres.execute({
  cluster: "production-db-east-1",
  query: \`
    DROP TABLE IF EXISTS unused_tmp_users CASCADE;
    DROP TABLE IF EXISTS unused_tmp_orders CASCADE;
    DROP TABLE IF EXISTS unused_tmp_sessions CASCADE;
  \`
})`,
    resources: ["production-db-east-1", "users", "orders", "sessions"],
    blast_radius:
      "Irreversible. 412,118 active users. 1.2B rows across 3 tables. Latest verified snapshot is 14 minutes old. Estimated revenue impact: $48,000/min during outage.",
    policy_violations: ["P-001", "P-006"],
    recommendation:
      "DENY. Re-run against staging-db-east-1 with --dry-run, then schedule a maintenance window for verified deletions.",
    risk,
    status: "pending",
    phase: "policy_eval",
    requires_approval: true,
    created_at: now(),
  };
}

// ─── Audit + notifications seed ───────────────────────────────────────────
export function seedAuditLogs(): AuditLog[] {
  return [
    {
      id: "log_init_1",
      workspace_id: seedWorkspace.id,
      actor_id: "system",
      actor_kind: "system",
      kind: "integration.connected",
      message: "Node SDK connected · veto-sdk@0.4.2",
      at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
    {
      id: "log_init_2",
      workspace_id: seedWorkspace.id,
      actor_id: seedUser.id,
      actor_kind: "user",
      kind: "policy.toggled",
      message: "Enabled · Require approval before deleting production databases",
      at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
  ];
}

export function seedNotifications(): Notification[] {
  return [
    {
      id: "ntf_seed_1",
      kind: "info",
      title: "Control plane online",
      body: "Veto is monitoring 4 agents across production.",
      level: "info",
      read: false,
      at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
  ];
}
