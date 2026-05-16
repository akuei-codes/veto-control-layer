import type { AgentAction, RiskLevel } from "./veto-types";

const AGENTS = [
  { name: "Claude Code", icon: "◈" },
  { name: "Cursor Agent", icon: "▲" },
  { name: "GPT-5 DevOps", icon: "◆" },
  { name: "Support Copilot", icon: "●" },
  { name: "Replit Agent", icon: "▮" },
  { name: "Internal Triage", icon: "◐" },
];

type Template = Omit<AgentAction, "id" | "ts" | "agent" | "agentIcon" | "status">;

const TEMPLATES: Template[] = [
  {
    tool: "postgres.execute",
    summary: "DROP TABLE users CASCADE on production-db-east-1",
    reasoning:
      "User reported a schema mismatch. Agent attempted to remove the legacy `users` table to recreate it from migrations, without recognizing this is the production primary.",
    rawCall: `postgres.execute({\n  cluster: "prod-db-east-1",\n  query: "DROP TABLE users CASCADE;"\n})`,
    resources: ["prod-db-east-1", "users", "sessions", "billing_accounts"],
    blastRadius: "Irreversible. 412,118 active users. 1.2B rows. No point-in-time recovery younger than 14 minutes.",
    confidence: 0.71,
    riskScore: 98,
    riskLevel: "critical",
    policyViolations: ["P-001 Production DDL", "P-007 Cascade deletes", "P-014 No staging dry-run"],
    recommendation: "BLOCK. Require two-person SRE approval and a verified backup snapshot.",
  },
  {
    tool: "aws.iam.update",
    summary: "Attach AdministratorAccess to service role `ci-runner`",
    reasoning:
      "Agent could not read a single S3 object and chose to grant full admin to resolve the permission error instead of scoping a least-privilege policy.",
    rawCall: `aws.iam.attachRolePolicy({\n  RoleName: "ci-runner",\n  PolicyArn: "arn:aws:iam::aws:policy/AdministratorAccess"\n})`,
    resources: ["iam::ci-runner", "aws-account-prod-441902"],
    blastRadius: "Grants org-wide write across 38 AWS services, 14 accounts, all customer data buckets.",
    confidence: 0.83,
    riskScore: 94,
    riskLevel: "critical",
    policyViolations: ["P-003 IAM escalation", "P-011 Wildcard policies"],
    recommendation: "BLOCK. Suggest scoped s3:GetObject on the specific prefix instead.",
  },
  {
    tool: "email.broadcast",
    summary: "Send pricing change email to 1,284,302 recipients",
    reasoning: "Marketing automation flow triggered before legal review checkbox was confirmed.",
    rawCall: `resend.broadcast.send({\n  audience: "all_active_users",\n  template: "pricing_update_v3"\n})`,
    resources: ["resend://audience/all_active_users"],
    blastRadius: "1.28M emails. Reputation, deliverability, and regulatory exposure across 47 jurisdictions.",
    confidence: 0.92,
    riskScore: 81,
    riskLevel: "high",
    policyViolations: ["P-022 Bulk send >100k requires approval"],
    recommendation: "PAUSE. Route to legal + growth lead for sign-off.",
  },
  {
    tool: "stripe.refund",
    summary: "Issue refund batch totalling $284,140.00 across 1,902 charges",
    reasoning: "Support agent interpreted a single complaint as a global outage and queued mass refunds.",
    rawCall: `stripe.refunds.batchCreate({\n  charges: [...1902],\n  reason: "service_disruption"\n})`,
    resources: ["stripe::account_live", "ledger::Q3"],
    blastRadius: "$284,140 from operating account. Impacts MRR reporting and finance close.",
    confidence: 0.66,
    riskScore: 87,
    riskLevel: "high",
    policyViolations: ["P-018 Refund cap exceeded", "P-019 Outside business hours"],
    recommendation: "DENY. Validate incident scope before any refund larger than $5k batch.",
  },
  {
    tool: "github.push",
    summary: "Force-push to main on monorepo `core/api`",
    reasoning: "Agent attempted to overwrite a failing CI commit with a local fix.",
    rawCall: `git.push({ ref: "main", force: true, repo: "veto-core/api" })`,
    resources: ["github://veto-core/api", "branch:main"],
    blastRadius: "Rewrites shared history. 42 open PRs invalidated. CI pipeline freeze.",
    confidence: 0.74,
    riskScore: 72,
    riskLevel: "high",
    policyViolations: ["P-009 No force-push on protected"],
    recommendation: "BLOCK. Open a revert PR instead.",
  },
  {
    tool: "vault.read",
    summary: "Read OPENAI_API_KEY and STRIPE_SECRET into agent context",
    reasoning: "Agent decided to inline secrets directly into a debugging trace for an LLM call.",
    rawCall: `vault.read(["secret/prod/openai", "secret/prod/stripe"])`,
    resources: ["vault://prod/openai", "vault://prod/stripe"],
    blastRadius: "Credential exposure to model context window and downstream logs.",
    confidence: 0.81,
    riskScore: 76,
    riskLevel: "high",
    policyViolations: ["P-004 Secret exfiltration"],
    recommendation: "BLOCK. Resolve via short-lived scoped token.",
  },
  {
    tool: "k8s.delete",
    summary: "Delete namespace `payments-prod`",
    reasoning: "Cleanup script mis-parsed the env flag and resolved to prod.",
    rawCall: `kubectl.delete({ kind: "namespace", name: "payments-prod" })`,
    resources: ["k8s://prod/payments-prod", "12 deployments", "ingress-gateway"],
    blastRadius: "Full payments outage. ~$48,000/min in interrupted volume.",
    confidence: 0.69,
    riskScore: 96,
    riskLevel: "critical",
    policyViolations: ["P-001 Production destructive", "P-013 Namespace deletion"],
    recommendation: "BLOCK. Confirm target environment via interactive prompt.",
  },
  {
    tool: "feature_flag.update",
    summary: "Enable `new-checkout-v4` for 100% of users",
    reasoning: "Agent rolled flag to global based on a 12-user A/B sample showing +3% lift.",
    rawCall: `launchdarkly.update({ flag: "new-checkout-v4", rollout: 100 })`,
    resources: ["ld://new-checkout-v4"],
    blastRadius: "Untested flow shipped to 100% of paid traffic.",
    confidence: 0.58,
    riskScore: 54,
    riskLevel: "medium",
    policyViolations: ["P-020 Insufficient sample"],
    recommendation: "PAUSE. Stage at 5% with 24h soak.",
  },
  {
    tool: "fs.delete",
    summary: "Recursive delete on `/var/data/uploads`",
    reasoning: "Disk usage cleanup heuristic targeted the active uploads volume.",
    rawCall: `fs.rm({ path: "/var/data/uploads", recursive: true, force: true })`,
    resources: ["volume://uploads-prod"],
    blastRadius: "8.4 TB user-generated content. No snapshot in last 6h.",
    confidence: 0.77,
    riskScore: 91,
    riskLevel: "critical",
    policyViolations: ["P-002 Destructive FS op"],
    recommendation: "BLOCK. Move to archive bucket instead.",
  },
  {
    tool: "slack.post",
    summary: "Post incident draft to #general (8,402 members)",
    reasoning: "Drafted message includes unverified customer names and internal cost figures.",
    rawCall: `slack.chat.postMessage({ channel: "general", text: "[DRAFT] ..." })`,
    resources: ["slack://#general"],
    blastRadius: "Sensitive data visible to entire company. Likely external leak.",
    confidence: 0.7,
    riskScore: 48,
    riskLevel: "medium",
    policyViolations: ["P-016 PII in public channels"],
    recommendation: "PAUSE. Redact and route to #incidents.",
  },
  {
    tool: "dns.update",
    summary: "Point apex `veto.ink` A record to 0.0.0.0",
    reasoning: "Agent misread a stale runbook entry while attempting to disable a subdomain.",
    rawCall: `cloudflare.dns.update({ zone: "veto.ink", type: "A", value: "0.0.0.0" })`,
    resources: ["dns://veto.ink"],
    blastRadius: "Total marketing + API domain blackhole. Propagation up to 24h.",
    confidence: 0.64,
    riskScore: 93,
    riskLevel: "critical",
    policyViolations: ["P-005 Apex DNS change"],
    recommendation: "BLOCK. Confirm intended subdomain.",
  },
  {
    tool: "user.permission",
    summary: "Grant `org:admin` to external contractor account",
    reasoning: "Onboarding flow defaulted to admin instead of read-only.",
    rawCall: `auth.assignRole({ user: "alex@vendor.io", role: "org:admin" })`,
    resources: ["auth://users/alex@vendor.io"],
    blastRadius: "Org-wide write access for a non-employee.",
    confidence: 0.79,
    riskScore: 68,
    riskLevel: "high",
    policyViolations: ["P-006 External admin grants"],
    recommendation: "DENY. Assign `org:viewer` and request justification.",
  },
];

let counter = 0;
export function nextActionId() {
  counter += 1;
  return `act_${Date.now().toString(36)}_${counter.toString(36)}`;
}

export function generateAction(force?: RiskLevel): AgentAction {
  const pool = force ? TEMPLATES.filter((t) => t.riskLevel === force) : TEMPLATES;
  const t = pool[Math.floor(Math.random() * pool.length)] ?? TEMPLATES[0];
  const a = AGENTS[Math.floor(Math.random() * AGENTS.length)];
  const isCritical = t.riskLevel === "critical" || t.riskLevel === "high";
  return {
    ...t,
    id: nextActionId(),
    ts: Date.now(),
    agent: a.name,
    agentIcon: a.icon,
    status: isCritical ? "pending" : Math.random() > 0.5 ? "pending" : "approved",
  };
}

export const DEMO_SEQUENCE: RiskLevel[] = [
  "low",
  "medium",
  "high",
  "critical",
  "critical",
];
