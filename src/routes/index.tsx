import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppShell } from "@/components/veto/AppShell";
import { ActivityFeed } from "@/components/veto/ActivityFeed";
import { InspectionPanel } from "@/components/veto/InspectionPanel";
import { ReplayTimeline } from "@/components/veto/ReplayTimeline";
import {
  generateAction,
  STORY_INITIAL,
  STORY_BEATS,
} from "@/lib/veto-simulation";
import type { ActionStatus, AgentAction } from "@/lib/veto-types";

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
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [storyMessage, setStoryMessage] = useState<string | null>(null);
  const [storyFinal, setStoryFinal] = useState<string | null>(null);
  const demoRef = useRef(false);

  useEffect(() => {
    const seed = Array.from({ length: 4 }, () => generateAction());
    setActions(seed);
    setSelectedId(seed[0]?.id ?? null);
  }, []);

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
          setTimeout(() => {
            setActions((c2) =>
              c2.map((x) => (x.id === id ? { ...x, status: "executed" as ActionStatus } : x)),
            );
          }, 900);
        }
        if (id === STORY_INITIAL.id && (status === "denied" || status === "blocked")) {
          setStoryFinal("Production database protected.");
          setStoryMessage("Human denied destructive action. No rows touched.");
        }
        return next;
      }),
    );
  }, []);

  const runStoryDemo = useCallback(async () => {
    if (demoRef.current) return;
    demoRef.current = true;
    setDemoRunning(true);
    setStoryFinal(null);

    const story = { ...STORY_INITIAL, ts: Date.now() };
    setActions((cur) => [story, ...cur.filter((a) => a.id !== story.id)].slice(0, 40));
    setSelectedId(story.id);

    for (const beat of STORY_BEATS) {
      await new Promise((r) => setTimeout(r, beat.delayMs));
      setStoryMessage(beat.caption);
      setActions((cur) =>
        cur.map((a) => (a.id === beat.patch.id ? { ...a, ...beat.patch } : a)),
      );
    }

    setStoryMessage("Awaiting human decision · click Deny to protect production");
    demoRef.current = false;
    setDemoRunning(false);
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
            onClick={runStoryDemo}
            disabled={demoRunning}
            className="relative font-mono text-[11px] uppercase tracking-[0.2em] px-3.5 py-2 border border-foreground/20 rounded-sm hover:border-foreground/60 transition-colors disabled:opacity-50"
          >
            {demoRunning && (
              <motion.span
                className="absolute inset-0 rounded-sm border border-[var(--color-risk-critical)]/60"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
            )}
            {demoRunning ? "▮ Running…" : "▶ Run demo scenario"}
          </button>
        </>
      }
    >
      <div className="px-8 py-6">
        {/* Hero */}
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
            <div className="hidden lg:flex items-center gap-6 pb-2">
              <KPI label="Intercepts (24h)" value="2,847" />
              <KPI label="Blocked" value="41" />
              <KPI label="P50 latency" value="42ms" />
            </div>
          </div>
        </motion.section>

        {/* Story banner */}
        <AnimatePresence>
          {storyMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`mb-6 border hairline rounded-md p-4 flex items-center gap-4 ${
                storyFinal ? "bg-[var(--color-risk-low)]/5" : "bg-card"
              }`}
            >
              <span
                className={`relative flex w-2 h-2 shrink-0 ${storyFinal ? "" : ""}`}
              >
                <span
                  className={`absolute inset-0 rounded-full ${
                    storyFinal ? "bg-[var(--color-risk-low)]" : "bg-[var(--color-risk-critical)]"
                  } pulse-ring`}
                />
                <span
                  className={`relative w-2 h-2 rounded-full ${
                    storyFinal ? "bg-[var(--color-risk-low)]" : "bg-[var(--color-risk-critical)]"
                  }`}
                />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {storyFinal ? "RESOLVED" : "DEMO SCENARIO · production-db cleanup"}
                </div>
                <div className="text-[13px] text-foreground/90">
                  {storyFinal ?? storyMessage}
                </div>
              </div>
              {storyFinal && (
                <span className="font-mono text-[10px] tracking-[0.22em] text-[var(--color-risk-low)] uppercase">
                  ✓ {storyFinal}
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

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <div className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground">{label}</div>
      <div className="font-mono text-base text-foreground tabular-nums">{value}</div>
    </div>
  );
}
