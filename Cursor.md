# Napoleon — Executive Message Intelligence

## Vision
Luxury-grade, minimal UI for Fortune 500 execs.

## Non‑negotiables
- Clerk‑only auth (Google + Slack via Account Portal). No NextAuth. No custom OAuth.
- Next.js 14 App Router, TypeScript, Tailwind, gentle Framer Motion.
- Production‑safe: no black screens.

## MVP
- Landing → Clerk modal → redirect to /dashboard.
- /dashboard: one‑page UX; shows Gmail + Slack messages (mock for now, last 7 days).
- Priority: messages containing "urgent" or "?" float to top.
- Auto‑refresh every 30s and a “Refresh now” button.

## Flags & Envs
- USE_MOCK=true | false (start true in prod)
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
- CLERK_SIGN_IN_URL, CLERK_SIGN_UP_URL
- CLERK_AFTER_SIGN_IN_URL=/dashboard, CLERK_AFTER_SIGN_UP_URL=/dashboard
- NEXT_PUBLIC_APP_URL

## Deploy Checklist
1) Set envs above in Vercel (Preview & Production). Start with USE_MOCK=true.
2) Deploy. Verify:
   - /api/__status → booleans true; USE_MOCK: "true".
   - /api/health → { ok: true }.
   - / renders, sign‑in modal works; /dashboard shows mock messages.
3) When stable, flip USE_MOCK=false on Preview, integrate live fetchers, then flip Production.

## Out of Scope (this branch)
- Live Gmail/Slack; DB; NextAuth.

## Next Phases
- Replace mocks with live fetchers via Clerk‑issued tokens.
- Filters & AI scoring.
