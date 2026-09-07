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

## Laravel API and Nuxt authentication

The backend uses Laravel Passport as the `api` guard. Passport signs the access token with its private key; the frontend sends it as an OAuth2-compatible Bearer token. A separate JWT package is not needed for this setup.

The Nuxt browser is registered as a public Passport client with Authorization Code + PKCE. It has a client ID but no client secret. The PKCE verifier is kept in `sessionStorage` only until the callback; access and refresh tokens stay in memory and are never persisted by Pinia.

The shop is guest-first: public catalog, cart, and informational pages must not use `auth` middleware. Only account-specific operations should call the protected endpoint.

Available endpoints:

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `GET` | `/api/auth/me` | Bearer | Return the current user |
| `POST` | `/api/auth/logout` | Bearer | Revoke the current token |

OAuth endpoints are provided by Passport:

- `GET /oauth/authorize` — starts the authorization flow;
- `POST /oauth/token` — exchanges the authorization code or refresh token.

Nuxt calls these endpoints through `app/composables/useApi.ts` and keeps the access token in runtime memory. Pinia persistence stores only the user profile, not the token. This is intentional: a browser token in `localStorage` or persisted Pinia state is easier to steal through XSS.

Login is opt-in. `/login` starts the OAuth flow, Laravel displays the login form, and successful authorization returns the browser to `/auth/callback`. If the user cancels or does not log in, they remain a guest and can continue using public pages.

For local development, set `NUXT_PUBLIC_API_BASE` (default: `http://dev.api.dev-nuxt.com.ua`), `NUXT_PUBLIC_OAUTH_CLIENT_ID`, and `NUXT_PUBLIC_OAUTH_REDIRECT_URI`; keep Laravel CORS origins aligned with the frontend origin. Production must use HTTPS and a separately registered redirect URI.

## See Also

- [Getting Started](getting-started.md) — start commands
- [Deployment](deployment.md) — environment separation
