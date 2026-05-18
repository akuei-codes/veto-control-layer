
## Scope

Two parallel tracks, shipped together: **(1) Auth + workspace foundation**, **(2) Cinematic UI polish across all pages**. Mock mode must keep working when Supabase env vars are absent.

I will NOT enable Lovable Cloud yet — you said keys come later. I'll scaffold against `import.meta.env.VITE_SUPABASE_*` with a graceful fallback to the existing in-memory store ("Demo mode" banner). When you provide credentials, only `.env` needs to change.

---

## Track 1 — Authentication & Workspace

### New files
- `src/lib/auth/supabase-client.ts` — lazy singleton. If env vars missing → exports `null` + `isMockMode = true`.
- `src/lib/auth/auth-api.ts` — `signUpWithEmail`, `signInWithEmail`, `signInWithGoogle`, `signInWithGitHub`, `signOut`, `getCurrentUser`, `getCurrentSession`, `getUserWorkspace`, `createWorkspaceForUser`. Each function branches on mock vs real.
- `src/lib/auth/auth-context.tsx` — `AuthProvider` + `useAuth()` hook. Wires `onAuthStateChange`, exposes `{ user, session, workspace, status: 'loading'|'authed'|'anon', isMockMode }`.
- `src/routes/auth/sign-in.tsx`
- `src/routes/auth/sign-up.tsx`
- `src/routes/auth/callback.tsx` — handles `?code=` exchange, routes to `/onboarding/workspace` or `/`.
- `src/routes/auth/reset-password.tsx`
- `src/routes/onboarding/workspace.tsx` — replaces the flat `/onboarding` flow with the deeper version (workspace name, company, role, agent type). Keeps the existing `/onboarding` as a redirect to `/onboarding/workspace` to avoid broken links.
- `src/routes/_authed.tsx` — pathless layout route with `beforeLoad` redirect gate. All protected routes will be moved underneath.
- `.env.example` — placeholder vars.
- `supabase/migrations/0001_auth_workspace.sql` — `profiles`, `organizations`, `workspaces`, `workspace_members` with RLS + auto-profile trigger. Not executed (no Cloud yet), but ready.

### Route protection
Move existing routes (`index`, `approvals`, `policies`, `integrations`, `api-keys`, `replay`, `docs`, `settings`) under a new `_authed` layout via file rename. The layout's `beforeLoad`:
- `status === 'anon'` → redirect to `/auth/sign-in`
- `authed && !workspace` → redirect to `/onboarding/workspace`
- otherwise → render

In **mock mode** the guard auto-creates a demo user + workspace so the existing demo experience is untouched.

### Root wiring
Wrap `<Outlet />` in `__root.tsx` with `<AuthProvider>`. Inject `auth` into router context.

---

## Track 2 — UI/UX Polish

Scope-limited to visual quality, copy, and motion. No store/risk-engine changes.

### App shell (`AppShell.tsx`, `Sidebar.tsx`)
- Tighter sidebar with refined active state (left hairline + soft glow, no chunky bg).
- New top-right cluster: workspace switcher (placeholder), notification bell with unread dot from store, account dropdown with avatar initials + sign out.
- Add subtle env pill ("PRODUCTION" / "DEMO MODE").

### Command Center (`/`)
- Stronger hero strip: "Intercepted before execution — N actions in last 24h".
- Re-balance grid hierarchy; activity feed gets cinematic enter animation per new event (already present, refine timing curve).
- Polished empty state ("No agent has tried to act yet — run the demo scenario").

### Approvals
- Card redesign: risk meter on left rail, blast radius callout, confidence bar, approver requirement chip. Approve/Deny/Sandbox become primary/secondary/ghost with confirm-on-deny.

### Policies
- Cards: severity badge, category tag, "Why this matters" expandable, toggle with audit toast.

### Integrations
- Stepper: 1. Install SDK → 2. Create API key → 3. Intercept first action. Live status dots per step (reads from store).
- Test event button that injects a synthetic action through the existing simulation.

### API Keys
- Reveal-once modal after generation, masked display, copy-to-clipboard with timed feedback, rotate confirmation, prod-key red warning.

### Replay
- Timeline polish: phase labels, escalation marker, "Disaster prevented" terminal state badge.

### Docs
- Cleaner two-column layout, sticky TOC, refined `CodeBlock` usage, response object reference section.

### Settings
- Sectioned layout (Workspace / Account / Webhooks / Danger zone), sign-out CTA in Account, "coming soon" chips on placeholders.

### Copy pass
Replace soft phrasing globally with Veto-native language ("Intercepted before execution", "Human approval required", "Blast radius detected", "Policy matched", "Execution blocked", "Disaster prevented").

### Motion
Standardize on a single easing token in `styles.css` (`--ease-cinematic: cubic-bezier(0.22, 1, 0.36, 1)`); apply to new-event entry, status flips, modal open. No new heavy animation libs.

---

## Technical notes

- **No Lovable Cloud activation in this pass** — purely scaffold. The `auth-api` mock branch keeps the demo identical to today when env vars are missing.
- **No `Supabase` mentioned in user-facing copy** (per platform guidance) — just "Lovable Cloud" if surfaced.
- **No breaking changes** to `veto-schema.ts`, `veto-store.ts`, `risk-engine.ts`. Workspace/user types are additive.
- **OAuth providers**: Google + GitHub. Per platform rules, when Cloud is later enabled I'll wire Google through the Lovable broker; GitHub will use direct `supabase.auth.signInWithOAuth('github')` (broker doesn't support it). For now, both buttons call the same `auth-api` wrappers that branch on mock mode.
- **Route rename** is the only structural churn. The `routeTree.gen.ts` regenerates automatically.

---

## Out of scope (will NOT do this pass)
- Activating Lovable Cloud / running migrations.
- Adding payment, email, or team-invite flows.
- New product features beyond what's listed above.
- Replacing the existing risk engine or store.

---

## Deliverable
After this pass:
- `tsc --noEmit` passes.
- Demo mode works with zero env vars (existing experience preserved).
- With env vars set + Cloud enabled later, real auth + Google + GitHub work end-to-end.
- Every page feels noticeably more premium and on-brand.
