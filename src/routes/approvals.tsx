import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppShell } from "@/components/veto/AppShell";
import { RiskTag, StatusPill } from "@/components/veto/StatusPill";
import { useVetoEvents, vetoActions } from "@/lib/veto-store";
import { eventToAction } from "@/lib/veto-schema";
import type { ActionStatus, RiskLevel } from "@/lib/veto-schema";
import { formatImpact, formatUsers } from "@/lib/risk-engine";

export const Route = createFileRoute("/approvals")({
  head: () => ({ meta: [{ title: "Approvals — Veto" }] }),
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const events = useVetoEvents();
  const items = useMemo(
    () =>
      events
        .filter((e) => e.requires_approval)
        .map((e) => ({ ev: e, action: eventToAction(e) })),
    [events],
  );

  const [filter, setFilter] = useState<"all" | RiskLevel>("all");
  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.ev.risk.level === filter)),
    [items, filter],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedId && filtered[0]) setSelectedId(filtered[0].ev.id);
  }, [filtered, selectedId]);

  const selected = items.find((i) => i.ev.id === selectedId) ?? null;
  const pendingCount = items.filter((i) => i.ev.status === "pending" || i.ev.status === "intercepted").length;

  const decide = (id: string, status: ActionStatus) => {
    if (status === "approved" || status === "denied" || status === "escalated" || status === "blocked") {
      vetoActions.decide(id, status);
    }
  };

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
            {(["all", "critical", "high", "medium", "low"] as const).map((f) => (
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
              {filtered.map(({ ev, action }) => {
                const active = ev.id === selectedId;
                return (
                  <motion.button
                    key={ev.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    onClick={() => setSelectedId(ev.id)}
                    className={`relative w-full text-left px-5 py-4 border-b hairline last:border-0 transition-colors ${
                      active ? "bg-surface-2" : "hover:bg-surface"
                    }`}
                  >
                    {active && <span className="absolute left-0 top-0 bottom-0 w-px bg-foreground" />}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="font-mono text-[11px] text-foreground">{ev.agent_name}</span>
                      <RiskTag level={ev.risk.level} score={ev.risk.score} />
                    </div>
                    <p className="text-[13px] text-foreground/90 leading-snug mb-2 line-clamp-2">
                      {action.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-muted-foreground">{ev.tool}</span>
                      <StatusPill status={ev.status} />
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
                key={selected.ev.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="border hairline rounded-md bg-card overflow-hidden sticky top-20"
              >
                <div className="px-6 py-5 border-b hairline">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
                      REQUEST · {selected.ev.id}
                    </span>
                    <StatusPill status={selected.ev.status} />
                  </div>
                  <h3 className="text-xl font-medium tracking-tight leading-snug text-balance">
                    {selected.ev.summary}
                  </h3>
                </div>

                <div className="px-6 py-5 space-y-5">
                  <Row label="Agent" value={`${selected.ev.agent_icon}  ${selected.ev.agent_name}`} />
                  <Row label="Action" value={selected.ev.tool} mono />
                  <Row label="Affected system" value={selected.ev.resources.join(" · ")} mono />
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-1.5">
                      Risk
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <RiskTag level={selected.ev.risk.level} score={selected.ev.risk.score} />
                      <span className="text-[12px] text-muted-foreground">
                        {selected.ev.blast_radius}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 font-mono text-[10px] text-muted-foreground tracking-widest">
                      <span>USERS · <span className="text-foreground/80 tabular-nums">{formatUsers(selected.ev.risk.estimated_users_affected)}</span></span>
                      <span>$IMPACT · <span className="text-foreground/80 tabular-nums">{formatImpact(selected.ev.risk.estimated_financial_impact_usd)}</span></span>
                      <span>REVERSIBILITY · <span className="text-foreground/80">{selected.ev.risk.reversibility}</span></span>
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-1.5">
                      Reason
                    </div>
                    <p className="text-[13px] text-foreground/85 leading-relaxed">{selected.ev.reasoning}</p>
                  </div>
                </div>

                {selected.ev.status === "pending" || selected.ev.status === "intercepted" ? (
                  <div className="px-6 py-4 border-t hairline grid grid-cols-3 gap-2">
                    <button
                      onClick={() => decide(selected.ev.id, "approved")}
                      className="font-mono text-[11px] uppercase tracking-[0.18em] py-2.5 border hairline rounded-sm text-foreground/80 hover:border-foreground/40 hover:text-foreground hover:bg-surface-2"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => decide(selected.ev.id, "escalated")}
                      className="font-mono text-[11px] uppercase tracking-[0.18em] py-2.5 border hairline rounded-sm text-foreground/80 hover:border-foreground/40 hover:text-foreground hover:bg-surface-2"
                    >
                      ◇ Sandbox
                    </button>
                    <button
                      onClick={() => decide(selected.ev.id, "denied")}
                      className="font-mono text-[11px] uppercase tracking-[0.18em] py-2.5 bg-foreground text-background rounded-sm hover:bg-foreground/90"
                    >
                      ✕ Deny
                    </button>
                  </div>
                ) : (
                  <div className="px-6 py-4 border-t hairline text-center font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
                    DECISION RECORDED · {selected.ev.status.toUpperCase()}
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
