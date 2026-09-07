[← Authentication](authentication.md) · [Back to README](../README.md) · [Configuration →](configuration.md)

# QR Codes and Storage

## Supported content

The generator supports URL, plain text, Wi-Fi, vCard, email, phone, SMS, WhatsApp, Telegram, location, calendar event, and file/PDF URL payloads.

Dynamic mode is intended for URL-like content: URL, file/PDF URL, WhatsApp, and Telegram.

## Static QR generation

Static content is encoded into the QR image permanently:

```text
Nuxt generator → renderer preview/download → optional Laravel save
```

Static generation is available to guests. Saving a code requires an account.

## Dynamic QR generation

A dynamic QR stores a stable slug and redirects through Laravel:

```text
GET /r/{slug}
  → check active code and subscription
  → queue scan metadata
  → redirect to destination_url
```

The analytics job stores privacy-preserving metadata. Raw IP addresses are not stored; a keyed hash is used instead. Country enrichment is not configured in the starter and remains nullable.

## Renderer

The QR renderer is a separate Node service. Its endpoints are:

- `GET /health`
- `POST /v1/render`
- `POST /v1/render-and-save`

Renderer requests require `X-Baboons-Renderer-Secret`. The browser does not receive this secret.

## Storage

Laravel uses the shared storage path configured by `NEW_STORAGE_PATH`. Public images are served from the public storage disk.

Authenticated user assets use a deterministic hash-based storage key:

```text
images/qr-code/{storageKey}/{year}/{month}/{uuid}.{extension}
```

The key is derived from the normalized email address. Guest uploads use a hash of a guest session key. Raw email addresses are not used as directory names.

Accepted logo formats are PNG, JPEG, and WebP, with a maximum size of 2 MB. SVG uploads are rejected by default.

## See Also

- [Architecture](architecture.md) — renderer and storage boundaries
- [API Reference](api.md) — asset and QR endpoints
- [Deployment](deployment.md) — shared storage requirements

