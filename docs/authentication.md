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

The Nuxt logout endpoint attempts to revoke the Passport token, clears the Laravel web session, and deletes both browser token cookies.

## Security requirements

- Use HTTPS in production.
- Set `NUXT_AUTH_COOKIE_SECURE=true`.
- Keep `BFF_SHARED_SECRET` and `NUXT_BFF_SHARED_SECRET` out of git.
- Register exact redirect URIs for each environment.
- Do not place access or refresh tokens in localStorage, Pinia persistence, or Vue state.
- Use sibling frontend/API domains or redesign the login bootstrap before deploying to unrelated domains.

## See Also

- [API Reference](api.md) — protected endpoint list
- [Configuration](configuration.md) — auth environment variables
- [Deployment](deployment.md) — production security checklist

