import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { AppShell } from "@/components/veto/AppShell";
import { ReplayTimeline } from "@/components/veto/ReplayTimeline";
import { RiskTag, StatusPill } from "@/components/veto/StatusPill";
import { useVetoEvents, useVetoAudit } from "@/lib/veto-store";
import { eventToAction } from "@/lib/veto-schema";

export const Route = createFileRoute("/replay")({
  head: () => ({ meta: [{ title: "Replay — Veto" }] }),
  component: ReplayPage,
});

function ReplayPage() {
  const events = useVetoEvents();
  const audit = useVetoAudit();
  const history = useMemo(() => events.map(eventToAction), [events]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedId && history[0]) setSelectedId(history[0].id);
  }, [history, selectedId]);
  const selected = history.find((h) => h.id === selectedId) ?? history[0] ?? null;

  return (
    <AppShell eyebrow="AUDIT" title="Replay">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <div className="border hairline rounded-md bg-card overflow-hidden">
            <div className="px-5 py-3 border-b hairline font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
              Recent intercepts
            </div>
            <ul className="max-h-[640px] overflow-y-auto">
              {history.map((h) => {
                const active = h.id === selectedId;
                return (
                  <li key={h.id}>
                    <button
                      onClick={() => setSelectedId(h.id)}
                      className={`relative w-full text-left px-5 py-3 border-b hairline last:border-0 transition-colors ${
                        active ? "bg-surface-2" : "hover:bg-surface"
                      }`}
                    >
                      {active && <span className="absolute left-0 top-0 bottom-0 w-px bg-foreground" />}
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[55%]">{h.id}</span>
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
              {history.length === 0 && (
                <li className="p-10 text-center text-muted-foreground font-mono text-xs tracking-widest">
                  NO EVENTS YET
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-6">
          {selected ? (
            <>
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
            </>
          ) : (
            <div className="h-64 grid place-items-center text-muted-foreground text-sm border hairline rounded-md bg-card">
              Select an event to view its replay
            </div>
          )}

          <div className="border hairline rounded-md bg-card overflow-hidden">
            <div className="px-5 py-3 border-b hairline font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
              Audit log
            </div>
            <ul className="max-h-[280px] overflow-y-auto">
              {audit.map((l) => (
                <li key={l.id} className="px-5 py-2.5 border-b hairline last:border-0 flex items-baseline gap-4">
                  <span className="font-mono text-[10px] text-muted-foreground w-20 shrink-0 tabular-nums">
                    {new Date(l.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground w-44 shrink-0">
                    {l.kind}
                  </span>
                  <span className="text-[12px] text-foreground/85 truncate">{l.message}</span>
                </li>
              ))}
              {audit.length === 0 && (
                <li className="p-6 text-center text-muted-foreground font-mono text-xs tracking-widest">
                  AUDIT TRAIL EMPTY
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
