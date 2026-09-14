[← Architecture](architecture.md) · [Back to README](../README.md) · [Authentication →](authentication.md)

# API Reference

## Base URLs

Browser code calls the Nuxt BFF:

```text
http://dev.qr-code.com/api/bff
```

The BFF calls Laravel internally. Direct Laravel API access is intended for trusted internal callers, not normal browser code.

The complete machine-readable contract is [openapi.yaml](openapi.yaml).

## Authentication

Protected Laravel routes require:

```http
Authorization: Bearer <passport-access-token>
```

The browser does not handle this header directly. Nuxt stores Passport tokens in HttpOnly cookies and attaches the access token server-side.

All `/api/v1/*` routes also require the internal `X-Baboons-BFF-Secret` header.

## Endpoint summary

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/register` | BFF | Register a user |
| POST | `/api/v1/auth/session` | BFF | Legacy session bootstrap |
| DELETE | `/api/v1/auth/session` | BFF | Clear Laravel web session |
| POST | `/api/v1/auth/forgot-password` | BFF | Request password reset |
| POST | `/api/v1/auth/reset-password` | BFF | Reset password |
| GET | `/api/v1/auth/user` | Bearer + BFF | Current user |
| DELETE | `/api/v1/auth/token` | Bearer + BFF | Revoke current token |
| GET | `/api/v1/dashboard` | Bearer + BFF | Dashboard summary |
| GET/POST/GET/PUT/PATCH/DELETE | `/api/v1/qr-codes` | Bearer + BFF | QR library and CRUD |
| GET | `/api/v1/qr-codes/{qrCode}/analytics` | Bearer + BFF | Scan analytics |
| POST | `/api/v1/qr-codes/{qrCode}/template` | Bearer + BFF | Save QR as template |
| GET/POST/PUT/PATCH/DELETE | `/api/v1/folders` | Bearer + BFF | QR folders |
| GET/POST/PUT/PATCH/DELETE | `/api/v1/templates` | Bearer + BFF | QR templates |
| GET/PATCH | `/api/v1/notifications` | Bearer + BFF | Notifications |
| PUT/PATCH | `/api/v1/profile` | Bearer + BFF | Update profile |
| GET | `/api/v1/billing/plans` | BFF | Public plan list |
| POST | `/api/v1/billing/checkout` | Bearer + BFF | Demo checkout |
| GET | `/api/v1/billing/subscription` | Bearer + BFF | Current subscription |
| POST | `/api/v1/assets/logo` | Bearer + BFF | Authenticated logo upload |
| POST | `/api/v1/guest-assets/logo` | BFF | Guest logo upload |

## Response conventions

- Collections and single resources are normally returned in a `data` member.
- Validation failures use HTTP `422`.
- Unauthenticated requests use HTTP `401`.
- Unauthorized or hidden resources use HTTP `404`.
- Successful deletes commonly return HTTP `204`.

Example:

```json
{
  "data": {
    "id": "uuid",
    "name": "Campaign QR",
    "mode": "dynamic"
  }
}
```

## Laravel Passport endpoints

Passport owns these endpoints:

- `GET /oauth/authorize`
- `POST /oauth/token`

The Nuxt server calls `/oauth/token); browser UI uses the authorization endpoint only as a navigation target.

## See Also

- [Authentication](authentication.md) — token lifecycle
- [QR Codes and Storage](qr-codes.md) — QR payloads and files
- [OpenAPI](openapi.yaml) — machine-readable contract