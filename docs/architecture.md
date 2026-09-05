[← Getting Started](getting-started.md) · [Back to README](../README.md) · [Configuration →](configuration.md)

# Architecture

## System shape

```text
Browser → Traefik → Nginx → PHP-FPM → Laravel → MariaDB / Redis
Browser → Traefik → Nuxt dev server
                                             ↑
                              shared development Docker network
```

The repository is a monorepo, but backend and frontend are separate applications. Docker Compose supplies the local process topology. The backend currently follows Laravel's conventional directories; new business capabilities should be added as feature-oriented modules as the domain grows.

## Main boundaries

| Area | Location | Responsibility |
|------|----------|----------------|
| Backend | `httpdocs/backend/` | HTTP application, persistence, jobs, and backend resources |
| Frontend | `httpdocs/frontend/` | Nuxt/Vue UI and client-side API integration |
| Runtime | `.docker/dev/` | Images, Compose services, and service configuration |
| Runtime data | `storage/`, `.db/` | Mounted Laravel and database data |

## Backend module rule

New modules should keep the dependency direction `Controllers → Services → Repositories/Models`. Controllers translate transport concerns, services orchestrate use cases, and repositories isolate persistence. Cross-module calls use documented public APIs rather than internal classes.

The complete decision and examples are maintained in [.ai-factory/ARCHITECTURE.md](../.ai-factory/ARCHITECTURE.md).

## See Also

- [Configuration](configuration.md) — container topology
- [Deployment](deployment.md) — runtime considerations

