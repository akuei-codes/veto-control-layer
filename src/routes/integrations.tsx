import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { AppShell } from "@/components/veto/AppShell";
import { CodeBlock } from "@/components/veto/CodeBlock";

export const Route = createFileRoute("/integrations")({
  head: () => ({ meta: [{ title: "Connect your agent — Veto" }] }),
  component: Integrations,
});

const SDK_INSTALL = `npm install @veto/sdk`;

const SDK_INIT = `import { Veto } from "@veto/sdk";

export const veto = new Veto({
  apiKey: process.env.VETO_SECRET_KEY,
  environment: "production",
});`;

const INTERCEPT_SNIPPET = `const decision = await veto.intercept({
  agentId: "dev-agent-01",
  action: "delete_database",
  target: "production-db",
  environment: "production",
  metadata: {
    reason: "cleanup unused tables",
    requestedBy: "autonomous-agent",
  },
});

if (decision.status === "approved") {
  await executeAction();
} else {
  throw new Error("Action blocked by Veto");
}`;

const LANGS = ["TypeScript", "Python", "Go", "Rust"] as const;

function Integrations() {
  const [lang, setLang] = useState<(typeof LANGS)[number]>("TypeScript");

  return (
    <AppShell eyebrow="SETUP" title="Connect your agent">
      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-3">
          <div className="sticky top-20 space-y-1">
            {[
              { n: "01", label: "Install SDK", anchor: "install" },
              { n: "02", label: "Initialize", anchor: "init" },
              { n: "03", label: "Intercept action", anchor: "intercept" },
              { n: "04", label: "Verify connection", anchor: "verify" },
            ].map((s) => (
              <a
                key={s.n}
                href={`#${s.anchor}`}
                className="flex items-center gap-3 px-3 py-2 text-[12px] text-muted-foreground hover:text-foreground rounded-sm hover:bg-surface-2 transition-colors"
              >
                <span className="font-mono text-[10px] text-muted-foreground/60">{s.n}</span>
                {s.label}
              </a>
            ))}
            <div className="pt-4 mt-4 border-t hairline">
              <Link
                to="/api-keys"
                className="block px-3 py-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
              >
                → Get API keys
              </Link>
              <Link
                to="/docs"
                className="block px-3 py-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
              >
                → Read docs
              </Link>
            </div>
          </div>
        </aside>

        <div className="col-span-12 lg:col-span-9 space-y-10">
          <Hero />

          <Step n="01" id="install" title="Install the SDK">
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Veto ships SDKs for every major runtime. Install the package your agents already use.
            </p>
            <Tabs value={lang} onChange={(v) => setLang(v as typeof lang)} options={[...LANGS]} />
            <CodeBlock code={SDK_INSTALL} lang="bash" />
          </Step>

          <Step n="02" id="init" title="Initialize the client">
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Create a single Veto client and reuse it across your agent runtime. The secret key never
              leaves your server.
            </p>
            <CodeBlock code={SDK_INIT} lang="ts" />
          </Step>

          <Step n="03" id="intercept" title="Wrap every risky action">
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Replace direct tool calls with{" "}
              <code className="font-mono text-foreground/90 bg-surface-2 px-1.5 py-0.5 rounded-sm">
                veto.intercept(...)
              </code>
              . Veto inspects, scores, and routes the action for approval — all in under 50ms.
            </p>
            <CodeBlock code={INTERCEPT_SNIPPET} lang="ts" />

            <div className="grid grid-cols-3 gap-px bg-border rounded-md overflow-hidden mt-4">
              {[
                ["agentId", "Unique identifier of the calling agent"],
                ["action", "Semantic verb describing the operation"],
                ["target", "The resource the action will touch"],
              ].map(([k, v]) => (
                <div key={k} className="bg-card p-4">
                  <div className="font-mono text-[11px] text-foreground mb-1">{k}</div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed">{v}</div>
                </div>
              ))}
            </div>
          </Step>

          <Step n="04" id="verify" title="Verify your connection">
            <ConnectionStatus />
          </Step>

          <div className="flex items-center justify-between pt-6 border-t hairline">
            <Link
              to="/api-keys"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              ← Manage API keys
            </Link>
            <Link
              to="/policies"
              className="font-mono text-[11px] uppercase tracking-[0.2em] px-5 py-2.5 bg-foreground text-background rounded-sm hover:bg-foreground/90"
            >
              Next: configure policies →
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Hero() {
  return (
    <section className="border hairline rounded-md bg-card p-8 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="relative">
        <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mb-3">
          / INTEGRATION
        </div>
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight max-w-2xl text-balance">
          Three lines of code between your agent and a catastrophe.
        </h2>
        <p className="text-sm text-muted-foreground mt-3 max-w-xl leading-relaxed">
          Wrap any agent action with Veto. We intercept, score, and route to humans when it matters —
          and stay out of the way when it doesn't.
        </p>
      </div>
    </section>
  );
}

function Step({
  n,
  id,
  title,
  children,
}: {
  n: string;
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="flex items-baseline gap-4 mb-4">
        <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">{n}</span>
        <h3 className="text-xl font-medium tracking-tight">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Tabs({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex border hairline rounded-sm overflow-hidden mb-3">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`relative font-mono text-[11px] uppercase tracking-[0.18em] px-3.5 py-1.5 transition-colors ${
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {active && (
              <motion.span
                layoutId="tabs-active"
                className="absolute inset-0 bg-surface-2"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{o}</span>
          </button>
        );
      })}
    </div>
  );
}

export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="relative border hairline rounded-md bg-background overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b hairline">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          <span className="ml-2 font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
            {lang ?? "text"}
          </span>
        </div>
        <button
          onClick={copy}
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre className="font-mono text-[12px] leading-relaxed p-4 overflow-x-auto text-foreground/90">
        {code}
      </pre>
    </div>
  );
}

function ConnectionStatus() {
  const [connected, setConnected] = useState(false);
  return (
    <div className="border hairline rounded-md bg-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <span className="relative flex w-2 h-2">
          {connected && (
            <span className="absolute inset-0 rounded-full bg-[var(--color-risk-low)] pulse-ring" />
          )}
          <span
            className={`relative w-2 h-2 rounded-full ${
              connected ? "bg-[var(--color-risk-low)]" : "bg-muted-foreground/40"
            }`}
          />
        </span>
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-foreground">
          {connected ? "Live connection detected" : "Waiting for first intercept…"}
        </span>
      </div>
      <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">
        Once your agent calls{" "}
        <code className="font-mono text-foreground/80">veto.intercept()</code>, it will appear here
        and in the Command Center within ~50ms.
      </p>
      <button
        onClick={() => setConnected(true)}
        className="font-mono text-[10px] uppercase tracking-[0.2em] px-3.5 py-2 border hairline rounded-sm text-foreground/80 hover:border-foreground/40 hover:text-foreground transition-colors"
      >
        ▶ Simulate test event
      </button>
    </div>
  );
}
