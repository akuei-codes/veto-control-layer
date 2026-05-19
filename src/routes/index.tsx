import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { CodeBlock } from "@/components/veto/CodeBlock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Veto — The control layer for autonomous AI" },
      {
        name: "description",
        content:
          "Veto intercepts AI agent actions before they execute. Risk analysis, policy enforcement, and human approval for the systems your agents touch.",
      },
      { property: "og:title", content: "Veto — The control layer for autonomous AI" },
      {
        property: "og:description",
        content:
          "Intercept dangerous agent actions before they reach production. Risk analysis, policy enforcement, and human approval at the speed of inference.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <div className="fixed inset-0 grid-bg opacity-[0.18] pointer-events-none" />
      <div className="fixed inset-0 noise pointer-events-none" />
      <Nav />
      <Hero />
      <ProblemSection />
      <InterceptionSection />
      <ReplaySection />
      <SdkSection />
      <PoliciesSection />
      <ClosingCta />
      <Footer />
    </div>
  );
}

// ── Nav ────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b hairline" : ""
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-6 h-6 grid place-items-center border hairline rounded-sm font-mono text-[10px] tracking-tighter group-hover:border-foreground/50 transition-colors">
            V
          </span>
          <span className="font-mono text-[12px] tracking-[0.22em] uppercase">Veto</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <a href="#problem" className="hover:text-foreground transition-colors">Problem</a>
          <a href="#interception" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#sdk" className="hover:text-foreground transition-colors">SDK</a>
          <a href="#policies" className="hover:text-foreground transition-colors">Policies</a>
          <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/auth/sign-in"
            className="hidden sm:inline-flex font-mono text-[11px] uppercase tracking-[0.2em] px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/auth/sign-up"
            className="inline-flex items-center font-mono text-[11px] uppercase tracking-[0.2em] px-4 py-2 border border-foreground/30 hover:border-foreground rounded-sm transition-colors"
          >
            Get early access
          </Link>
        </div>
      </div>
    </header>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────
function Hero() {
  const reduceMotion = useReducedMotion();
  return (
    <section className="relative pt-40 pb-32 px-8">
      <div className="max-w-[1280px] mx-auto relative">
        <HeroBackdrop reduceMotion={!!reduceMotion} />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-8 px-3 py-1.5 border hairline rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-risk-low)] pulse-ring" />
            Now intercepting in private beta
          </div>
          <h1 className="text-5xl md:text-[88px] leading-[0.98] font-medium tracking-[-0.02em] text-balance">
            Before AI acts,
            <br />
            <span className="text-muted-foreground">Veto decides.</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
            Veto sits between agent intent and execution — intercepting risky
            actions, enforcing policy, and routing critical decisions to humans
            in milliseconds.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/auth/sign-up"
              className="group inline-flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.2em] px-6 py-3.5 bg-foreground text-background rounded-sm hover:bg-foreground/90 transition-colors"
            >
              Get early access
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
            <a
              href="#interception"
              className="inline-flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.2em] px-6 py-3.5 border border-foreground/20 hover:border-foreground/60 rounded-sm transition-colors"
            >
              ▷ Watch the interception
            </a>
          </div>
          <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-3 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            <span>SOC 2 ready</span>
            <span className="hidden sm:inline">·</span>
            <span>&lt; 50ms p50 intercept</span>
            <span className="hidden sm:inline">·</span>
            <span>Self-host or cloud</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HeroBackdrop({ reduceMotion }: { reduceMotion: boolean }) {
  // Floating intercepted-action cards behind the hero. Calm, restrained motion.
  const cards = [
    { id: 1, label: "delete_table", risk: "critical", status: "INTERCEPTED", top: "6%", right: "2%", delay: 0 },
    { id: 2, label: "send_email", risk: "medium", status: "AWAITING APPROVAL", top: "28%", right: "10%", delay: 0.4 },
    { id: 3, label: "transfer_funds", risk: "critical", status: "BLOCKED", top: "52%", right: "0%", delay: 0.8 },
    { id: 4, label: "rotate_key", risk: "low", status: "ALLOWED", top: "74%", right: "14%", delay: 1.2 },
  ] as const;

  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
      <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-foreground/[0.04] via-transparent to-transparent" />
      {cards.map((c) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, x: 40 }}
          animate={
            reduceMotion
              ? { opacity: 1, x: 0 }
              : { opacity: 1, x: 0, y: [0, -6, 0] }
          }
          transition={
            reduceMotion
              ? { duration: 0.8 }
              : {
                  opacity: { duration: 0.9, delay: c.delay, ease: [0.22, 1, 0.36, 1] },
                  x: { duration: 0.9, delay: c.delay, ease: [0.22, 1, 0.36, 1] },
                  y: { duration: 6 + c.id, repeat: Infinity, ease: "easeInOut", delay: c.delay },
                }
          }
          className="absolute w-[300px] border hairline bg-background/70 backdrop-blur-md rounded-md p-4"
          style={{ top: c.top, right: c.right }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-muted-foreground">
              agent.tool_call
            </span>
            <RiskDot risk={c.risk} />
          </div>
          <div className="font-mono text-sm text-foreground/90">{c.label}()</div>
          <div className="mt-3 flex items-center justify-between">
            <span
              className="font-mono text-[9px] tracking-[0.22em] uppercase"
              style={{
                color:
                  c.risk === "critical"
                    ? "var(--color-risk-critical)"
                    : c.risk === "medium"
                      ? "var(--color-risk-medium)"
                      : "var(--color-risk-low)",
              }}
            >
              {c.status}
            </span>
            <span className="font-mono text-[9px] text-muted-foreground tabular-nums">
              {(20 + c.id * 9).toString().padStart(2, "0")}ms
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function RiskDot({ risk }: { risk: string }) {
  const color =
    risk === "critical"
      ? "var(--color-risk-critical)"
      : risk === "medium"
        ? "var(--color-risk-medium)"
        : "var(--color-risk-low)";
  return (
    <span className="relative flex w-2 h-2">
      <span
        className="absolute inset-0 rounded-full opacity-60 pulse-ring"
        style={{ background: color }}
      />
      <span className="relative w-2 h-2 rounded-full" style={{ background: color }} />
    </span>
  );
}

// ── Section primitives ────────────────────────────────────────────────────
function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-2xl mb-16"
    >
      <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-5">
        / {eyebrow}
      </div>
      <h2 className="text-4xl md:text-5xl leading-[1.05] font-medium tracking-[-0.02em] text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  );
}

// ── Problem ───────────────────────────────────────────────────────────────
function ProblemSection() {
  const surfaces = [
    { label: "Production databases", note: "DROP, TRUNCATE, irreversible writes" },
    { label: "Billing & payments", note: "Refunds, transfers, charges" },
    { label: "Customer communication", note: "Email, SMS, in-app at scale" },
    { label: "Infrastructure", note: "Terraform plans, key rotation, deploys" },
    { label: "Secrets & tokens", note: "API keys, credentials, OAuth grants" },
    { label: "Code & merges", note: "PRs, force-pushes, branch deletes" },
  ];
  return (
    <section id="problem" className="px-8 py-32 relative">
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader
          eyebrow="The Problem"
          title={
            <>
              Agents now touch the systems
              <br />
              <span className="text-muted-foreground">that used to need a human.</span>
            </>
          }
          description="Tool-using LLMs are wiring themselves into production. Every tool call is a potential incident — and most teams are shipping with no layer between intent and execution."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/40 border hairline rounded-md overflow-hidden">
          {surfaces.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="bg-background p-6 hover:bg-card transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-risk-critical)]" />
                <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-muted-foreground">
                  Exposed surface
                </span>
              </div>
              <div className="text-[15px] text-foreground mb-1">{s.label}</div>
              <div className="font-mono text-[11px] text-muted-foreground">{s.note}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Interception flow ─────────────────────────────────────────────────────
function InterceptionSection() {
  const steps = [
    { n: "01", title: "Agent proposes", desc: "Tool call captured by the SDK before execution." },
    { n: "02", title: "Risk analysis", desc: "Blast radius, reversibility, and confidence scored." },
    { n: "03", title: "Policy match", desc: "Rules evaluated against your workspace policies." },
    { n: "04", title: "Human review", desc: "Critical decisions routed to approvers, in band." },
    { n: "05", title: "Execute or block", desc: "Action proceeds or is permanently halted." },
  ];
  return (
    <section id="interception" className="px-8 py-32 relative border-t hairline">
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader
          eyebrow="The Interception Moment"
          title={
            <>
              Five steps stand between an agent
              <br />
              <span className="text-muted-foreground">and the rest of your stack.</span>
            </>
          }
          description="Every tool call passes through the same pipeline. Safe actions never feel it. Dangerous actions never reach production."
        />
        <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-px bg-border/40 border hairline rounded-md overflow-hidden">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="bg-background p-7 relative"
            >
              <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-6">
                {s.n}
              </div>
              <div className="text-[15px] text-foreground mb-2">{s.title}</div>
              <div className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                {s.desc}
              </div>
              {i < steps.length - 1 && (
                <span className="hidden lg:block absolute top-1/2 -right-3 text-muted-foreground/40">
                  →
                </span>
              )}
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors"
          >
            Explore the command center →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Replay showcase ───────────────────────────────────────────────────────
function ReplaySection() {
  const phases = [
    { t: "00:00.000", label: "Agent emits tool_call", state: "captured" },
    { t: "00:00.012", label: "Risk engine: blast_radius=catastrophic", state: "scored" },
    { t: "00:00.027", label: "Policy match: never_destroy_production", state: "matched" },
    { t: "00:00.041", label: "Escalated to on-call approver", state: "escalated" },
    { t: "00:00.183", label: "Human denied — execution halted", state: "blocked" },
  ];
  return (
    <section className="px-8 py-32 relative border-t hairline">
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader
          eyebrow="Disaster, prevented"
          title={
            <>
              A replay of every decision —
              <br />
              <span className="text-muted-foreground">down to the millisecond.</span>
            </>
          }
          description="Every intercept is recorded as a timeline you can audit, replay, and hand to compliance. No reconstruction. No guesswork."
        />
        <div className="border hairline rounded-md bg-card overflow-hidden">
          <div className="px-5 py-3 border-b hairline flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-risk-critical)] pulse-ring" />
              Incident · agent-prod-cleanup
            </div>
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--color-risk-low)]">
              ✓ Disaster prevented
            </div>
          </div>
          <ol className="divide-y hairline">
            {phases.map((p, i) => (
              <motion.li
                key={p.t}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="px-5 py-4 grid grid-cols-[120px_1fr_auto] gap-4 items-center"
              >
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {p.t}
                </span>
                <span className="text-[13px] text-foreground/90">{p.label}</span>
                <span
                  className="font-mono text-[9px] tracking-[0.22em] uppercase"
                  style={{
                    color:
                      p.state === "blocked"
                        ? "var(--color-risk-critical)"
                        : p.state === "escalated"
                          ? "var(--color-risk-medium)"
                          : "var(--muted-foreground)",
                  }}
                >
                  {p.state}
                </span>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// ── SDK ───────────────────────────────────────────────────────────────────
function SdkSection() {
  const install = `npm install @veto/sdk`;
  const usage = `import { Veto } from "@veto/sdk";

const veto = new Veto({ apiKey: process.env.VETO_KEY });

// Wrap any tool call your agent makes.
const result = await veto.intercept({
  tool: "delete_table",
  args: { table: "users" },
  agent: "support-bot",
  execute: () => db.dropTable("users"),
});

// Veto returns the executed value, or throws if the action was blocked.`;

  return (
    <section id="sdk" className="px-8 py-32 relative border-t hairline">
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader
          eyebrow="Developer Experience"
          title={
            <>
              Drop-in interception
              <br />
              <span className="text-muted-foreground">in a single function call.</span>
            </>
          }
          description="One SDK, every framework. Works with OpenAI tools, Anthropic tool_use, LangGraph, CrewAI, and any custom tool-calling loop."
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <CodeBlock lang="bash" code={install} />
            <CodeBlock lang="ts" code={usage} />
          </div>
          <div className="space-y-4">
            <FeatureRow title="Sub-50ms intercept" body="The SDK adds milliseconds, not seconds. Latency budget aware." />
            <FeatureRow title="Fail open or closed" body="You decide the posture per tool, per environment, per agent." />
            <FeatureRow title="Streaming approvals" body="Approvers see context, args, blast radius — and decide in band." />
            <FeatureRow title="First-class audit" body="Every decision is signed, timestamped, and replayable." />
            <div className="pt-4">
              <Link
                to="/docs"
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors"
              >
                Read the SDK docs →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureRow({ title, body }: { title: string; body: string }) {
  return (
    <div className="border hairline rounded-md p-5 bg-card/40 hover:bg-card transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-muted-foreground">
          ▸
        </span>
        <div className="text-[14px] text-foreground">{title}</div>
      </div>
      <div className="text-[13px] text-muted-foreground leading-relaxed pl-5">{body}</div>
    </div>
  );
}

// ── Policies ──────────────────────────────────────────────────────────────
function PoliciesSection() {
  const policies = [
    { name: "never_destroy_production", sev: "critical", body: "Block any irreversible write against tables tagged production." },
    { name: "approve_outbound_email", sev: "medium", body: "Require human approval before sending more than 10 emails in 60s." },
    { name: "no_secret_exposure", sev: "critical", body: "Halt tool calls that surface API keys or credentials in plaintext." },
    { name: "rate_limit_refunds", sev: "high", body: "Cap agent-initiated refunds at $500 per hour, per workspace." },
  ];
  return (
    <section id="policies" className="px-8 py-32 relative border-t hairline">
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader
          eyebrow="Policies"
          title={
            <>
              Encode your operational guardrails
              <br />
              <span className="text-muted-foreground">as code your agents must respect.</span>
            </>
          }
          description="Start from our library. Author your own. Every rule is versioned, signed, and visible to the people who own the system being touched."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="border hairline rounded-md p-6 bg-card/40 hover:bg-card transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[12px] text-foreground/90">{p.name}</span>
                <span
                  className="font-mono text-[9px] tracking-[0.22em] uppercase px-2 py-0.5 rounded-sm border"
                  style={{
                    color:
                      p.sev === "critical"
                        ? "var(--color-risk-critical)"
                        : p.sev === "high"
                          ? "var(--color-risk-high)"
                          : "var(--color-risk-medium)",
                    borderColor:
                      p.sev === "critical"
                        ? "color-mix(in oklab, var(--color-risk-critical) 30%, transparent)"
                        : p.sev === "high"
                          ? "color-mix(in oklab, var(--color-risk-high) 30%, transparent)"
                          : "color-mix(in oklab, var(--color-risk-medium) 30%, transparent)",
                  }}
                >
                  {p.sev}
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Closing CTA ───────────────────────────────────────────────────────────
function ClosingCta() {
  return (
    <section className="px-8 py-40 relative border-t hairline">
      <div className="max-w-[1280px] mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-8">
            / The control layer
          </div>
          <h2 className="text-5xl md:text-7xl leading-[0.98] font-medium tracking-[-0.02em] text-balance max-w-3xl mx-auto">
            Your agents are about to do something.
            <br />
            <span className="text-muted-foreground">Decide what reaches reality.</span>
          </h2>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth/sign-up"
              className="inline-flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.2em] px-7 py-4 bg-foreground text-background rounded-sm hover:bg-foreground/90 transition-colors"
            >
              Get early access →
            </Link>
            <Link
              to="/docs"
              className="inline-flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.2em] px-7 py-4 border border-foreground/20 hover:border-foreground/60 rounded-sm transition-colors"
            >
              Read the docs
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-8 py-12 border-t hairline">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <span className="w-5 h-5 grid place-items-center border hairline rounded-sm font-mono text-[10px]">V</span>
          <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-muted-foreground">
            Veto · The control layer for autonomous AI
          </span>
        </div>
        <div className="flex items-center gap-6 font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
          <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
          <Link to="/auth/sign-in" className="hover:text-foreground transition-colors">Sign in</Link>
          <a href="mailto:hello@veto.dev" className="hover:text-foreground transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
