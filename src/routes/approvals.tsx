import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppShell } from "@/components/veto/AppShell";
import { RiskTag, StatusPill } from "@/components/veto/StatusPill";
import { generateAction } from "@/lib/veto-simulation";
import type { ActionStatus, AgentAction } from "@/lib/veto-types";

export const Route = createFileRoute("/approvals")({
  head: () => ({ meta: [{ title: "Approvals — Veto" }] }),
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const [items, setItems] = useState<AgentAction[]>(() => {
    // Seed with several pending high/critical actions
    const seed: AgentAction[] = [];
    for (let i = 0; i < 12; i++) {
      const a = generateAction(i % 3 === 0 ? "critical" : i % 3 === 1 ? "high" : "medium");
      seed.push({ ...a, status: "pending", ts: Date.now() - i * 1000 * 60 * 3 });
    }
    return seed;
  });
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium">("all");
  const [selectedId, setSelectedId] = useState<string>(items[0]?.id ?? "");

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.riskLevel === filter)),
    [items, filter],
  );
  const selected = items.find((i) => i.id === selectedId) ?? null;

  const decide = (id: string, status: ActionStatus) => {
    setItems((c) => c.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  const pendingCount = items.filter((i) => i.status === "pending").length;

  return (
    <AppShell
      eyebrow="HUMAN-IN-THE-LOOP"
      title="Approval Inbox"
      actions={
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          {pendingCount} awaiting review
        </span>
      }
    >
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5">
          <div className="flex items-center gap-1 mb-4">
            {(["all", "critical", "high", "medium"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`relative font-mono text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-sm transition-colors ${
                  filter === f ? "text-foreground bg-surface-2" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="border hairline rounded-md bg-card overflow-hidden">
            <AnimatePresence initial={false}>
              {filtered.map((a) => {
                const active = a.id === selectedId;
                return (
                  <motion.button
                    key={a.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    onClick={() => setSelectedId(a.id)}
                    className={`relative w-full text-left px-5 py-4 border-b hairline last:border-0 transition-colors ${
                      active ? "bg-surface-2" : "hover:bg-surface"
                    }`}
                  >
                    {active && <span className="absolute left-0 top-0 bottom-0 w-px bg-foreground" />}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="font-mono text-[11px] text-foreground">{a.agent}</span>
                      <RiskTag level={a.riskLevel} score={a.riskScore} />
                    </div>
                    <p className="text-[13px] text-foreground/90 leading-snug mb-2 line-clamp-2">
                      {a.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-muted-foreground">{a.tool}</span>
                      <StatusPill status={a.status} />
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div className="p-10 text-center text-muted-foreground font-mono text-xs tracking-widest">
                INBOX ZERO · NOTHING TO REVIEW
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="border hairline rounded-md bg-card overflow-hidden sticky top-20"
              >
                <div className="px-6 py-5 border-b hairline">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
                      REQUEST · {selected.id}
                    </span>
                    <StatusPill status={selected.status} />
                  </div>
                  <h3 className="text-xl font-medium tracking-tight leading-snug text-balance">
                    {selected.summary}
                  </h3>
                </div>

                <div className="px-6 py-5 space-y-5">
                  <Row label="Agent" value={`${selected.agentIcon}  ${selected.agent}`} />
                  <Row label="Action" value={selected.tool} mono />
                  <Row
                    label="Affected system"
                    value={selected.resources.join(" · ")}
                    mono
                  />
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-1.5">
                      Risk
                    </div>
                    <div className="flex items-center gap-3">
                      <RiskTag level={selected.riskLevel} score={selected.riskScore} />
                      <span className="text-[12px] text-muted-foreground">{selected.blastRadius}</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-1.5">
                      Reason
                    </div>
                    <p className="text-[13px] text-foreground/85 leading-relaxed">{selected.reasoning}</p>
                  </div>
                </div>

                {selected.status === "pending" ? (
                  <div className="px-6 py-4 border-t hairline grid grid-cols-3 gap-2">
                    <button
                      onClick={() => decide(selected.id, "approved")}
                      className="font-mono text-[11px] uppercase tracking-[0.18em] py-2.5 border hairline rounded-sm text-foreground/80 hover:border-foreground/40 hover:text-foreground hover:bg-surface-2"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => decide(selected.id, "escalated")}
                      className="font-mono text-[11px] uppercase tracking-[0.18em] py-2.5 border hairline rounded-sm text-foreground/80 hover:border-foreground/40 hover:text-foreground hover:bg-surface-2"
                    >
                      ◇ Sandbox
                    </button>
                    <button
                      onClick={() => decide(selected.id, "denied")}
                      className="font-mono text-[11px] uppercase tracking-[0.18em] py-2.5 bg-foreground text-background rounded-sm hover:bg-foreground/90"
                    >
                      ✕ Deny
                    </button>
                  </div>
                ) : (
                  <div className="px-6 py-4 border-t hairline text-center font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
                    DECISION RECORDED · {selected.status.toUpperCase()}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="h-64 grid place-items-center text-muted-foreground text-sm">
                Select a request to review
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground pt-0.5">
        {label}
      </div>
      <div className={`col-span-2 text-[13px] text-foreground/90 ${mono ? "font-mono text-[12px]" : ""}`}>
        {value}
      </div>
    </div>
  );
}
