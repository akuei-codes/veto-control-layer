import type { ActionStatus, RiskLevel } from "@/lib/veto-types";

const RISK_LABEL: Record<RiskLevel, string> = {
  low: "LOW",
  medium: "MED",
  high: "HIGH",
  critical: "CRITICAL",
};

export function RiskTag({ level, score }: { level: RiskLevel; score?: number }) {
  const color =
    level === "critical"
      ? "var(--color-risk-critical)"
      : level === "high"
        ? "var(--color-risk-high)"
        : level === "medium"
          ? "var(--color-risk-medium)"
          : "var(--color-risk-low)";
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm border"
      style={{ color, borderColor: `color-mix(in oklab, ${color} 40%, transparent)` }}
    >
      <span className="w-1 h-1 rounded-full" style={{ background: color }} />
      {RISK_LABEL[level]}
      {score !== undefined && <span className="text-muted-foreground/70">·{score}</span>}
    </span>
  );
}

const STATUS_STYLES: Record<ActionStatus, { label: string; cls: string }> = {
  intercepted: { label: "INTERCEPTED", cls: "text-foreground/80 border-foreground/20" },
  analyzing: { label: "ANALYZING", cls: "text-foreground/70 border-foreground/20" },
  pending: { label: "PENDING APPROVAL", cls: "text-[var(--color-risk-medium)] border-[color-mix(in_oklab,var(--color-risk-medium)_40%,transparent)]" },
  approved: { label: "APPROVED", cls: "text-[var(--color-risk-low)] border-[color-mix(in_oklab,var(--color-risk-low)_40%,transparent)]" },
  denied: { label: "DENIED", cls: "text-muted-foreground border-border" },
  executed: { label: "EXECUTED", cls: "text-foreground border-foreground/30" },
  blocked: { label: "BLOCKED", cls: "text-[var(--color-risk-critical)] border-[color-mix(in_oklab,var(--color-risk-critical)_50%,transparent)]" },
  escalated: { label: "ESCALATED", cls: "text-[var(--color-risk-high)] border-[color-mix(in_oklab,var(--color-risk-high)_40%,transparent)]" },
  expired: { label: "EXPIRED", cls: "text-muted-foreground border-border" },
};

export function StatusPill({ status }: { status: ActionStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm border ${s.cls}`}>
      {s.label}
    </span>
  );
}
