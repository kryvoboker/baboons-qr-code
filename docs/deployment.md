[← Configuration](configuration.md) · [Back to README](../README.md) · [Testing →](testing.md)

# Deployment

## Current status

The checked-in Compose configuration is for development. It uses bind mounts, local env files, debug tooling, and development hostnames. It is not a production image strategy.

## Production topology

Use separate application origins or sibling subdomains:

```text
app.example.com  → Nuxt
api.example.com  → Laravel
q.example.com    → Laravel dynamic redirects
cdn.example.com  → object storage or shared media
```

The Nuxt BFF should reach Laravel over a private network. The browser should not receive internal service URLs or secrets.

## Checklist

- Build immutable PHP, Nuxt, and renderer images.
- Remove source bind mounts and development ports.
- Inject secrets through the deployment platform.
- Use HTTPS and `NUXT_AUTH_COOKIE_SECURE=true`.
- Register exact OAuth redirect URIs.
- Use S3-compatible or network-shared storage for multiple hosts.
- Restrict PostgreSQL, Redis, renderer, and internal BFF access.
- Disable debugbar, Xdebug, and XHProf in production.
- Run migrations deliberately and verify queues, cron, logs, backups, and health checks.
- Configure a real payment provider and signed webhooks before charging users.

## See Also

- [Configuration](configuration.md) — environment variables
- [Authentication](authentication.md) — production auth constraints
- [Testing](testing.md) — release verification

