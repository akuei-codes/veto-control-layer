import { motion } from "motion/react";

export function TopBar({
  intercepted,
  blocked,
  pending,
  onDemo,
  demoRunning,
}: {
  intercepted: number;
  blocked: number;
  pending: number;
  onDemo: () => void;
  demoRunning: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 border-b hairline bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-sm bg-foreground text-background grid place-items-center font-mono text-[11px] font-bold">V</div>
            <div className="font-mono text-sm tracking-[0.22em] text-foreground">VETO</div>
            <span className="font-mono text-[10px] text-muted-foreground tracking-widest">CONTROL PLANE</span>
          </div>
          <nav className="hidden md:flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {["Intercepts", "Policies", "Replay", "Agents", "Audit"].map((n, i) => (
              <button
                key={n}
                className={`px-3 py-1.5 rounded-sm transition-colors ${i === 0 ? "text-foreground bg-surface-2" : "hover:text-foreground"}`}
              >
                {n}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <Stat label="INTERCEPTED" value={intercepted} />
          <Stat label="BLOCKED" value={blocked} tone="critical" />
          <Stat label="PENDING" value={pending} tone="medium" />
          <button
            onClick={onDemo}
            disabled={demoRunning}
            className="relative group font-mono text-[11px] uppercase tracking-[0.2em] px-3.5 py-2 border border-foreground/20 rounded-sm hover:border-foreground/60 transition-colors disabled:opacity-50"
          >
            {demoRunning && (
              <motion.span
                className="absolute inset-0 rounded-sm border border-[var(--color-risk-critical)]/60"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
            )}
            {demoRunning ? "▮ Running…" : "▶ Run Demo Scenario"}
          </button>
        </div>
      </div>
    </header>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "critical" | "medium";
}) {
  const color =
    tone === "critical"
      ? "var(--color-risk-critical)"
      : tone === "medium"
        ? "var(--color-risk-medium)"
        : "var(--color-foreground)";
  return (
    <div className="flex flex-col items-end">
      <div className="font-mono text-[9px] text-muted-foreground tracking-[0.22em]">{label}</div>
      <div className="font-mono text-sm tabular-nums" style={{ color }}>
        {value.toString().padStart(3, "0")}
      </div>
    </div>
  );
}
