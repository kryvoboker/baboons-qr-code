[← QR Codes and Storage](qr-codes.md) · [Back to README](../README.md) · [Deployment →](deployment.md)

# Configuration

## Docker services

The development Compose file is `.docker/dev/docker-compose.yml`.

| Service | Role |
|---|---|
| `qr-code-php-fpm` | Laravel PHP runtime |
| `qr-code-nginx` | Laravel HTTP entrypoint |
| `qr-code-nodejs` | Nuxt development server and BFF |
| `qr-code-postgresql` | PostgreSQL database |
| `qr-code-redis` | Redis service |
| `qr-code-cron` | Scheduled Laravel commands |

## Important variables

Never commit actual values from local env files.

| Variable | Consumer | Purpose |
|---|---|---|
| `APP_URL` | Laravel | API and dynamic redirect base URL |
| `API_PUBLIC_URL` | Laravel | Public API origin used when generating signed email-verification links; defaults to `NUXT_PUBLIC_BACKEND_BASE`, then `APP_URL` |
| `FRONTEND_URL` | Laravel | Nuxt origin used in reset links and OAuth |
| `NEW_STORAGE_PATH` | Laravel | Mounted Laravel storage path |
| `DB_CONNECTION` | Laravel | `pgsql` in current dev stack |
| `POSTGRES_DB` | PHP/PostgreSQL | Database name |
| `POSTGRES_SIMPLE_USER` | PHP/PostgreSQL | Application database user |
| `POSTGRES_SIMPLE_PASSWORD` | PHP/PostgreSQL | Application database password |
| `BFF_SHARED_SECRET` | Laravel | Validates trusted Nuxt-to-Laravel requests |
| `NUXT_BFF_SHARED_SECRET` | Nuxt | Sends the same BFF secret internally |
| `NUXT_PUBLIC_PASSPORT_CLIENT_ID` | Nuxt | Public Passport client UUID |
| `NUXT_PUBLIC_PASSPORT_REDIRECT_URI` | Nuxt | Exact OAuth callback URI |
| `NUXT_BACKEND_INTERNAL_BASE` | Nuxt | Internal Laravel URL, usually `http://qr-code-nginx` |
| `NUXT_PUBLIC_BACKEND_BASE` | Browser/Nuxt | Public Laravel URL used for OAuth navigation |
| `NUXT_AUTH_COOKIE_SECURE` | Nuxt | Set `true` when using HTTPS |
| `QR_RENDERER_SHARED_SECRET` | Laravel/renderer | Authenticates renderer requests |
| `NUXT_QR_RENDERER_SHARED_SECRET` | Nuxt/renderer | Authenticates Nuxt renderer requests |

## Laravel configuration

- `config/auth.php` maps the `api` guard to Passport.
- `config/baboons.php` contains frontend, storage, renderer, billing, and BFF settings.
- `config/session.php` controls Laravel's authorization web session.
- `config/cors.php` controls direct browser cross-origin requests.
- `bootstrap/app.php` registers API JSON behavior and the `bff.secret` middleware.

## Nuxt configuration

- `runtimeConfig` separates server-only internal URLs/secrets from public OAuth values.
- `routeRules` disables SSR for authenticated application screens.
- `server/api/bff/[...path].ts` is the Laravel proxy boundary.
- `app/middleware/auth.ts` protects account pages.

## See Also

- [Authentication](authentication.md) — OAuth variables and cookies
- [Getting Started](getting-started.md) — starting Docker
- [Deployment](deployment.md) — production configuration
