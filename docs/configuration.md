[← Architecture](architecture.md) · [Back to README](../README.md) · [Deployment →](deployment.md)

# Configuration

## Docker Compose

The development stack is defined in `.docker/dev/docker-compose.yml`. It loads common settings from `.docker/dev/env/.env` and database settings from `.docker/dev/env/.env.mariadb`.

| Service | Purpose | Host exposure |
|---------|---------|---------------|
| `dev-nuxt-php-fpm` | Laravel PHP runtime | Internal port 9000 |
| `dev-nuxt-nginx` | HTTP entrypoint | Via Traefik |
| `dev-nuxt-nodejs` | Nuxt development server | `3000` |
| `dev-nuxt-mariadb` | Relational database | `3351 → 3306` |
| `dev-nuxt-redis` | Cache/queue backend | `42607 → 6379` |
| `dev-nuxt-cron` | Scheduled Laravel commands | Internal |

## Environment variables

Do not copy credentials into documentation or commit them to source control.

| Variable | Source | Purpose |
|----------|--------|---------|
| `APP_ENV` | `.docker/dev/env/.env` | Laravel environment, currently local |
| `NEW_STORAGE_PATH` | `.docker/dev/env/.env` | Mounted application storage path |
| `COMMON_DB_HOSTNAME` | `.env.mariadb` | MariaDB service name on the Docker network |
| `COMMON_DB_PORT` | `.env.mariadb` | MariaDB container port |
| `COMMON_DB_PREFIX` | `.env.mariadb` | Shared database table prefix |
| `MARIADB_DATABASE` | `.env.mariadb` | Development database name |
| `MARIADB_USER` | `.env.mariadb` | Development database user |
| `MARIADB_PASSWORD` | `.env.mariadb` | Development database password; keep secret |
| `MARIADB_ROOT_PASSWORD` | `.env.mariadb` | MariaDB root password; keep secret |

PHP settings, including Xdebug and XHProf, are mounted from `.docker/dev/php/php.ini`. Nginx routing, security headers, FastCGI timeouts, and upload limits are in `.docker/dev/nginx/nginx.conf`.

## See Also

- [Getting Started](getting-started.md) — start commands
- [Deployment](deployment.md) — environment separation

