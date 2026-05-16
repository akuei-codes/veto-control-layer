import { motion } from "motion/react";
import type { AgentAction } from "@/lib/veto-types";

export function ReplayTimeline({ action }: { action: AgentAction | null }) {
  const steps = [
    { k: "intent", label: "Intent", detail: action?.tool ?? "—" },
    { k: "intercept", label: "Intercepted", detail: "Veto control plane" },
    { k: "analyze", label: "Risk analysis", detail: action ? `score ${action.riskScore} · ${action.riskLevel}` : "—" },
    {
      k: "decision",
      label: "Decision",
      detail: action ? action.status.toUpperCase() : "—",
    },
    {
      k: "outcome",
      label: "Outcome",
      detail: action
        ? action.status === "blocked" || action.status === "denied"
          ? "Disaster prevented"
          : action.status === "approved" || action.status === "executed"
            ? "Execution allowed"
            : "Awaiting human"
        : "—",
    },
  ];

  return (
    <div className="border hairline rounded-md bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b hairline">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.22em]">Replay Timeline</h3>
        <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
          {action ? action.id : "—"}
        </span>
      </div>
      <div className="relative px-6 py-6">
        <div className="absolute left-8 right-8 top-1/2 h-px bg-border" />
        <div className="relative flex justify-between">
          {steps.map((s, i) => (
            <motion.div
              key={s.k}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex flex-col items-center text-center w-32"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
                {s.label}
              </div>
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  action
                    ? i <= 3
                      ? "bg-foreground border-foreground"
                      : "bg-background border-foreground/40"
                    : "bg-background border-border"
                }`}
              />
              <div className="font-mono text-[11px] text-foreground/80 mt-3 truncate w-full">
                {s.detail}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
