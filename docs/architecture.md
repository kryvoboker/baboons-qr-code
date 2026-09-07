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

## See Also

- [API Reference](api.md) — HTTP contracts
- [Authentication](authentication.md) — OAuth and BFF flow
- [QR Codes and Storage](qr-codes.md) — rendering and persistence

