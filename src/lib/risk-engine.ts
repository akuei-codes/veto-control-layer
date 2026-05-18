/**
 * Veto risk engine.
 *
 * Computes a weighted risk score from explicit factors so the UI can show
 * *why* something is risky, not just a number. Pure functions — easy to
 * port to a serverless evaluator later.
 */

import type {
  RiskAssessment,
  RiskFactor,
  RiskLevel,
} from "./veto-schema";

export interface RiskInput {
  tool: string;
  environment: "development" | "staging" | "production";
  resources: string[];
  /** Free-form signals the simulator passes in. */
  destructive?: boolean;
  reversible?: boolean;
  touches_secrets?: boolean;
  bulk_volume?: number;          // e.g. 1.2M recipients
  financial_amount_usd?: number; // refund / spend amount
  identity_escalation?: boolean; // grants admin / wildcard policies
  outside_business_hours?: boolean;
  novel_pattern?: boolean;       // anomaly detector signal
  affected_users?: number;
  /** Model self-reported confidence in the action it wants to take. */
  agent_confidence?: number;     // 0..1, default 0.7
}

const WEIGHTS = {
  destructive: 28,
  irreversible: 18,
  production: 22,
  secrets: 16,
  identity: 18,
  bulk: 14,        // scaled by log(volume)
  financial: 12,   // scaled by log(amount)
  off_hours: 4,
  anomaly: 8,
} as const;

function logScale(n: number, base = 10, cap = 1) {
  if (!n || n <= 1) return 0;
  return Math.min(cap, Math.log10(n) / 7);
}

function levelFor(score: number): RiskLevel {
  if (score >= 85) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

export function assessRisk(input: RiskInput): RiskAssessment {
  const factors: RiskFactor[] = [];
  const push = (key: string, label: string, weight: number, signal: number) => {
    const contribution = Math.round(weight * signal);
    if (contribution > 0) {
      factors.push({ key, label, weight: signal, contribution });
    }
  };

  push("destructive", "Destructive operation", WEIGHTS.destructive, input.destructive ? 1 : 0);
  push(
    "reversibility",
    "Irreversible side-effects",
    WEIGHTS.irreversible,
    input.destructive && input.reversible === false ? 1 : 0,
  );
  push(
    "environment",
    "Targets production",
    WEIGHTS.production,
    input.environment === "production" ? 1 : input.environment === "staging" ? 0.4 : 0,
  );
  push("secrets", "Touches secrets / credentials", WEIGHTS.secrets, input.touches_secrets ? 1 : 0);
  push("identity", "Escalates identity / permissions", WEIGHTS.identity, input.identity_escalation ? 1 : 0);
  push("bulk", "High-volume fan-out", WEIGHTS.bulk, logScale(input.bulk_volume ?? 0, 10, 1));
  push("financial", "Large financial impact", WEIGHTS.financial, logScale(input.financial_amount_usd ?? 0, 10, 1));
  push("off_hours", "Outside business hours", WEIGHTS.off_hours, input.outside_business_hours ? 1 : 0);
  push("anomaly", "Anomalous pattern for this agent", WEIGHTS.anomaly, input.novel_pattern ? 1 : 0);

  const raw = factors.reduce((acc, f) => acc + f.contribution, 0);
  const score = Math.min(100, raw);

  const reversibility: RiskAssessment["reversibility"] =
    input.destructive && input.reversible === false
      ? "irreversible"
      : input.destructive
        ? "partial"
        : "reversible";

  return {
    score,
    level: levelFor(score),
    confidence: clamp(input.agent_confidence ?? 0.7, 0, 1),
    factors: factors.sort((a, b) => b.contribution - a.contribution),
    estimated_users_affected: input.affected_users ?? 0,
    estimated_financial_impact_usd: Math.round(input.financial_amount_usd ?? 0),
    reversibility,
    environment: input.environment,
    computed_at: new Date().toISOString(),
  };
}

export function shouldRequireApproval(r: RiskAssessment): boolean {
  return r.level === "critical" || r.level === "high";
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export function formatImpact(usd: number): string {
  if (!usd) return "$0";
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(usd >= 10_000_000 ? 0 : 1)}M`;
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(usd >= 10_000 ? 0 : 1)}k`;
  return `$${usd.toFixed(0)}`;
}

export function formatUsers(n: number): string {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return n.toString();
}
