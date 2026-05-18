import { AnimatePresence, motion } from "motion/react";
import type { AgentAction } from "@/lib/veto-schema";
import { RiskTag, StatusPill } from "./StatusPill";

function timeAgo(ts: number) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export function ActivityFeed({
  actions,
  selectedId,
  onSelect,
}: {
  actions: AgentAction[];
  selectedId: string | null;
  onSelect: (a: AgentAction) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3 border-b hairline">
        <div className="flex items-center gap-2">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full bg-[var(--color-risk-low)] opacity-60 pulse-ring" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-[var(--color-risk-low)]" />
          </span>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground">Live Intercepts</h2>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground tracking-widest tick">STREAM · ACTIVE</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {actions.map((a) => {
            const selected = a.id === selectedId;
            const critical = a.riskLevel === "critical";
            return (
              <motion.button
                key={a.id}
                layout
                initial={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => onSelect(a)}
                className={`relative w-full text-left px-5 py-4 border-b hairline group transition-colors ${
                  selected ? "bg-surface-2" : "hover:bg-surface"
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId="feed-selected"
                    className="absolute left-0 top-0 bottom-0 w-px bg-foreground"
                  />
                )}
                {critical && (
                  <span className="absolute left-0 top-0 bottom-0 w-px bg-[var(--color-risk-critical)]" />
                )}
                <div className="flex items-start gap-3">
                  <div className="font-mono text-base text-muted-foreground mt-0.5">{a.agentIcon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-[11px] text-foreground/90">{a.agent}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="font-mono text-[11px] text-muted-foreground">{a.tool}</span>
                    </div>
                    <p className="text-[13px] text-foreground/90 leading-snug truncate">{a.summary}</p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <RiskTag level={a.riskLevel} score={a.riskScore} />
                      <StatusPill status={a.status} />
                      <span className="ml-auto font-mono text-[10px] text-muted-foreground/70 tabular-nums">
                        {timeAgo(a.ts)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
        {actions.length === 0 && (
          <div className="p-10 text-center text-muted-foreground font-mono text-xs tracking-widest">
            AWAITING AGENT TRAFFIC…
          </div>
        )}
      </div>
    </div>
  );
}
