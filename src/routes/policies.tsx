import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppShell } from "@/components/veto/AppShell";
import { useVetoPolicies, vetoActions } from "@/lib/veto-store";
import type { Policy, PolicyAction } from "@/lib/veto-schema";

export const Route = createFileRoute("/policies")({
  head: () => ({ meta: [{ title: "Policies — Veto" }] }),
  component: PoliciesPage,
});

function PoliciesPage() {
  const policies = useVetoPolicies();
  const [wizard, setWizard] = useState(true);
  const toggle = (id: string) => vetoActions.togglePolicy(id);
  const activeCount = policies.filter((p) => p.enabled).length;

  return (
    <AppShell
      eyebrow="GUARDRAILS"
      title="Policies"
      actions={
        <button className="font-mono text-[11px] uppercase tracking-[0.2em] px-3 py-1.5 border hairline rounded-sm text-foreground/80 hover:text-foreground hover:border-foreground/40">
          + New policy
        </button>
      }
    >
      <AnimatePresence mode="wait">
        {wizard ? (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="max-w-3xl"
          >
            <header className="mb-8">
              <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mb-3">
                / FIRST POLICY SET
              </div>
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-3 text-balance">
                Start with the policies that prevent the worst outcomes.
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                These defaults cover ~85% of the destructive actions we see across production AI
                agents. Toggle off anything that doesn&apos;t apply — you can refine later.
              </p>
            </header>

            <ul className="space-y-3 mb-8">
              {policies.map((p, i) => (
                <motion.li
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="border hairline rounded-md bg-card p-5"
                >
                  <div className="flex items-start gap-4">
                    <Check on={p.enabled} onChange={() => toggle(p.id)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-[10px] text-muted-foreground">{p.code}</span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70 px-1.5 py-0.5 border hairline rounded-sm">
                          {p.category}
                        </span>
                        <ActionChip a={p.action} />
                      </div>
                      <h3 className={`text-[14px] font-medium leading-snug ${p.enabled ? "text-foreground" : "text-muted-foreground/60 line-through"}`}>
                        {p.title}
                      </h3>
                      <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>

            <div className="flex items-center justify-between pt-6 border-t hairline">
              <span className="font-mono text-[11px] text-muted-foreground">
                {activeCount} of {policies.length} policies enabled
              </span>
              <div className="flex items-center gap-3">
                <Link
                  to="/api-keys"
                  className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
                >
                  ← API Keys
                </Link>
                <button
                  onClick={() => setWizard(false)}
                  className="font-mono text-[11px] uppercase tracking-[0.2em] px-5 py-2.5 bg-foreground text-background rounded-sm hover:bg-foreground/90"
                >
                  Activate {activeCount} policies →
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <PolicyManagement policies={policies} onToggle={toggle} />
            <div className="mt-6 flex justify-end">
              <Link
                to="/dashboard"
                className="font-mono text-[11px] uppercase tracking-[0.2em] px-5 py-2.5 bg-foreground text-background rounded-sm hover:bg-foreground/90"
              >
                Open Command Center →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

function Check({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-5 h-5 mt-0.5 rounded-sm border-2 grid place-items-center transition-colors shrink-0 ${
        on ? "bg-foreground border-foreground" : "border-border hover:border-foreground/50"
      }`}
    >
      {on && <span className="text-background text-[11px] leading-none">✓</span>}
    </button>
  );
}

const ACTION_META: Record<PolicyAction, { label: string; color: string }> = {
  block: { label: "BLOCK", color: "var(--color-risk-critical)" },
  approve: { label: "APPROVAL", color: "var(--color-risk-medium)" },
  sandbox: { label: "SANDBOX", color: "var(--color-risk-low)" },
  log: { label: "LOG", color: "var(--muted-foreground)" },
};

function ActionChip({ a }: { a: PolicyAction }) {
  const { label, color } = ACTION_META[a];
  return (
    <span
      className="font-mono text-[9px] uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-sm border"
      style={{ color, borderColor: `color-mix(in oklab, ${color} 40%, transparent)` }}
    >
      {label}
    </span>
  );
}

function PolicyManagement({
  policies,
  onToggle,
}: {
  policies: Policy[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="border hairline rounded-md bg-card overflow-hidden">
      <div className="grid grid-cols-12 px-5 py-3 border-b hairline font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <div className="col-span-1">ID</div>
        <div className="col-span-6">Policy</div>
        <div className="col-span-2">Category</div>
        <div className="col-span-2">Action</div>
        <div className="col-span-1 text-right">Enabled</div>
      </div>
      <ul>
        {policies.map((p) => (
          <li
            key={p.id}
            className="grid grid-cols-12 items-center px-5 py-4 border-b hairline last:border-0 group hover:bg-surface/40 transition-colors"
          >
            <div className="col-span-1 font-mono text-[11px] text-muted-foreground">{p.code}</div>
            <div className="col-span-6">
              <div className={`text-[13px] ${p.enabled ? "text-foreground" : "text-muted-foreground/60"}`}>
                {p.title}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{p.description}</div>
            </div>
            <div className="col-span-2 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              {p.category}
            </div>
            <div className="col-span-2">
              <ActionChip a={p.action} />
            </div>
            <div className="col-span-1 flex justify-end">
              <Switch on={p.enabled} onChange={() => onToggle(p.id)} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Switch({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-9 h-5 rounded-full border transition-colors ${
        on ? "bg-foreground border-foreground" : "bg-transparent border-border"
      }`}
    >
      <motion.span
        className={`absolute top-0.5 w-3.5 h-3.5 rounded-full ${on ? "bg-background" : "bg-muted-foreground"}`}
        animate={{ left: on ? "1.125rem" : "0.125rem" }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
