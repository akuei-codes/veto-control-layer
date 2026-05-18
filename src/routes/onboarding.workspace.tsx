import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createWorkspaceForUser } from "@/lib/auth/auth-api";

export const Route = createFileRoute("/onboarding/workspace")({
  head: () => ({ meta: [{ title: "Create your workspace — Veto" }] }),
  component: WorkspaceOnboarding,
});

const ROLES = ["Founder / CEO", "CTO / VP Eng", "Engineering Lead", "Platform / SRE", "Security", "Other"];
const AGENT_TYPES = [
  "Coding agents",
  "DevOps / SRE agents",
  "Customer support agents",
  "Financial agents",
  "Research agents",
  "Internal workflow agents",
  "Other",
];

function WorkspaceOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [workspaceName, setWorkspaceName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [agentType, setAgentType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const steps = ["Workspace", "Company", "You", "Agents"];

  const finish = async () => {
    setSubmitting(true);
    try {
      await createWorkspaceForUser({ workspaceName, company, role, agentType });
      navigate({ to: "/integrations" });
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => (step < 3 ? setStep(step + 1) : finish());
  const canAdvance =
    step === 0
      ? workspaceName.trim().length > 1
      : step === 1
        ? company.trim().length > 1
        : step === 2
          ? !!role
          : !!agentType;

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="fixed inset-0 noise pointer-events-none" />
      <div className="fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,oklch(1_0_0/5%),transparent_70%)] pointer-events-none" />

      <header className="relative h-14 px-6 flex items-center justify-between border-b hairline">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-sm bg-foreground text-background grid place-items-center font-mono text-[11px] font-bold">V</div>
          <div className="font-mono text-sm tracking-[0.22em]">VETO</div>
        </div>
        <div className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
          STEP {String(step + 1).padStart(2, "0")} / 04
        </div>
      </header>

      <main className="relative max-w-xl mx-auto px-6 pt-16 pb-16">
        <div className="flex items-center gap-2 mb-12">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`h-px flex-1 transition-colors ${i <= step ? "bg-foreground" : "bg-border"}`} />
              <span className={`font-mono text-[10px] tracking-[0.22em] ${i === step ? "text-foreground" : "text-muted-foreground/60"}`}>
                {s.toUpperCase()}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && (
              <Section eyebrow="WORKSPACE" title="Name your workspace." hint="A workspace isolates your agents, policies, and audit trail.">
                <Field label="Workspace name" value={workspaceName} onChange={setWorkspaceName} placeholder="e.g. Production" autoFocus />
              </Section>
            )}
            {step === 1 && (
              <Section eyebrow="COMPANY" title="Who are you building this for?" hint="Used on invoices, SSO, and your audit log.">
                <Field label="Company name" value={company} onChange={setCompany} placeholder="e.g. Acme Corp" autoFocus />
              </Section>
            )}
            {step === 2 && (
              <Section eyebrow="ABOUT YOU" title="What's your role?" hint="We tailor defaults to how your team operates.">
                <Options value={role} options={ROLES} onChange={setRole} />
              </Section>
            )}
            {step === 3 && (
              <Section eyebrow="YOUR AGENTS" title="What kind of agents are you building?" hint="We seed sensible default policies and risk thresholds.">
                <Options value={agentType} options={AGENT_TYPES} onChange={setAgentType} />
              </Section>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-12">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={next}
            disabled={!canAdvance || submitting}
            className="font-mono text-[11px] uppercase tracking-[0.2em] px-5 py-2.5 bg-foreground text-background rounded-sm hover:bg-foreground/90 disabled:opacity-30 transition-colors"
          >
            {step === 3 ? (submitting ? "Creating…" : "Create workspace →") : "Continue →"}
          </button>
        </div>
      </main>
    </div>
  );
}

function Section({ eyebrow, title, hint, children }: { eyebrow: string; title: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mb-3">{eyebrow}</div>
      <h2 className="text-3xl md:text-4xl font-medium tracking-tight leading-[1.05] text-balance mb-3">{title}</h2>
      <p className="text-sm text-muted-foreground mb-8 max-w-md leading-relaxed">{hint}</p>
      {children}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, autoFocus,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean }) {
  return (
    <label className="block">
      <div className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground mb-2">{label}</div>
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-b hairline px-0 py-3 text-2xl font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground transition-colors"
      />
    </label>
  );
}

function Options({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`relative w-full text-left px-4 py-3.5 rounded-sm border transition-colors flex items-center gap-3 ${
              active ? "border-foreground bg-surface-2 text-foreground" : "border-border hover:border-foreground/40 text-foreground/80"
            }`}
          >
            <span className={`w-3 h-3 rounded-full border-2 transition-colors ${active ? "border-foreground bg-foreground" : "border-border"}`} />
            <span className="text-[14px]">{o}</span>
          </button>
        );
      })}
    </div>
  );
}
