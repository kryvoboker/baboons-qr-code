[Back to README](../README.md) · [Architecture →](architecture.md)

# Getting Started

## Prerequisites

- Docker Engine with Docker Compose.
- GNU Make.
- External Docker networks used by the Compose file: `traefik-network` and `qr-code-net`.
- Local development environment files in `.docker/dev/env/`.

The application runs PHP, Composer, PostgreSQL, Redis, Nuxt, Nginx, and the QR renderer in containers.

## Start the stack

```bash
make up-dev
docker compose -f .docker/dev/docker-compose.yml ps
```

If the Make target is unavailable, use:

```bash
docker compose -f .docker/dev/docker-compose.yml up -d
```

## Verify Laravel and Nuxt

```bash
docker compose -f .docker/dev/docker-compose.yml exec -T qr-code-php-fpm php artisan about
docker compose -f .docker/dev/docker-compose.yml exec -T qr-code-php-fpm php artisan route:list
docker compose -f .docker/dev/docker-compose.yml exec -T qr-code-nodejs npm run ts:typecheck
```

The dev hosts are configured by Traefik labels:

- Frontend: `http://dev.qr-code.com`
- Laravel: `http://dev.api.qr-code.com`

## First workflow

1. Open the frontend.
2. Generate a static QR without signing in.
3. Use **Log in** when an account feature is needed.
4. Complete the Laravel Passport login.
5. Save a QR code or open the dashboard.

## Stop the stack

```bash
make down-dev
```

## See Also

- [Architecture](architecture.md) — service boundaries and data flow
- [Configuration](configuration.md) — environment variables
- [Testing](testing.md) — verification commands