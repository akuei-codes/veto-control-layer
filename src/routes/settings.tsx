import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/veto/AppShell";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Veto" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [workspace, setWorkspace] = useState<{ company?: string; role?: string; agentType?: string }>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("veto.workspace");
      if (raw) setWorkspace(JSON.parse(raw));
    } catch {}
  }, []);

  const reset = () => {
    window.localStorage.removeItem("veto.onboarded");
    window.localStorage.removeItem("veto.workspace");
    window.location.href = "/onboarding";
  };

  return (
    <AppShell eyebrow="ADMIN" title="Settings">
      <div className="max-w-2xl space-y-10">
        <section>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
            Workspace
          </h2>
          <div className="border hairline rounded-md bg-card divide-y divide-[var(--hairline)]">
            <Row label="Company" value={workspace.company ?? "—"} />
            <Row label="Your role" value={workspace.role ?? "—"} />
            <Row label="Agent type" value={workspace.agentType ?? "—"} />
            <Row label="Region" value="us-east-1 (edge)" />
          </div>
        </section>

        <section>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
            Notifications
          </h2>
          <div className="border hairline rounded-md bg-card divide-y divide-[var(--hairline)]">
            <Toggle label="Slack on critical intercepts" defaultOn />
            <Toggle label="Email digest (daily)" defaultOn />
            <Toggle label="PagerDuty on production-blocked" />
          </div>
        </section>

        <section>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
            Danger zone
          </h2>
          <div className="border hairline rounded-md bg-card p-5 flex items-center justify-between">
            <div>
              <div className="text-[13px] text-foreground mb-1">Reset onboarding</div>
              <div className="text-[11px] text-muted-foreground">Clears local workspace state and replays the setup flow.</div>
            </div>
            <button
              onClick={reset}
              className="font-mono text-[11px] uppercase tracking-[0.2em] px-3.5 py-2 border border-[var(--color-risk-critical)]/50 text-[var(--color-risk-critical)] rounded-sm hover:bg-[var(--color-risk-critical)]/10"
            >
              Reset
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-3 flex items-center justify-between">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <span className="text-[13px] text-foreground/90">{value}</span>
    </div>
  );
}

function Toggle({ label, defaultOn }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="px-5 py-3 flex items-center justify-between">
      <span className="text-[13px] text-foreground/90">{label}</span>
      <button
        onClick={() => setOn((v) => !v)}
        className={`relative w-9 h-5 rounded-full border transition-colors ${
          on ? "bg-foreground border-foreground" : "bg-transparent border-border"
        }`}
      >
        <span
          className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all ${
            on ? "left-[1.125rem] bg-background" : "left-[0.125rem] bg-muted-foreground"
          }`}
        />
      </button>
    </div>
  );
}
