[Back to README](../README.md) · [Architecture →](architecture.md)

# Getting Started

## Prerequisites

- Docker Engine and Docker Compose.
- GNU Make.
- Access to the external Docker networks `traefik-network` and `dev-nuxt-net`.

PHP 8.5.10 and Composer 2.9.2 are available in the `dev-nuxt-php-fpm` container; a host PHP installation is not required.

## Start the development stack

```bash
make up-dev
```

The command starts PHP-FPM, Nginx, Node.js, MariaDB, Redis, and the cron container from `.docker/dev/docker-compose.yml`.

## Install or refresh dependencies

```bash
docker exec dev-nuxt-php-fpm composer install
docker exec dev-nuxt-nodejs npm install
```

The mounted application directories are `httpdocs/backend` and `httpdocs/frontend`, so dependency changes are visible on the host.

## Verify the installation

```bash
docker ps
docker exec dev-nuxt-php-fpm php artisan about
docker exec dev-nuxt-php-fpm php artisan route:list
```

MariaDB and Redis should report healthy status in Docker. The backend currently exposes the Laravel root route; application hosts are defined by the Traefik labels in the Compose file.

## Stop the stack

```bash
make down-dev
```

## See Also

- [Configuration](configuration.md) — environment files and service settings
- [Testing](testing.md) — verification commands

