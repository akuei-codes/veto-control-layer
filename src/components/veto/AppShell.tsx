import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Sidebar } from "./Sidebar";
import { useVetoNotifications, useVetoUnreadCount, vetoActions } from "@/lib/veto-store";
import { useAuth } from "@/lib/auth/auth-context";

export function AppShell({
  children,
  title,
  eyebrow,
  actions,
  fullBleed = false,
}: {
  children: ReactNode;
  title?: string;
  eyebrow?: string;
  actions?: ReactNode;
  fullBleed?: boolean;
}) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { status, user, workspace, isMockMode } = useAuth();

  // Auth + onboarding gate. Mock mode auto-passes anon users through so the
  // existing demo experience stays intact for first-time visitors.
  useEffect(() => {
    if (status === "loading") return;
    if (status === "anon") {
      if (isMockMode) {
        // Demo mode: skip auth, just enforce workspace onboarding.
        if (!workspace && pathname !== "/onboarding/workspace") {
          navigate({ to: "/onboarding/workspace" });
        }
      } else {
        navigate({ to: "/auth/sign-in" });
      }
      return;
    }
    if (status === "authed" && !workspace && pathname !== "/onboarding/workspace") {
      navigate({ to: "/onboarding/workspace" });
    }
  }, [status, workspace, isMockMode, navigate, pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground flex relative">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="fixed inset-0 noise pointer-events-none" />

      <Sidebar />

      <div className="flex-1 min-w-0 relative">
        <header className="sticky top-0 z-20 h-14 border-b hairline bg-background/80 backdrop-blur-xl flex items-center justify-between px-6">
          <div className="flex items-center gap-3 min-w-0">
            {eyebrow && (
              <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
                {eyebrow}
              </span>
            )}
            {eyebrow && title && <span className="text-muted-foreground/40">/</span>}
            {title && (
              <h1 className="font-mono text-[12px] tracking-[0.18em] uppercase text-foreground truncate">
                {title}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            <EnvPill mock={isMockMode} />
            {actions}
            <NotificationBell />
            <AccountMenu name={user?.name ?? workspace?.company ?? "Operator"} email={user?.email} />
          </div>
        </header>

        <main className={fullBleed ? "" : "px-8 py-8 max-w-[1400px] mx-auto"}>{children}</main>
      </div>
    </div>
  );
}

function EnvPill({ mock }: { mock: boolean }) {
  return (
    <span
      className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border font-mono text-[9px] tracking-[0.22em] uppercase ${
        mock
          ? "border-[var(--color-risk-medium)]/40 text-[var(--color-risk-medium)]"
          : "border-foreground/15 text-muted-foreground"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${mock ? "bg-[var(--color-risk-medium)]" : "bg-[var(--color-risk-low)]"}`} />
      {mock ? "Demo Mode" : "Production"}
    </span>
  );
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const notifs = useVetoNotifications();
  const unread = useVetoUnreadCount();

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open) vetoActions.markAllNotificationsRead();
        }}
        className="relative font-mono text-[11px] uppercase tracking-[0.2em] px-2.5 py-2 border border-foreground/15 rounded-sm hover:border-foreground/40 transition-colors"
        aria-label="Notifications"
      >
        ◔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-1 grid place-items-center rounded-full bg-[var(--color-risk-critical)] text-background font-mono text-[9px] tabular-nums">
            {unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 mt-2 w-[340px] max-h-[420px] overflow-y-auto border hairline rounded-md bg-card shadow-2xl z-30"
          >
            <div className="px-4 py-2 border-b hairline font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Notifications
            </div>
            {notifs.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground font-mono text-[10px] tracking-widest">
                ALL CLEAR
              </div>
            ) : (
              <ul>
                {notifs.map((n) => (
                  <li key={n.id} className="px-4 py-3 border-b hairline last:border-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <span
                        className="font-mono text-[9px] uppercase tracking-[0.2em]"
                        style={{
                          color:
                            n.level === "critical"
                              ? "var(--color-risk-critical)"
                              : n.level === "warning"
                                ? "var(--color-risk-medium)"
                                : n.level === "success"
                                  ? "var(--color-risk-low)"
                                  : "var(--muted-foreground)",
                        }}
                      >
                        {n.kind.replace("_", " ")}
                      </span>
                      <span className="font-mono text-[9px] text-muted-foreground tabular-nums">
                        {new Date(n.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="text-[12px] text-foreground/90 truncate">{n.title}</div>
                    {n.body && (
                      <div className="text-[11px] text-muted-foreground truncate mt-0.5">{n.body}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AccountMenu({ name, email }: { name: string; email?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const initials = (name || "OP")
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-9 h-9 rounded-sm border border-foreground/15 hover:border-foreground/40 grid place-items-center font-mono text-[11px] transition-colors"
        aria-label="Account"
      >
        {initials}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 mt-2 w-[260px] border hairline rounded-md bg-card shadow-2xl z-30 overflow-hidden"
          >
            <div className="px-4 py-3 border-b hairline">
              <div className="text-[13px] text-foreground truncate">{name}</div>
              {email && <div className="font-mono text-[10px] text-muted-foreground truncate mt-0.5">{email}</div>}
            </div>
            <button
              onClick={signOut}
              className="w-full text-left px-4 py-2.5 text-[12px] hover:bg-surface-2 transition-colors font-mono tracking-[0.12em]"
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
