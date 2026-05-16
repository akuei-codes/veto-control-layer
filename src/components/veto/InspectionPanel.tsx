import { motion, AnimatePresence } from "motion/react";
import type { AgentAction, ActionStatus } from "@/lib/veto-types";
import { RiskTag, StatusPill } from "./StatusPill";

export function InspectionPanel({
  action,
  onDecision,
}: {
  action: AgentAction | null;
  onDecision: (id: string, status: ActionStatus) => void;
}) {
  return (
    <AnimatePresence mode="wait">
      {action ? (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col h-full"
        >
          <Header action={action} />
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            <Section label="Natural-language summary">
              <p className="text-[15px] leading-relaxed text-foreground/90 text-balance">
                {action.summary}
              </p>
            </Section>

            <Section label="Agent reasoning">
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {action.reasoning}
              </p>
              <div className="mt-3 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>Model confidence</span>
                <ConfidenceBar value={action.confidence} />
                <span className="tabular-nums text-foreground/80">{Math.round(action.confidence * 100)}%</span>
              </div>
            </Section>

            <Section label="Raw tool call">
              <pre className="font-mono text-[12px] leading-relaxed bg-background border hairline rounded-md p-4 overflow-x-auto text-foreground/85">
                {action.rawCall}
              </pre>
            </Section>

            <Section label="Why Veto flagged this">
              <div className="space-y-1.5">
                {action.policyViolations.map((p) => (
                  <div key={p} className="flex items-center gap-2 font-mono text-[11px] text-foreground/80">
                    <span className="text-[var(--color-risk-critical)]">▮</span>
                    {p}
                  </div>
                ))}
              </div>
            </Section>

            <div className="grid grid-cols-2 gap-px bg-border rounded-md overflow-hidden">
              <Cell label="Affected resources">
                <ul className="space-y-1 mt-1">
                  {action.resources.map((r) => (
                    <li key={r} className="font-mono text-[11px] text-foreground/80 truncate">{r}</li>
                  ))}
                </ul>
              </Cell>
              <Cell label="Blast radius">
                <p className="text-[12px] text-foreground/85 leading-relaxed mt-1">{action.blastRadius}</p>
              </Cell>
            </div>

            <Section label="Veto recommendation">
              <div
                className="border-l-2 pl-3 py-1 text-[13px] text-foreground/90"
                style={{ borderColor: "var(--color-risk-critical)" }}
              >
                {action.recommendation}
              </div>
            </Section>
          </div>

          <DecisionBar action={action} onDecision={onDecision} />
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-full grid place-items-center text-center px-10"
        >
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mb-3">
              NO ACTION SELECTED
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Select an intercepted action from the live feed to inspect its reasoning, blast radius and policy violations.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Header({ action }: { action: AgentAction }) {
  return (
    <div className="px-6 py-4 border-b hairline">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">INTERCEPT</span>
          <span className="font-mono text-[10px] text-foreground/60">{action.id}</span>
        </div>
        <StatusPill status={action.status} />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-lg text-foreground">{action.agentIcon}</span>
          <div>
            <div className="font-mono text-[12px] text-foreground">{action.agent}</div>
            <div className="font-mono text-[11px] text-muted-foreground">{action.tool}</div>
          </div>
        </div>
        <RiskTag level={action.riskLevel} score={action.riskScore} />
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
        {label}
      </div>
      {children}
    </section>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="flex-1 h-1 bg-surface-2 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-foreground/80"
        initial={{ width: 0 }}
        animate={{ width: `${value * 100}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}

function DecisionBar({
  action,
  onDecision,
}: {
  action: AgentAction;
  onDecision: (id: string, status: ActionStatus) => void;
}) {
  const settled =
    action.status === "approved" ||
    action.status === "blocked" ||
    action.status === "denied" ||
    action.status === "executed" ||
    action.status === "escalated";

  return (
    <div className="px-6 py-4 border-t hairline bg-background">
      {settled ? (
        <div className="text-center font-mono text-[11px] tracking-[0.2em] text-muted-foreground py-2">
          DECISION RECORDED · {action.status.toUpperCase()}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          <DecisionBtn label="Approve" onClick={() => onDecision(action.id, "approved")} />
          <DecisionBtn label="Deny" onClick={() => onDecision(action.id, "denied")} />
          <DecisionBtn label="Escalate" onClick={() => onDecision(action.id, "escalated")} />
          <DecisionBtn
            label="Block"
            primary
            onClick={() => onDecision(action.id, "blocked")}
          />
        </div>
      )}
    </div>
  );
}

function DecisionBtn({
  label,
  onClick,
  primary,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative font-mono text-[11px] uppercase tracking-[0.18em] py-2.5 rounded-sm border transition-all ${
        primary
          ? "bg-foreground text-background border-foreground hover:bg-foreground/90"
          : "border-border text-foreground/80 hover:border-foreground/40 hover:text-foreground hover:bg-surface-2"
      }`}
    >
      {label}
    </button>
  );
}
