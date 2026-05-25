# AI Monitoring Frontend

React + Vite app with OAuth sign-in (Gmail/Google, Microsoft, Yahoo) and payloads prepared for a FastAPI backend.

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). With `VITE_AUTH_MOCK=true`, click any provider to simulate login locally.

## User data for FastAPI

### Request — `POST /api/v1/auth/oauth`

Sent after the provider redirects to `/auth/callback`:

```json
{
  "provider": "google",
  "authorization_code": "<code from provider>",
  "redirect_uri": "http://localhost:5173/auth/callback",
  "code_verifier": "<PKCE verifier, 43+ chars>",
  "state": "<csrf state>"
}
```

TypeScript: `OAuthLoginRequest` in `src/types/auth.ts`. Pydantic reference: `docs/fastapi-auth-models.py`.

### Response — session + user

```json
{
  "access_token": "jwt-or-opaque",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": null,
  "user": {
    "id": "usr_abc",
    "email": "user@example.com",
    "email_verified": true,
    "display_name": "Jane Doe",
    "given_name": "Jane",
    "family_name": "Doe",
    "avatar_url": "https://...",
    "provider": "google",
    "provider_subject": "108234...",
    "roles": ["user"],
    "created_at": "2026-05-25T12:00:00Z",
    "last_login_at": "2026-05-25T12:00:00Z"
  }
}
```

Backend must exchange `authorization_code` with the provider and validate tokens; the frontend only forwards the code and PKCE values.

### Client-side user (`AuthUser`)

CamelCase mirror used in React after login: `id`, `email`, `emailVerified`, `displayName`, `provider`, `providerSubject`, `roles`, etc. See `mapBackendUser()` in `src/services/authService.ts`.

## Environment

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | FastAPI origin; empty = Vite proxy `/api` → `localhost:8000` |
| `VITE_AUTH_MOCK` | `true` for local mock OAuth (no client IDs) |
| `VITE_GOOGLE_CLIENT_ID` | Google Cloud OAuth client |
| `VITE_MICROSOFT_CLIENT_ID` | Azure app registration client ID |
| `VITE_YAHOO_CLIENT_ID` | Yahoo Developer app client ID |

Register redirect URI: `http://localhost:5173/auth/callback` (and production URL when deployed).

## Project structure

```
src/
  types/auth.ts          # API types
  config/auth.ts         # Providers + env
  lib/pkce.ts            # PKCE helpers
  lib/storage.ts         # Session storage
  services/              # authService, apiClient
  context/AuthContext.tsx
  components/auth/       # LoginPage, ProviderButton, Dashboard
  pages/AuthCallback.tsx
.cursor/rules/           # Cursor IDE rules
docs/fastapi-auth-models.py
AGENTS.md
```

## FastAPI endpoint (expected)

```python
@router.post("/api/v1/auth/oauth", response_model=AuthSession)
async def oauth_login(body: OAuthLoginRequest):
    # 1. Exchange code + code_verifier with provider token endpoint
    # 2. Validate id_token / fetch userinfo
    # 3. Upsert user, issue your JWT
    ...
```

## Cursor

- Rules: `.cursor/rules/auth-oauth.mdc`
- Agent context: `AGENTS.md`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with API proxy |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

## Production

Set `VITE_AUTH_MOCK=false`, provide real client IDs, use HTTPS redirect URIs, and point `VITE_API_BASE_URL` at your API.
