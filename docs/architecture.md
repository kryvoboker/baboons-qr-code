[← Getting Started](getting-started.md) · [Back to README](../README.md) · [API Reference →](api.md)

# Architecture

## System shape

```text
Browser
  ├─ Nuxt frontend and BFF
  │    └─ internal HTTP → Laravel Nginx → PHP-FPM
  └─ Laravel OAuth login and dynamic redirect
                         ├─ PostgreSQL
                         ├─ Redis/cache
                         ├─ queue worker/cron
                         └─ shared storage

Nuxt/Laravel → QR renderer → shared public storage
```

The repository is a monorepo with independently deployable backend, frontend, and renderer concerns.

## Boundaries

| Area | Location | Responsibility |
|---|---|---|
| Laravel | `httpdocs/backend/` | API, Passport, persistence, redirects, jobs |
| Nuxt | `httpdocs/frontend/` | UI, SSR, BFF endpoints, secure browser cookies |
| QR renderer | `httpdocs/qr-renderer/` | Preview and image rendering |
| Docker | `.docker/dev/` | Development services and network topology |
| Runtime data | `storage/`, `.db/` | Shared media and local database data |

## Request flow

- Public pages call Nuxt server endpoints or renderer endpoints.
- Account pages use route middleware and call `/api/bff/*`.
- Nuxt BFF adds the internal BFF secret and Bearer token before calling Laravel.
- Laravel protects account API routes with Passport's `auth:api` guard.
- Laravel controllers validate requests and delegate reusable work to services such as QR rendering, storage-key generation, billing, and analytics jobs.

## Data flow for dynamic QR

```text
Scanner → Laravel /r/{slug}
        → subscription and active-code checks
        → queued analytics job
        → HTTP 302 destination redirect
```

## Project structure

```text
httpdocs/backend/app/Http/Controllers/Api/V1/  API controllers
httpdocs/backend/app/Services/                   QR, billing, storage, analytics
httpdocs/backend/routes/                         web and API route registration
httpdocs/frontend/app/                           Nuxt pages and components
httpdocs/frontend/server/api/                    BFF and renderer endpoints
httpdocs/qr-renderer/                            Node rendering service
```

New backend capabilities should preserve the dependency direction `Controllers → Services → Models/Repositories`.

## Frontend helper conventions

Reusable browser and data helpers live in `httpdocs/frontend/app/utils/helpers.ts`. Use these helpers for local/session storage access, safe JSON serialization and parsing, array conversion, and runtime type checks instead of repeating those low-level operations in components or composables.

- Storage helpers are safe to call from shared Nuxt code: on the server or when browser storage is blocked they return `null`/`false` instead of throwing. Callers should handle failure when the user depends on the value being saved.
- Treat browser storage as untrusted input. Parse persisted JSON with an explicit type guard; the QR draft and template guards are in `app/utils/qr-validation.ts`.
- Store only non-authentication state in browser storage. Never put Passport access/refresh tokens, session cookies, or server secrets there.
- `arrayFrom` and `isArray` centralize array conversion and checking. Keep ordinary operations such as `map`, `filter`, and `find` native unless a reusable helper adds meaningful validation or fallback behavior.
- Nitro handlers must not use browser storage helpers. Keep straightforward server operations such as `FormData` lookup native unless a server-safe helper provides real reuse.
- `nuxt.config.ts` intentionally keeps a small guarded `localStorage` read in its inline theme bootstrap. It runs before the Nuxt app bundle so the saved theme can be applied before rendering and avoid a flash; app utility modules cannot be imported there.

## See Also

- [API Reference](api.md) — HTTP contracts
- [Authentication](authentication.md) — OAuth and BFF flow
- [QR Codes and Storage](qr-codes.md) — rendering and persistence
