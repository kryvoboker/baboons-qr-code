# Baboons QR-code

> Create free static QR codes and manage trackable dynamic QR codes.

Baboons QR-code is a QR-code SaaS application for websites, text, Wi-Fi, contacts, messaging, files and campaigns. Static codes can be generated without an account; registered users can save QR codes, use templates and create dynamic codes with redirect and analytics features.

The repository is a Docker-based monorepo containing a Laravel API/backend, a Nuxt frontend with a server-side BFF (Backend-for-Frontend), and a dedicated QR renderer.

## Quick start

Prerequisites: Docker Compose, GNU Make, and the external Docker networks used by the project.

```bash
make up-dev
docker compose -f .docker/dev/docker-compose.yml exec -T dev-nuxt-php-fpm php artisan about
```

Open the frontend through the host configured by the Traefik labels. The default development hosts are documented in [Getting Started](docs/getting-started.md).

## Why this project

- Generate static QR codes for free, including custom designs and supported content types.
- Create dynamic QR codes whose destination can change after printing.
- Store QR images and user assets in shared Laravel storage.
- Keep Passport access and refresh tokens in HttpOnly cookies managed by the Nuxt BFF.
- Render previews and saved images through a separate Node QR renderer.

## Example workflow

1. Open the Nuxt homepage and choose a QR content type.
2. Select static mode for a free code or sign in to use account features.
3. Preview, download, or save the generated QR code.
4. For a dynamic code, change its destination later and inspect scan analytics.

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/getting-started.md) | Install, start, and verify the stack |
| [Architecture](docs/architecture.md) | Services, boundaries, and data flow |
| [API Reference](docs/api.md) | Laravel API endpoints and payloads |
| [Authentication](docs/authentication.md) | Passport OAuth2 Authorization Code + PKCE |
| [QR Codes and Storage](docs/qr-codes.md) | QR generation, renderer, redirects, and files |
| [Configuration](docs/configuration.md) | Docker and environment settings |
| [Deployment](docs/deployment.md) | Production topology and checklist |
| [Testing](docs/testing.md) | Backend, frontend, and browser verification |
| [OpenAPI](docs/openapi.yaml) | OpenAPI 3.1 API specification |

## License

MIT, unless a different license is added by the project owners.
