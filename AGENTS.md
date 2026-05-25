# AI Monitoring Frontend — agent notes

React 19 + Vite + TypeScript. OAuth sign-in (Google/Gmail, Microsoft, Yahoo) with PKCE.

## Layout

- `src/types/auth.ts` — API contracts
- `src/services/authService.ts` — OAuth start + callback + FastAPI POST
- `src/components/auth/` — Login UI
- `.cursor/rules/` — Cursor rules for auth work

## Local dev

1. Copy `.env.example` → `.env` and set `VITE_AUTH_MOCK=true`.
2. `npm run dev` — sign in with any provider (mock session).
3. Point FastAPI at `POST /api/v1/auth/oauth`; see `docs/fastapi-auth-models.py`.

## Backend

Exchange `authorization_code` server-side; return `AuthSession` JSON. Never trust the browser alone.
