[← Deployment](deployment.md) · [Back to README](../README.md) · [OpenAPI →](openapi.yaml)

# Testing

## Backend

```bash
docker compose -f .docker/dev/docker-compose.yml exec -T qr-code-php-fpm php artisan test --compact
docker compose -f .docker/dev/docker-compose.yml exec -T qr-code-php-fpm vendor/bin/pint --format agent
```

## Frontend

```bash
docker compose -f .docker/dev/docker-compose.yml exec -T qr-code-nodejs npm run test:helpers
docker compose -f .docker/dev/docker-compose.yml exec -T qr-code-nodejs npm run ts:typecheck
docker compose -f .docker/dev/docker-compose.yml exec -T qr-code-nodejs npm run ts:check
```

`test:helpers` type-checks and runs the built-in Node tests for browser storage helpers, safe JSON handling, persisted QR value validation, array helpers, and internal return-path validation. It uses Node's built-in test/assert APIs and does not add a test dependency.

For the QR-rendering browser E2E check, first start the development Compose stack, then run this from `httpdocs/frontend` on the host:

```bash
npm run test:e2e
```

The E2E test uses Playwright with the installed system Chrome (`/usr/bin/google-chrome` by default), loads the Nuxt app at `http://127.0.0.1:3000`, and checks that `/api/renderer/preview` returns SVG `200`, the preview image loads, and the page emits no console or uncaught JavaScript errors. Override `CHROME_BIN` or `PLAYWRIGHT_BASE_URL` when the browser executable or app URL differs.

`ts:typecheck` runs the Nuxt TypeScript checks. `ts:check` also runs Biome and can report formatting/lint issues.

## API smoke checks

```bash
docker compose -f .docker/dev/docker-compose.yml exec -T qr-code-php-fpm php artisan route:list --except-vendor --path=api
docker compose -f .docker/dev/docker-compose.yml exec -T qr-code-php-fpm php artisan passport:keys
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
