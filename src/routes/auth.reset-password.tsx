import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell, PrimaryButton, TextInput } from "@/components/veto/AuthShell";
import { resetPassword } from "@/lib/auth/auth-api";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Veto" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="RECOVERY"
      title={sent ? "Check your inbox" : "Reset your password"}
      subtitle={
        sent
          ? `If an account exists for ${email}, you'll receive reset instructions shortly.`
          : "We'll send you a secure link to set a new password."
      }
      footer={
        <Link to="/auth/sign-in" className="text-foreground underline-offset-4 hover:underline">
          ← Back to sign in
        </Link>
      }
    >
      {!sent && (
        <form onSubmit={onSubmit} className="space-y-4">
          <TextInput
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && (
            <div className="font-mono text-[10px] tracking-wider text-[var(--color-risk-critical)]">{error}</div>
          )}
          <PrimaryButton loading={loading}>Send reset link</PrimaryButton>
        </form>
      )}
    </AuthShell>
  );
}
