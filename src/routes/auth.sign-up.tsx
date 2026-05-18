import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell, PrimaryButton, OAuthButton, TextInput, Divider } from "@/components/veto/AuthShell";
import {
  isMockAuthMode,
  signInWithGitHub,
  signInWithGoogle,
  signUpWithEmail,
} from "@/lib/auth/auth-api";

export const Route = createFileRoute("/auth/sign-up")({
  head: () => ({ meta: [{ title: "Create account — Veto" }] }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await signUpWithEmail(email, password, name);
      if (res.needsConfirmation) setNeedsConfirm(true);
      else navigate({ to: "/auth/callback" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  if (needsConfirm) {
    return (
      <AuthShell eyebrow="CHECK YOUR INBOX" title="Confirm your email">
        <p className="text-sm text-muted-foreground leading-relaxed">
          We sent a confirmation link to <span className="text-foreground">{email}</span>.
          Click it to activate your account, then sign in.
        </p>
        <div className="mt-6">
          <Link to="/auth/sign-in" className="font-mono text-[11px] tracking-[0.22em] uppercase underline-offset-4 hover:underline">
            ← Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="GET STARTED"
      title="Create your Veto account"
      subtitle="Set up your workspace in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/auth/sign-in" className="text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {isMockAuthMode && (
        <div className="mb-5 px-3 py-2 rounded-sm border hairline bg-surface/40 font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
          DEMO MODE — accounts are local-only
        </div>
      )}
      <div className="space-y-2.5">
        <OAuthButton provider="google" onClick={signInWithGoogle} />
        <OAuthButton provider="github" onClick={signInWithGitHub} />
      </div>
      <Divider label="OR WITH EMAIL" />
      <form onSubmit={onSubmit} className="space-y-4">
        <TextInput label="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
        <TextInput
          label="Work email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextInput
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <div className="font-mono text-[10px] tracking-wider text-[var(--color-risk-critical)]">{error}</div>
        )}
        <PrimaryButton loading={loading}>Create account</PrimaryButton>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          By continuing you agree to Veto's{" "}
          <span className="text-foreground/80">Terms of Service</span> and{" "}
          <span className="text-foreground/80">Privacy Policy</span>.
        </p>
      </form>
    </AuthShell>
  );
}
