import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/veto/AppShell";
import { CodeBlock } from "./integrations";

export const Route = createFileRoute("/docs")({
  head: () => ({ meta: [{ title: "Docs — Veto" }] }),
  component: DocsPage,
});

const QUICKSTART = `# 1. Install
npm install @veto/sdk

# 2. Set your secret key
export VETO_SECRET_KEY="vk_sec_prod_..."

# 3. Wrap your first action
node my-agent.js`;

const INSTALL = `npm install @veto/sdk
# or
pnpm add @veto/sdk
yarn add @veto/sdk`;

const INTERCEPT = `import { Veto } from "@veto/sdk";

const veto = new Veto({ apiKey: process.env.VETO_SECRET_KEY });

const decision = await veto.intercept({
  agentId: "support-bot-1",
  action: "issue_refund",
  target: "charge_3PqL2k...",
  metadata: { amount: 24000, currency: "USD" },
});

if (decision.status !== "approved") {
  throw new Error(decision.reason);
}

await stripe.refunds.create({ charge: "charge_3PqL2k..." });`;

const POLICY = `// Policies are declared in code or via the dashboard.
veto.policies.add({
  id: "refund-cap",
  match: { action: "issue_refund" },
  when: ({ metadata }) => metadata.amount > 5_000_00,
  decision: "require_approval",
  message: "Refunds over $5,000 must be approved by finance.",
});`;

const WEBHOOK = `// POST https://your-app.com/webhooks/veto
{
  "type": "intercept.decided",
  "id": "evt_2Pq...",
  "intercept": {
    "id": "icp_3Lk...",
    "agentId": "support-bot-1",
    "action": "issue_refund",
    "status": "denied",
    "decidedBy": "user_2Nq...",
    "reason": "Outside refund policy"
  }
}`;

const RESPONSE = `// Shape returned by veto.intercept(...)
{
  status: "approved" | "denied" | "pending" | "sandboxed",
  decisionId: "dec_2Pq...",
  riskScore: 0..100,
  riskLevel: "low" | "medium" | "high" | "critical",
  reason: string,
  approvedBy?: { id, name, email },
  expiresAt?: ISODate,
}`;

const SECTIONS = [
  { id: "quickstart", title: "Quickstart", body: QUICKSTART, lang: "bash" },
  { id: "install", title: "SDK install", body: INSTALL, lang: "bash" },
  { id: "intercept", title: "Basic intercept", body: INTERCEPT, lang: "ts" },
  { id: "policy", title: "Policy example", body: POLICY, lang: "ts" },
  { id: "webhook", title: "Webhook payload", body: WEBHOOK, lang: "json" },
  { id: "response", title: "Approval response", body: RESPONSE, lang: "ts" },
];

function DocsPage() {
  return (
    <AppShell eyebrow="DEVELOPERS" title="Docs">
      <div className="grid grid-cols-12 gap-10">
        <aside className="col-span-12 lg:col-span-3">
          <nav className="sticky top-20 space-y-1">
            <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/70 px-3 mb-2">
              On this page
            </div>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block px-3 py-1.5 text-[12px] text-muted-foreground hover:text-foreground rounded-sm hover:bg-surface-2 transition-colors"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        <div className="col-span-12 lg:col-span-9 space-y-12">
          <header>
            <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mb-3">
              / DEVELOPER REFERENCE · v0.1
            </div>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-balance max-w-2xl">
              Build with Veto in under five minutes.
            </h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-xl leading-relaxed">
              Every code sample below is copy-paste runnable. Replace the test API key with your own
              from the API Keys page to go live.
            </p>
          </header>

          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-20">
              <h3 className="text-xl font-medium tracking-tight mb-3">{s.title}</h3>
              <CodeBlock code={s.body} lang={s.lang} />
            </section>
          ))}

          <footer className="pt-8 border-t hairline font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
            Need help? · support@veto.dev · status.veto.dev
          </footer>
        </div>
      </div>
    </AppShell>
  );
}
