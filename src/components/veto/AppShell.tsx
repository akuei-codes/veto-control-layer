import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";

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

  // First-run gate: send to /onboarding unless completed
  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = window.localStorage.getItem("veto.onboarded");
    if (!done && pathname !== "/onboarding") {
      navigate({ to: "/onboarding" });
    }
  }, [navigate, pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground flex relative">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="fixed inset-0 noise pointer-events-none" />

      <Sidebar />

      <div className="flex-1 min-w-0 relative">
        {(title || actions) && (
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
            <div className="flex items-center gap-2">{actions}</div>
          </header>
        )}

        <main className={fullBleed ? "" : "px-8 py-8 max-w-[1400px] mx-auto"}>{children}</main>
      </div>
    </div>
  );
}
