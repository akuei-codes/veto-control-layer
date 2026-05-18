import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

/**
 * Cinematic shell used by all /auth/* and /onboarding/* routes.
 * Split layout: left = brand + cinematic background, right = form.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground grid lg:grid-cols-[1.05fr_1fr] relative overflow-hidden">
      <div className="fixed inset-0 grid-bg opacity-[0.18] pointer-events-none" />
      <div className="fixed inset-0 noise pointer-events-none" />
      <div className="fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,oklch(1_0_0/6%),transparent_70%)] pointer-events-none" />

      {/* Brand / story panel */}
      <aside className="hidden lg:flex flex-col justify-between p-10 border-r hairline relative">
        <Link to="/" className="flex items-center gap-2.5 w-fit">
          <div className="w-7 h-7 rounded-sm bg-foreground text-background grid place-items-center font-mono text-[12px] font-bold">V</div>
          <div>
            <div className="font-mono text-[12px] tracking-[0.24em]">VETO</div>
            <div className="font-mono text-[9px] tracking-[0.24em] text-muted-foreground mt-0.5">CONTROL PLANE</div>
          </div>
        </Link>

        <div className="space-y-6 max-w-md">
          <div className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground">
            INTERCEPTED BEFORE EXECUTION
          </div>
          <h2 className="text-4xl xl:text-5xl font-medium tracking-tight leading-[1.05] text-balance">
            The control plane between agent intent and the real world.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Veto sits between your AI agents and production systems —
            inspecting, classifying, and pausing dangerous actions before
            they execute. Humans stay in control. Disasters get prevented.
          </p>
        </div>

        <div className="flex items-center gap-6 font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
          <span>SOC 2 READY</span>
          <span className="opacity-30">·</span>
          <span>END-TO-END AUDIT</span>
          <span className="opacity-30">·</span>
          <span>SUB-50MS INTERCEPT</span>
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative flex flex-col px-6 sm:px-10 lg:px-16 py-10 lg:py-16">
        <div className="lg:hidden mb-10 flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-foreground text-background grid place-items-center font-mono text-[11px] font-bold">V</div>
          <div className="font-mono text-[11px] tracking-[0.24em]">VETO</div>
        </div>

        <div className="max-w-sm w-full mx-auto my-auto">
          <div className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground mb-3">{eyebrow}</div>
          <h1 className="text-3xl font-medium tracking-tight leading-tight mb-2">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mb-8">{subtitle}</p>}
          {!subtitle && <div className="mb-8" />}
          {children}
        </div>

        {footer && (
          <div className="max-w-sm w-full mx-auto mt-8 text-center text-[12px] text-muted-foreground">
            {footer}
          </div>
        )}
      </main>
    </div>
  );
}

export function PrimaryButton({
  children,
  loading,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      className={`w-full h-11 rounded-sm bg-foreground text-background font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${rest.className ?? ""}`}
    >
      {loading ? "…" : children}
    </button>
  );
}

export function OAuthButton({
  provider,
  onClick,
  disabled,
}: {
  provider: "google" | "github";
  onClick: () => void;
  disabled?: boolean;
}) {
  const label = provider === "google" ? "Continue with Google" : "Continue with GitHub";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-11 rounded-sm border hairline bg-surface/30 hover:bg-surface-2 hover:border-foreground/40 transition-colors flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] disabled:opacity-50"
    >
      <span aria-hidden className="w-4 h-4 grid place-items-center">
        {provider === "google" ? (
          <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#fff" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4c-.2 1.3-1 2.3-2.1 3v2.5h3.4c2-1.8 3.1-4.5 3.1-7.3z"/><path fill="#fff" opacity=".7" d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.5c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7C4.4 19.7 8 22 12 22z"/><path fill="#fff" opacity=".5" d="M6.2 13.7c-.2-.6-.3-1.2-.3-1.7s.1-1.1.3-1.7V7.6H2.7C2.2 8.9 2 10.4 2 12s.2 3.1.7 4.4l3.5-2.7z"/><path fill="#fff" opacity=".85" d="M12 5.8c1.5 0 2.9.5 4 1.5l3-3C17.2 2.7 14.8 2 12 2 8 2 4.4 4.3 2.7 7.6l3.5 2.7C7 7.6 9.3 5.8 12 5.8z"/></svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-foreground"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5 3.3 9.3 7.8 10.8.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2.9-.3 2-.4 3-.4s2.1.1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.2 0 4.5-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.5-1.5 7.8-5.8 7.8-10.8C23.5 5.7 18.3.5 12 .5z"/></svg>
        )}
      </span>
      {label}
    </button>
  );
}

export function TextInput({
  label,
  error,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="block">
      <div className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground mb-1.5">{label}</div>
      <input
        {...rest}
        className="w-full h-11 px-3 rounded-sm bg-surface/40 border hairline focus:border-foreground/60 focus:bg-surface-2 outline-none text-[14px] transition-colors"
      />
      {error && <div className="mt-1.5 font-mono text-[10px] tracking-wider text-[var(--color-risk-critical)]">{error}</div>}
    </label>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-border" />
      <span className="font-mono text-[9px] tracking-[0.28em] text-muted-foreground/70">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
