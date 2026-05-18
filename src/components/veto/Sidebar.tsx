import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useVetoOrg, useVetoPendingCount, useVetoUnreadCount, useVetoWorkspace } from "@/lib/veto-store";

type Item = { to: string; label: string; icon: string; badgeKey?: "pending" | "unread" };

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: "Operate",
    items: [
      { to: "/", label: "Command Center", icon: "◎" },
      { to: "/approvals", label: "Approvals", icon: "▮", badgeKey: "pending" },
      { to: "/replay", label: "Replay", icon: "◐" },
    ],
  },
  {
    title: "Configure",
    items: [
      { to: "/policies", label: "Policies", icon: "▦" },
      { to: "/integrations", label: "Integrations", icon: "◇" },
      { to: "/api-keys", label: "API Keys", icon: "◈" },
    ],
  },
  {
    title: "Develop",
    items: [
      { to: "/docs", label: "Docs", icon: "▤" },
      { to: "/settings", label: "Settings", icon: "○" },
    ],
  },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const org = useVetoOrg();
  const workspace = useVetoWorkspace();
  const pendingCount = useVetoPendingCount();
  const unreadCount = useVetoUnreadCount();
  const badgeFor = (k?: Item["badgeKey"]) =>
    k === "pending" ? pendingCount : k === "unread" ? unreadCount : 0;

  return (
    <aside className="hidden md:flex flex-col w-[232px] shrink-0 border-r hairline bg-background/60 backdrop-blur-xl sticky top-0 h-screen">
      <div className="px-5 h-14 flex items-center gap-2.5 border-b hairline">
        <div className="w-6 h-6 rounded-sm bg-foreground text-background grid place-items-center font-mono text-[11px] font-bold">
          V
        </div>
        <div>
          <div className="font-mono text-[12px] tracking-[0.22em] text-foreground leading-none">VETO</div>
          <div className="font-mono text-[9px] tracking-[0.22em] text-muted-foreground mt-1">CONTROL PLANE</div>
        </div>
      </div>

      <div className="px-3 py-4 border-b hairline">
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm hover:bg-surface-2 transition-colors group">
          <div className="w-6 h-6 rounded-sm bg-surface-2 grid place-items-center font-mono text-[10px] text-foreground">
            {org.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="font-mono text-[11px] text-foreground truncate">{org.name}</div>
            <div className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">
              {workspace.environment}
            </div>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground group-hover:text-foreground">⌄</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/70 px-2.5 mb-1.5">
              {s.title}
            </div>
            <ul className="space-y-0.5">
              {s.items.map((item) => {
                const active = pathname === item.to;
                const badge = badgeFor(item.badgeKey);
                return (
                  <li key={item.to} className="relative">
                    {active && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-sm bg-surface-2"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Link
                      to={item.to}
                      className={`relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm text-[12px] transition-colors ${
                        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="font-mono text-[11px] w-3 text-center opacity-70">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {badge > 0 && (
                        <span className="font-mono text-[9px] tabular-nums px-1.5 py-0.5 rounded-sm bg-[var(--color-risk-critical)]/15 text-[var(--color-risk-critical)] border border-[var(--color-risk-critical)]/30">
                          {badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t hairline">
        <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-risk-low)] pulse-ring" />
          <span>EDGE · us-east-1</span>
        </div>
        <div className="font-mono text-[9px] text-muted-foreground/60 mt-1 tracking-widest">
          BUILD 0.1.0 · MVP
        </div>
      </div>
    </aside>
  );
}
