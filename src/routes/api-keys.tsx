import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppShell } from "@/components/veto/AppShell";
import { useVetoApiKeys, vetoActions } from "@/lib/veto-store";

export const Route = createFileRoute("/api-keys")({
  head: () => ({ meta: [{ title: "API Keys — Veto" }] }),
  component: ApiKeysPage,
});

type Env = "development" | "staging" | "production";

const ENVS: { id: Env; label: string }[] = [
  { id: "development", label: "Development" },
  { id: "staging", label: "Staging" },
  { id: "production", label: "Production" },
];

function rand(n: number) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
function makeKeys(env: Env) {
  return {
    pub: `vk_pub_${env.slice(0, 4)}_${rand(28)}`,
    sec: `vk_sec_${env.slice(0, 4)}_${rand(40)}`,
  };
}

function ApiKeysPage() {
  const [env, setEnv] = useState<Env>("development");
  const [keys, setKeys] = useState(() => ({
    development: makeKeys("development"),
    staging: makeKeys("staging"),
    production: makeKeys("production"),
  }));
  const [revealed, setRevealed] = useState(false);

  const regenerate = () => {
    setKeys((c) => ({ ...c, [env]: makeKeys(env) }));
    setRevealed(false);
  };

  return (
    <AppShell eyebrow="DEVELOPER" title="API Keys">
      <div className="max-w-3xl">
        <header className="mb-8">
          <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mb-3">
            / CREDENTIALS
          </div>
          <h2 className="text-3xl font-medium tracking-tight mb-2">Your Veto API keys</h2>
          <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
            Use the publishable key in client code and the secret key only from your server. Secret
            keys grant full intercept and approval access — rotate them if exposed.
          </p>
        </header>

        {/* Env selector */}
        <div className="flex items-center gap-px bg-border rounded-sm overflow-hidden w-fit mb-6 p-px">
          {ENVS.map((e) => {
            const active = env === e.id;
            const prod = e.id === "production";
            return (
              <button
                key={e.id}
                onClick={() => {
                  setEnv(e.id);
                  setRevealed(false);
                }}
                className={`relative font-mono text-[11px] uppercase tracking-[0.18em] px-4 py-2 transition-colors ${
                  active ? "text-foreground bg-surface-2" : "text-muted-foreground hover:text-foreground bg-card"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: prod
                        ? "var(--color-risk-critical)"
                        : e.id === "staging"
                          ? "var(--color-risk-medium)"
                          : "var(--color-risk-low)",
                    }}
                  />
                  {e.label}
                </span>
              </button>
            );
          })}
        </div>

        {env === "production" && (
          <div className="mb-6 border hairline rounded-md p-4 flex items-start gap-3 bg-[var(--color-risk-critical)]/5">
            <span className="font-mono text-[var(--color-risk-critical)] mt-0.5">▮</span>
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground mb-1">
                Production environment
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Actions intercepted with this key are routed to your live approvers. Rotating
                invalidates all running agents instantly.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <KeyRow label="Publishable key" value={keys[env].pub} hidden={false} />
          <KeyRow
            label="Secret key"
            value={keys[env].sec}
            hidden={!revealed}
            onToggle={() => setRevealed((r) => !r)}
            secret
          />
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t hairline">
          <div className="font-mono text-[11px] text-muted-foreground">
            Last rotated · <span className="text-foreground/80">never</span>
          </div>
          <button
            onClick={regenerate}
            className="font-mono text-[11px] uppercase tracking-[0.2em] px-4 py-2 border hairline rounded-sm text-foreground/80 hover:border-foreground/40 hover:text-foreground transition-colors"
          >
            ⟳ Regenerate keys
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function KeyRow({
  label,
  value,
  hidden,
  onToggle,
  secret,
}: {
  label: string;
  value: string;
  hidden: boolean;
  onToggle?: () => void;
  secret?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const display = hidden ? value.replace(/./g, "•").slice(0, 48) : value;
  const copy = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="border hairline rounded-md bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b hairline">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">
            {label}
          </span>
          {secret && (
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-risk-high)] border border-[var(--color-risk-high)]/40 px-1.5 py-0.5 rounded-sm">
              Secret
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onToggle && (
            <button
              onClick={onToggle}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground px-2 py-1"
            >
              {hidden ? "Reveal" : "Hide"}
            </button>
          )}
          <button
            onClick={copy}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground px-2 py-1"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>
      <div className="px-5 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={display}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            className="font-mono text-[13px] text-foreground/90 truncate select-all"
          >
            {display}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
