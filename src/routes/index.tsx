import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { TopBar } from "@/components/veto/TopBar";
import { ActivityFeed } from "@/components/veto/ActivityFeed";
import { InspectionPanel } from "@/components/veto/InspectionPanel";
import { PolicyEngine } from "@/components/veto/PolicyEngine";
import { ReplayTimeline } from "@/components/veto/ReplayTimeline";
import { DEMO_SEQUENCE, generateAction } from "@/lib/veto-simulation";
import type { ActionStatus, AgentAction } from "@/lib/veto-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Veto — Real-time control plane for AI agents" },
      {
        name: "description",
        content:
          "Veto intercepts AI agent actions before execution. Classify risk, enforce policy, require human approval. The control plane for production AI.",
      },
      { property: "og:title", content: "Veto — Real-time control plane for AI agents" },
      {
        property: "og:description",
        content:
          "Pre-execution interception, risk scoring and human approval for autonomous AI agents.",
      },
    ],
  }),
  component: CommandCenter,
});

function CommandCenter() {
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const demoRef = useRef(false);

  // Seed initial events
  useEffect(() => {
    const seed = Array.from({ length: 4 }, () => generateAction());
    setActions(seed);
    setSelectedId(seed[0]?.id ?? null);
  }, []);

  // Live simulation
  useEffect(() => {
    const tick = () => {
      if (demoRef.current) return;
      setActions((cur) => [generateAction(), ...cur].slice(0, 40));
    };
    const id = setInterval(tick, 4200);
    return () => clearInterval(id);
  }, []);

  const handleDecision = useCallback((id: string, status: ActionStatus) => {
    setActions((cur) =>
      cur.map((a) => {
        if (a.id !== id) return a;
        const next = { ...a, status };
        if (status === "approved") {
          // simulate execution shortly after
          setTimeout(() => {
            setActions((c2) =>
              c2.map((x) => (x.id === id ? { ...x, status: "executed" as ActionStatus } : x)),
            );
          }, 900);
        }
        return next;
      }),
    );
  }, []);

  const runDemo = useCallback(async () => {
    if (demoRef.current) return;
    demoRef.current = true;
    setDemoRunning(true);
    for (const level of DEMO_SEQUENCE) {
      const a = generateAction(level);
      setActions((cur) => [a, ...cur].slice(0, 40));
      setSelectedId(a.id);
      await new Promise((r) => setTimeout(r, 1100));
    }
    // auto-block the final critical
    setActions((cur) => {
      const top = cur[0];
      if (top && top.riskLevel === "critical") {
        return cur.map((x, i) => (i === 0 ? { ...x, status: "blocked" as ActionStatus } : x));
      }
      return cur;
    });
    demoRef.current = false;
    setDemoRunning(false);
  }, []);

  const selected = useMemo(
    () => actions.find((a) => a.id === selectedId) ?? null,
    [actions, selectedId],
  );

  const stats = useMemo(() => {
    return {
      intercepted: actions.length,
      blocked: actions.filter((a) => a.status === "blocked" || a.status === "denied").length,
      pending: actions.filter((a) => a.status === "pending").length,
    };
  }, [actions]);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <div className="fixed inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="fixed inset-0 noise pointer-events-none" />
      <div className="fixed inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,oklch(1_0_0/4%),transparent_70%)] pointer-events-none" />

      <TopBar
        intercepted={stats.intercepted}
        blocked={stats.blocked}
        pending={stats.pending}
        onDemo={runDemo}
        demoRunning={demoRunning}
      />

      <main className="relative px-6 py-6 max-w-[1600px] mx-auto">
        {/* Hero strip */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <div className="flex items-end justify-between gap-8">
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mb-3">
                / CONTROL PLANE / LIVE
              </div>
              <h1 className="text-[40px] md:text-[56px] leading-[0.95] font-medium tracking-tight text-balance max-w-3xl">
                Every agent action,{" "}
                <span className="text-muted-foreground">inspected before it executes.</span>
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-6 pb-2">
              <KPI label="P50 latency" value="42ms" />
              <KPI label="Throughput" value="14.2k/s" />
              <KPI label="Uptime" value="99.997%" />
            </div>
          </div>
        </motion.section>

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Feed */}
          <section className="col-span-12 lg:col-span-5 border hairline rounded-md bg-card overflow-hidden h-[640px]">
            <ActivityFeed
              actions={actions}
              selectedId={selectedId}
              onSelect={(a) => setSelectedId(a.id)}
            />
          </section>

          {/* Inspection */}
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

          {/* Timeline */}
          <section className="col-span-12">
            <ReplayTimeline action={selected} />
          </section>

          {/* Policies */}
          <section className="col-span-12 lg:col-span-7">
            <PolicyEngine />
          </section>

          {/* Risk panel */}
          <section className="col-span-12 lg:col-span-5">
            <RiskBreakdown actions={actions} />
          </section>
        </div>

        <footer className="mt-12 pb-8 flex items-center justify-between font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
          <span>VETO · PRE-EXECUTION CONTROL FOR AI AGENTS</span>
          <span>BUILD 0.1.0 · MVP</span>
        </footer>
      </main>
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

function RiskBreakdown({ actions }: { actions: AgentAction[] }) {
  const counts = {
    critical: actions.filter((a) => a.riskLevel === "critical").length,
    high: actions.filter((a) => a.riskLevel === "high").length,
    medium: actions.filter((a) => a.riskLevel === "medium").length,
    low: actions.filter((a) => a.riskLevel === "low").length,
  };
  const total = Math.max(1, actions.length);
  const rows: Array<[keyof typeof counts, string]> = [
    ["critical", "var(--color-risk-critical)"],
    ["high", "var(--color-risk-high)"],
    ["medium", "var(--color-risk-medium)"],
    ["low", "var(--color-risk-low)"],
  ];
  return (
    <div className="border hairline rounded-md bg-card overflow-hidden h-full">
      <div className="px-5 py-3 border-b hairline">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.22em]">Risk Distribution</h3>
      </div>
      <div className="p-5 space-y-3">
        {rows.map(([k, color]) => {
          const pct = (counts[k] / total) * 100;
          return (
            <div key={k}>
              <div className="flex items-center justify-between font-mono text-[11px] mb-1.5">
                <span className="uppercase tracking-[0.18em]" style={{ color }}>
                  {k}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {counts[k]} · {pct.toFixed(0)}%
                </span>
              </div>
              <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
