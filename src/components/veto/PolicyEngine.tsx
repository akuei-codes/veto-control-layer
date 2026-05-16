import { useState } from "react";
import { motion } from "motion/react";
import type { Policy } from "@/lib/veto-types";

const SEED: Policy[] = [
  { id: "P-001", text: "Never allow deletion of production databases", enabled: true, triggered: 14 },
  { id: "P-003", text: "Block IAM escalation to AdministratorAccess", enabled: true, triggered: 7 },
  { id: "P-004", text: "Prevent secret exfiltration into model context", enabled: true, triggered: 22 },
  { id: "P-018", text: "Refund batches over $5,000 require human approval", enabled: true, triggered: 3 },
  { id: "P-022", text: "Bulk email above 100k recipients requires legal sign-off", enabled: true, triggered: 1 },
  { id: "P-019", text: "Block billing changes outside business hours", enabled: false, triggered: 0 },
];

export function PolicyEngine() {
  const [policies, setPolicies] = useState<Policy[]>(SEED);

  return (
    <div className="border hairline rounded-md bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b hairline">
        <div className="flex items-center gap-2">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.22em]">Policy Engine</h3>
          <span className="font-mono text-[10px] text-muted-foreground">
            {policies.filter((p) => p.enabled).length}/{policies.length} active
          </span>
        </div>
        <button className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
          + New rule
        </button>
      </div>
      <ul>
        {policies.map((p) => (
          <li key={p.id} className="flex items-center gap-4 px-5 py-3 border-b hairline last:border-0 group">
            <span className="font-mono text-[10px] text-muted-foreground w-12">{p.id}</span>
            <span className={`flex-1 text-[13px] ${p.enabled ? "text-foreground/90" : "text-muted-foreground/60 line-through"}`}>
              {p.text}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground tabular-nums w-20 text-right">
              {p.triggered} trig.
            </span>
            <Toggle
              on={p.enabled}
              onChange={() =>
                setPolicies((cur) => cur.map((c) => (c.id === p.id ? { ...c, enabled: !c.enabled } : c)))
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-8 h-4 rounded-full border transition-colors ${
        on ? "bg-foreground border-foreground" : "bg-transparent border-border"
      }`}
    >
      <motion.span
        className={`absolute top-0.5 w-3 h-3 rounded-full ${on ? "bg-background" : "bg-muted-foreground"}`}
        animate={{ left: on ? "1rem" : "0.125rem" }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
