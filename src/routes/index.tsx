import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppShell } from "@/components/veto/AppShell";
import { ActivityFeed } from "@/components/veto/ActivityFeed";
import { InspectionPanel } from "@/components/veto/InspectionPanel";
import { ReplayTimeline } from "@/components/veto/ReplayTimeline";
import {
  useVetoEvents,
  useVetoDemo,
  vetoActions,
  STORY_EVENT_ID,
} from "@/lib/veto-store";
import { eventToAction } from "@/lib/veto-schema";
import type { ActionStatus } from "@/lib/veto-schema";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Command Center — Veto" },
      {
        name: "description",
        content:
          "The real-time control plane for AI agents. Inspect, classify, and approve every action before it executes.",
      },
    ],
  }),
  component: CommandCenter,
});

function CommandCenter() {
  const events = useVetoEvents();
  const demo = useVetoDemo();
  const actions = useMemo(() => events.map(eventToAction), [events]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auto-select the most recent event on first render and whenever
  // the story event arrives.
  useEffect(() => {
    if (!selectedId && actions[0]) setSelectedId(actions[0].id);
  }, [actions, selectedId]);
  useEffect(() => {
    if (demo.running) setSelectedId(STORY_EVENT_ID);
  }, [demo.running]);

  const handleDecision = useCallback((id: string, status: ActionStatus) => {
    if (status === "approved" || status === "denied" || status === "blocked" || status === "escalated") {
      vetoActions.decide(id, status);
      if (id === STORY_EVENT_ID && (status === "denied" || status === "blocked")) {
        vetoActions.markStoryResolved();
      }
    }
  }, []);

  const selected = useMemo(
    () => actions.find((a) => a.id === selectedId) ?? null,
    [actions, selectedId],
  );

  return (
    <AppShell
      eyebrow="LIVE"
      title="Command Center"
      actions={
        <>
          <span className="hidden md:flex items-center gap-1.5 font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-risk-low)] pulse-ring" />
            STREAMING
          </span>
          <button
            onClick={() => vetoActions.runStoryDemo()}
            disabled={demo.running}
            className="relative font-mono text-[11px] uppercase tracking-[0.2em] px-3.5 py-2 border border-foreground/20 rounded-sm hover:border-foreground/60 transition-colors disabled:opacity-50"
          >
            {demo.running && (
              <motion.span
                className="absolute inset-0 rounded-sm border border-[var(--color-risk-critical)]/60"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
            )}
            {demo.running ? "▮ Running…" : "▶ Run demo scenario"}
          </button>
        </>
      }
      fullBleed
    >
      <div className="px-8 py-6 max-w-[1600px] mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <div className="flex items-end justify-between gap-8">
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mb-3">
                / CONTROL PLANE · LIVE
              </div>
              <h1 className="text-3xl md:text-[44px] leading-[1] font-medium tracking-tight text-balance max-w-2xl">
                Every agent action,{" "}
                <span className="text-muted-foreground">inspected before it executes.</span>
              </h1>
            </div>
            <KPIBar events={events.length} />
          </div>
        </motion.section>

        <AnimatePresence>
          {(demo.caption || demo.resolved) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`mb-6 border hairline rounded-md p-4 flex items-center gap-4 ${
                demo.resolved ? "bg-[var(--color-risk-low)]/5" : "bg-card"
              }`}
            >
              <span className="relative flex w-2 h-2 shrink-0">
                <span
                  className={`absolute inset-0 rounded-full ${
                    demo.resolved ? "bg-[var(--color-risk-low)]" : "bg-[var(--color-risk-critical)]"
                  } pulse-ring`}
                />
                <span
                  className={`relative w-2 h-2 rounded-full ${
                    demo.resolved ? "bg-[var(--color-risk-low)]" : "bg-[var(--color-risk-critical)]"
                  }`}
                />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {demo.resolved ? "RESOLVED" : "DEMO SCENARIO · production-db cleanup"}
                </div>
                <div className="text-[13px] text-foreground/90">
                  {demo.resolved ?? demo.caption}
                </div>
              </div>
              {demo.resolved && (
                <span className="font-mono text-[10px] tracking-[0.22em] text-[var(--color-risk-low)] uppercase">
                  ✓ {demo.resolved}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-12 gap-4">
          <section className="col-span-12 lg:col-span-5 border hairline rounded-md bg-card overflow-hidden h-[640px]">
            <ActivityFeed
              actions={actions}
              selectedId={selectedId}
              onSelect={(a) => setSelectedId(a.id)}
            />
          </section>

          <section className="col-span-12 lg:col-span-7 border hairline rounded-md bg-card overflow-hidden h-[640px] relative">
            {selected?.riskLevel === "critical" && selected.status === "pending" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 pointer-events-none glow-critical rounded-md"
              />
            )}
            <InspectionPanel action={selected} onDecision={handleDecision} />
          </section>

          <section className="col-span-12">
            <ReplayTimeline action={selected} />
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function KPIBar({ events }: { events: number }) {
  return (
    <div className="hidden lg:flex items-center gap-6 pb-2">
      <KPI label="Intercepts (24h)" value={(2800 + events).toLocaleString()} />
      <KPI label="Blocked" value="41" />
      <KPI label="P50 latency" value="42ms" />
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <div className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground">{label}</div>
      <div className="font-mono text-base text-foreground tabular-nums">{value}</div>
    </div>
  );
}
