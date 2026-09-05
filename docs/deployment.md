[← Configuration](configuration.md) · [Back to README](../README.md) · [Testing →](testing.md)

# Deployment

## Current runtime model

The checked-in Docker configuration is a development stack. It uses bind mounts, local environment files, debug tooling, and exposed development ports. Treat it as a reference for local development, not as a production hardening profile.

## Service topology

- Nginx receives backend traffic and forwards PHP requests to `dev-nuxt-php-fpm`.
- Nuxt runs separately in `dev-nuxt-nodejs` on port `3000`.
- MariaDB and Redis are persistent services with health checks.
- Cron runs scheduled Laravel commands when a crontab entry is enabled.
- Traefik labels publish the backend and frontend through development hostnames.

## Production checklist

- Use a production Compose/hosting configuration with immutable images and no source bind mounts.
- Inject secrets through the deployment platform, not committed `.env` files.
- Disable debug tools such as Xdebug and XHProf unless explicitly required.
- Restrict database and Redis network exposure.
- Configure TLS at the edge and review forwarded-header trust ranges.
- Run migrations deliberately and verify backups, logs, health checks, and queue workers.

## See Also

- [Configuration](configuration.md) — current development settings
- [Testing](testing.md) — pre-deployment checks

