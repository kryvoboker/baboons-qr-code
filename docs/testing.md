[← Deployment](deployment.md) · [Back to README](../README.md) · [OpenAPI →](openapi.yaml)

# Testing

## Backend

```bash
docker compose -f .docker/dev/docker-compose.yml exec -T dev-nuxt-php-fpm php artisan test --compact
docker compose -f .docker/dev/docker-compose.yml exec -T dev-nuxt-php-fpm vendor/bin/pint --format agent
```

## Frontend

```bash
docker compose -f .docker/dev/docker-compose.yml exec -T dev-nuxt-nodejs npm run ts:typecheck
docker compose -f .docker/dev/docker-compose.yml exec -T dev-nuxt-nodejs npm run ts:check
```

`ts:typecheck` runs TypeScript only. `ts:check` also runs Biome and can report formatting/lint issues.

## API smoke checks

```bash
docker compose -f .docker/dev/docker-compose.yml exec -T dev-nuxt-php-fpm php artisan route:list --except-vendor --path=api
docker compose -f .docker/dev/docker-compose.yml exec -T dev-nuxt-php-fpm php artisan passport:keys
```

Use Chrome DevTools for browser checks:

1. Open a public page and confirm no failed requests.
2. Open pricing and expect `/api/bff/v1/billing/plans` with HTTP `200`.
3. Open a protected page while logged out and expect a redirect to `/auth/login`.
4. Complete Passport login and confirm `/api/bff/v1/auth/user` returns `200`.
5. Reload the protected page and confirm the user remains logged in.

## OpenAPI validation

Use an OpenAPI 3.1-compatible validator in CI or an API client. Keep `docs/openapi.yaml` synchronized with `httpdocs/backend/routes/api.php`.

## See Also

- [Getting Started](getting-started.md) — local verification
- [API Reference](api.md) — endpoint behavior
- [OpenAPI](openapi.yaml) — machine-readable schema

