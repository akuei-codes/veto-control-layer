import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/veto/AppShell";
import { ReplayTimeline } from "@/components/veto/ReplayTimeline";
import { RiskTag, StatusPill } from "@/components/veto/StatusPill";
import { generateAction } from "@/lib/veto-simulation";
import type { AgentAction } from "@/lib/veto-types";

export const Route = createFileRoute("/replay")({
  head: () => ({ meta: [{ title: "Replay — Veto" }] }),
  component: ReplayPage,
});

function ReplayPage() {
  const history = useMemo<AgentAction[]>(() => {
    const arr: AgentAction[] = [];
    for (let i = 0; i < 24; i++) {
      const a = generateAction();
      arr.push({
        ...a,
        ts: Date.now() - i * 1000 * 60 * 17,
        status: i % 5 === 0 ? "blocked" : i % 3 === 0 ? "approved" : i % 4 === 0 ? "denied" : "executed",
      });
    }
    return arr;
  }, []);
  const [selected, setSelected] = useState<AgentAction>(history[0]);

  return (
    <AppShell eyebrow="AUDIT" title="Replay">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <div className="border hairline rounded-md bg-card overflow-hidden">
            <div className="px-5 py-3 border-b hairline font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
              Last 24 hours
            </div>
            <ul className="max-h-[640px] overflow-y-auto">
              {history.map((h) => {
                const active = h.id === selected.id;
                return (
                  <li key={h.id}>
                    <button
                      onClick={() => setSelected(h)}
                      className={`relative w-full text-left px-5 py-3 border-b hairline last:border-0 transition-colors ${
                        active ? "bg-surface-2" : "hover:bg-surface"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-0 bottom-0 w-px bg-foreground" />
                      )}
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] text-muted-foreground">{h.id}</span>
                        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                          {new Date(h.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="text-[12px] text-foreground/85 truncate mb-2">{h.summary}</div>
                      <div className="flex items-center gap-2">
                        <RiskTag level={h.riskLevel} score={h.riskScore} />
                        <StatusPill status={h.status} />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="border hairline rounded-md bg-card p-6">
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-2">
              {selected.agent} · {selected.tool}
            </div>
            <h2 className="text-2xl font-medium tracking-tight mb-3 text-balance">{selected.summary}</h2>
            <div className="flex items-center gap-2">
              <RiskTag level={selected.riskLevel} score={selected.riskScore} />
              <StatusPill status={selected.status} />
            </div>
          </div>
          <ReplayTimeline action={selected} />
          <div className="border hairline rounded-md bg-card p-6">
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-2">
              Raw tool call
            </div>
            <pre className="font-mono text-[12px] leading-relaxed text-foreground/85 whitespace-pre-wrap">
              {selected.rawCall}
            </pre>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
