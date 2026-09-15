[← API Reference](api.md) · [Back to README](../README.md) · [QR Codes and Storage →](qr-codes.md)

# Authentication

## Design

The application uses Laravel Passport with OAuth2 Authorization Code + PKCE. The Nuxt app is a public OAuth client, so it has a client ID but no client secret.

The browser receives only HttpOnly cookies:

- `bqr_access_token` — short-lived access token;
- `bqr_refresh_token` — refresh token, scoped to `/api`;
- temporary PKCE verifier/state cookies — scoped to `/api/auth` and removed after callback.

## Login flow

```text
Nuxt /auth/login
  → Nuxt GET /api/auth/start
  → set PKCE verifier and state cookies
  → Laravel /oauth/authorize
  → Laravel /login creates the Laravel web session
  → Laravel returns authorization code to Nuxt /auth/callback
  → Nuxt server validates state and exchanges code + verifier
  → Nuxt sets HttpOnly access/refresh cookies
  → BFF calls Laravel with Bearer token
```

The password is entered on Laravel's login page because that is where Passport's authorization server owns the web session.

The Passport client used by Nuxt must be a public Authorization Code client: it has no client secret, supports PKCE, and its registered redirect URI must exactly match `NUXT_PUBLIC_PASSPORT_REDIRECT_URI` (including scheme, host, path, and trailing slash). Keep the client ID public; never add a client secret to Nuxt runtime config.

Registration is sent through the Nuxt BFF to `POST /api/v1/auth/register`. Laravel requires a name, a valid unique email, and a password of at least 10 characters with a matching confirmation. Validation failures return HTTP `422`; Nuxt forwards only the `name`, `email`, and `password` field messages to the form. Other backend failures are replaced with a generic service-unavailable response so internal exception details are not returned to the browser.

## Email verification

`App\Models\User` implements Laravel's `MustVerifyEmail` contract. After creating a user, the registration endpoint dispatches Laravel's `Registered` event, which sends the built-in verification notification. The users table already has `email_verified_at`.

The verification URL is signed, expires, and requires the user to authenticate in Laravel's web session before it is fulfilled. If the session has expired, Laravel sends the browser to its login form and returns to the same signed verification URL after successful login. The login redirect allowlist permits only the OAuth authorization route and the exact email-verification URL shape. A successful verification returns to Nuxt's `/auth/verify-email?verified=1` page. Protected API routes also apply Laravel's `verified` middleware; unverified users receive HTTP `403` rather than account data.

In development, when `MAIL_MAILER=log`, Laravel writes the complete verification message and its one-time signed URL to the configured application log (normally `storage/logs/laravel.log`, resolved under the runtime storage path). Treat that log as sensitive: do not paste the message or URL into tickets, chat, or committed files. Use a real mail transport in production.

## Refresh and page navigation

Nuxt route middleware calls `/api/bff/v1/auth/user` for protected pages. The BFF:

1. reads the HttpOnly access cookie;
2. sends the token to Laravel;
3. if Laravel returns `401`, exchanges the refresh token;
4. stores replacement cookies;
5. retries the original request.

Therefore normal Nuxt navigation and a full page refresh preserve authorization while the refresh token remains valid.

## Guest users

The storefront is guest-first:

- static QR generation and public pages do not require authentication;
- account pages use the `auth` route middleware;
- unauthenticated access redirects to `/auth/login`;
- users may cancel login and continue using public functionality.

## Logout

The Nuxt logout endpoint revokes the current Passport access/refresh token when possible and always deletes the browser's access and refresh token cookies. It does not attempt to clear Laravel's separate authorization-server web session through an internal server-to-server call: that call does not carry the browser's Laravel session and cannot invalidate it. A later authorization may reuse the Laravel sign-in session, while the Nuxt app remains logged out until a new OAuth authorization flow completes.

## Security requirements

- Use HTTPS in production.
- Set `NUXT_AUTH_COOKIE_SECURE=true`.
- Keep `BFF_SHARED_SECRET` and `NUXT_BFF_SHARED_SECRET` out of git.
- Register exact redirect URIs for each environment.
- Require verified email for protected API access and keep the signed verification URL private.
- Do not place access or refresh tokens in localStorage, Pinia persistence, or Vue state.
- Use sibling frontend/API domains or redesign the login bootstrap before deploying to unrelated domains.

## See Also

- [API Reference](api.md) — protected endpoint list
- [Configuration](configuration.md) — auth environment variables
- [Deployment](deployment.md) — production security checklist
