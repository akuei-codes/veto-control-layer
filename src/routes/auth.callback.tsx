import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getCurrentUser, getUserWorkspace } from "@/lib/auth/auth-api";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Signing you in… — Veto" }] }),
  component: Callback,
});

function Callback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        // Give Supabase a tick to consume the URL hash/code if present.
        await new Promise((r) => setTimeout(r, 250));
        const user = await getCurrentUser();
        if (cancelled) return;
        if (!user) {
          navigate({ to: "/auth/sign-in" });
          return;
        }
        const workspace = await getUserWorkspace();
        if (cancelled) return;
        navigate({ to: workspace ? "/dashboard" : "/onboarding/workspace" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to complete sign-in");
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center relative overflow-hidden">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="fixed inset-0 noise pointer-events-none" />
      <div className="relative text-center">
        <div className="font-mono text-[10px] tracking-[0.32em] text-muted-foreground mb-4">
          ESTABLISHING SECURE SESSION
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-foreground/60 animate-pulse [animation-delay:120ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 animate-pulse [animation-delay:240ms]" />
        </div>
        {error && (
          <div className="mt-6 font-mono text-[11px] text-[var(--color-risk-critical)]">{error}</div>
        )}
      </div>
    </div>
  );
}
