# Nuxt Laravel Application

> A Docker-powered Laravel backend and Nuxt frontend monorepo.

This project combines a Laravel 13 backend with a Nuxt 4 frontend. The development environment runs PHP-FPM, Nginx, Node.js, MariaDB, Redis, and scheduled-job infrastructure as Docker services.

## Quick Start

Prerequisites: Docker Engine with Compose and GNU Make.

```bash
make up-dev
```

The backend is served through the configured Traefik host and the Nuxt development server is available on port `3000`. See [Getting Started](docs/getting-started.md) for environment and verification details.

## Key Features

- Laravel 13 backend with PHP 8.5 and Composer.
- Nuxt 4/Vue 3 frontend with TypeScript.
- MariaDB persistence and Redis cache/queue support.
- Reproducible development containers with health checks.
- PHPUnit, Pint, and Laravel Boost tooling.

## Example

```bash
# Start the complete development stack
make up-dev

# Inspect backend routes inside the PHP container
docker exec dev-nuxt-php-fpm php artisan route:list
```

---

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/getting-started.md) | Install, start, and verify the stack |
| [Architecture](docs/architecture.md) | Monorepo structure and module boundaries |
| [Configuration](docs/configuration.md) | Docker, environment, and service settings |
| [Deployment](docs/deployment.md) | Runtime topology and deployment considerations |
| [Testing](docs/testing.md) | Backend and frontend verification commands |

## License

MIT (the Laravel application skeleton license).
