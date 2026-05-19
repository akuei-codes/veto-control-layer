import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell, PrimaryButton, OAuthButton, TextInput, Divider } from "@/components/veto/AuthShell";
import {
  signInWithEmail,
  signInWithGitHub,
  signInWithGoogle,
} from "@/lib/auth/auth-api";

export const Route = createFileRoute("/auth/sign-in")({
  head: () => ({ meta: [{ title: "Sign in — Veto" }] }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      navigate({ to: "/auth/callback" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="ACCESS"
      title="Sign in to Veto"
      subtitle="Continue intercepting agent actions before execution."
      footer={
        <>
          New to Veto?{" "}
          <Link to="/auth/sign-up" className="text-foreground underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <div className="space-y-2.5">
        <OAuthButton provider="google" onClick={signInWithGoogle} />
        <OAuthButton provider="github" onClick={signInWithGitHub} />
      </div>
      <Divider label="OR WITH EMAIL" />
      <form onSubmit={onSubmit} className="space-y-4">
        <TextInput
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextInput
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <div className="font-mono text-[10px] tracking-wider text-[var(--color-risk-critical)]">{error}</div>
        )}
        <PrimaryButton loading={loading}>Sign in</PrimaryButton>
        <div className="text-right">
          <Link
            to="/auth/reset-password"
            className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
