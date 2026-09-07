# Baboons QR-code

Starter architecture and responsive UI for a QR-code SaaS built with **Laravel 13**, **Nuxt 4 + TypeScript**, **PostgreSQL**, **Redis**, and a separate **qr-code-styling renderer**.

The repository is intentionally split into independently deployable application parts while keeping a shared media layout for local development.

> This is a production-oriented starter, not a finished payment product. QR creation, dynamic redirects, analytics ingestion, templates, folders, profile settings, Passport authentication flow, subscription state checks and notifications are wired. A real payment provider and GeoIP provider are deliberately left behind interfaces because neither provider was specified.

---

## 1. Project layout

```text
Baboons-QR-code/
├── .docker/
│   └── dev/
│       ├── docker-compose.yml
│       ├── docker/
│       │   ├── backend/Dockerfile
│       │   ├── frontend/Dockerfile
│       │   └── qr-renderer/Dockerfile
│       ├── env/
│       │   ├── backend.env
│       │   ├── backend.secret.env.example
│       │   ├── frontend.env
│       │   ├── frontend.secret.env.example
│       │   ├── qr-renderer.env
│       │   ├── qr-renderer.secret.env.example
│       │   ├── database.env
│       │   └── database.secret.env.example
│       └── nginx/storage.conf
├── httpdocs/
│   ├── backend/                 # Laravel 13 API + Passport
│   ├── frontend/                # Nuxt 4 + TypeScript UI/BFF
│   ├── qr-renderer/             # Node service with qr-code-styling
│   └── storage/                 # Shared Laravel/media storage
└── README.md
```

Laravel is configured to use `httpdocs/storage` instead of `httpdocs/backend/storage`.

**Security boundary:** only Laravel containers mount the full storage tree. Nuxt and the renderer receive only `storage/app/public`, so Passport private keys, logs, sessions and framework cache are not exposed to Node containers.

Inside Docker that same directory is mounted as:

- Laravel: `/var/www/storage`
- Nuxt: only `/shared/storage/app/public`
- QR renderer: only `/shared/storage/app/public`
- storage Nginx: `httpdocs/storage/app/public`

### Important if frontend/backend are on different physical servers

A Docker bind mount is shared only on the same Docker host. If `backend` and `frontend` are actually deployed on **different machines**, `httpdocs/storage` cannot be a local folder on both machines and still be coherent.

Use one of these in production:

1. S3-compatible object storage — preferred for horizontal scaling;
2. NFS / network filesystem;
3. another shared persistent volume supported by the infrastructure.

The current local `storage` container is a development implementation of that shared media origin.

---

## 2. Local services

Default development URLs:

| Service | URL / host |
|---|---|
| Nuxt frontend | `http://localhost:3000` |
| Laravel API | `http://localhost:8000` |
| Dynamic QR redirect | `http://localhost:8000/r/{slug}` |
| QR renderer | `http://localhost:3100` |
| Public media storage | `http://localhost:8082` |
| Mailpit UI | `http://localhost:8025` |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |

The QR renderer port is exposed for development diagnostics only. Do **not** expose it publicly in production.

---

## 3. Frontend pages

Nuxt pages are split into separate files and reusable components; the project does not place all markup in one page.

### Public

- `/` — landing page + complete QR generator
- `/pricing` — subscription plans from Laravel config/API
- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/callback` — Passport PKCE callback
- `/billing/thank-you`
- `/billing/failure`

### Authenticated

- `/dashboard` — real user summary, usage, recent QR codes and scan activity
- `/qr-codes` — QR library with live search, mode filter, folders and grid/list modes
- `/qr-codes/{id}` — edit QR, move folder, rename, redesign, update dynamic destination, analytics, download, save as template
- `/templates` — list, rename, delete and reuse saved QR designs
- `/settings/profile`
- `/settings/billing`
- `/notifications`
- `/billing/checkout`

### Search

Search is available in both desktop and mobile dashboard headers. The QR library performs debounced live search against Laravel by:

- QR name;
- short slug;
- dynamic destination URL.

The search implementation intentionally uses PostgreSQL `ILIKE`, so the current project assumes PostgreSQL.

---

## 4. UI principles

The interface is intentionally conservative and low-density:

- one primary action per major screen;
- advanced QR design controls are grouped after content;
- folders are optional and do not block QR creation;
- dynamic functionality is clearly separated from free static QR codes;
- QR mode is fixed after creation to avoid ambiguous `static -> dynamic` mutations after a code may already be printed;
- mobile search is always available;
- repeated image markup is encapsulated by `ResponsiveImage.vue`;
- no `base64` images are embedded in Vue markup.

### FlyonUI + Tailwind CSS 4

`httpdocs/frontend/app/assets/css/main.css` contains only Tailwind/FlyonUI/Iconify directives — no project-specific CSS rules.

FlyonUI is installed as the official Nuxt/Tailwind plugin and Tailwind is built through Vite. This is intentional: FlyonUI's Nuxt setup is package/plugin based, while Tailwind's browser CDN is intended for development/prototyping rather than a production Nuxt build.

The final Nuxt build still serves compiled CSS to the browser as linked assets; styles are not inlined into page components.

---

## 5. Theme behavior

Themes:

- system / automatic;
- light;
- black (dark).

Behavior:

1. If the user has never chosen a theme, no explicit `data-theme` is written and FlyonUI's preferred-dark behavior follows the OS.
2. If the user selects light or black, the choice is stored in `localStorage`.
3. A small pre-paint script in `nuxt.config.ts` applies the stored choice before Vue hydration to reduce theme flashing.
4. Selecting “System” removes the stored override.

---

## 6. QR content types

The generator creates actual payload formats rather than treating every option as a generic text string.

Supported starter types:

- URL
- plain text
- Wi-Fi (`WIFI:` payload)
- vCard
- email (`mailto:`)
- phone (`tel:`)
- SMS
- WhatsApp
- Telegram
- location (`geo:`)
- calendar event (`VEVENT`)
- file/PDF URL

Dynamic mode is currently offered only for web-address-like types where redirect indirection makes sense:

- URL
- file/PDF URL
- WhatsApp
- Telegram

Local payloads such as Wi-Fi and vCard remain static.

---

## 7. QR renderer architecture

`httpdocs/qr-renderer` is a dedicated Node service using `qr-code-styling`.

Endpoints:

```text
GET  /health
POST /v1/render
POST /v1/render-and-save
```

Both `/v1/*` endpoints require:

```text
X-Baboons-Renderer-Secret
```

Both Laravel and the Nuxt BFF know this secret; the browser does not.

### Why a separate renderer

It keeps Node/canvas dependencies out of PHP and allows both frontend preview/download and backend persisted images to use the same rendering implementation.

### SSRF protection

`qr-code-styling` can fetch a logo image. Accepting arbitrary remote logo URLs would make the renderer an SSRF surface.

The renderer therefore accepts QR logos only when the URL begins with the configured `STORAGE_PUBLIC_URL`, then rewrites that public URL to the internal storage-service URL.

Do not remove this restriction without replacing it with a hardened fetch/proxy policy.

---

## 8. Images and storage

User/generated media is stored under:

```text
httpdocs/storage/app/public/images/qr-code/{storageKey}/{Y}/{m}/
```

The requested user-specific folder structure is retained, but **raw e-mail addresses are not used as folder names**.

For an authenticated user:

```text
storageKey = sha256(lowercase(trim(email)))
```

For a guest:

```text
storageKey = guest-{sha256(sessionKey)}
```

Reasons:

- avoids exposing e-mail addresses in public media URLs;
- avoids filesystem/path normalization problems;
- gives a stable deterministic folder for an authenticated user;
- prevents the browser-selected filename from becoming a storage path.

### User logo uploads

Accepted:

- PNG
- JPEG
- WebP
- maximum 2 MB

User-supplied SVG is deliberately rejected in the starter. Arbitrary SVG is active content and should only be enabled after proper sanitization and serving-policy work.

### Built-in social logos

Starter local SVG assets exist for:

- X
- Telegram
- Viber
- YouTube
- Facebook
- Instagram
- WhatsApp

They are local files, not base64 blobs or remote images. Before commercial launch, replace/verify these starter glyph assets against the current official brand/trademark asset packs and usage rules.

---

## 9. Static and dynamic QR flow

### Static QR

```text
Nuxt generator
    -> renderer preview/download
    -> Laravel save (authorized user)
    -> renderer render-and-save
    -> shared storage
```

Static content is embedded permanently into the QR image.

### Dynamic QR

```text
Scanner
   -> GET /r/{slug} on Laravel
   -> Redis redirect cache
   -> verify QR is active
   -> verify owner has an active, non-expired subscription
   -> dispatch TrackQrScan job
   -> immediate HTTP 302 redirect

Queue worker
   -> hash IP with HMAC
   -> parse coarse device/browser/OS
   -> save qr_scans row
   -> update last_scanned_at
```

The redirect request does not synchronously wait for analytics persistence.

### Analytics privacy

Raw IP addresses are not stored by the starter. A keyed HMAC is saved instead.

`country` is currently `null`: a GeoIP provider/database was not specified. Add GeoIP enrichment inside the analytics job rather than slowing down the redirect request.

---

## 10. Laravel Passport authentication

The frontend and backend are separate applications. The project uses **Laravel Passport Authorization Code + PKCE**.

High-level flow:

```text
Browser
  -> Nuxt /api/auth/session
  -> Nuxt BFF forwards credentials + BFF secret to Laravel
  -> Laravel creates first-party web session
  -> Nuxt redirects browser to Laravel /oauth/authorize with PKCE challenge
  -> Laravel returns authorization code
  -> Nuxt /auth/callback validates state
  -> Nuxt server exchanges code + verifier at /oauth/token
  -> access/refresh tokens are stored in HttpOnly cookies
  -> browser calls Nuxt /api/bff/*
  -> Nuxt BFF attaches Bearer token to Laravel API
```

The access token is intentionally not stored in `localStorage`.

### Production domain requirement

The session-relay portion of this first-party flow assumes frontend and backend are on sibling domains sharing the same registrable parent, for example:

```text
app.example.com -> Nuxt
api.example.com -> Laravel
q.example.com   -> Laravel dynamic redirects
cdn.example.com -> shared/object storage
```

Recommended production session configuration:

```dotenv
SESSION_DOMAIN=.example.com
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
NUXT_AUTH_COOKIE_SECURE=true
```

If Nuxt and Laravel are hosted on completely unrelated domains, do not copy this cookie/session design unchanged. Rework the first-party login bootstrap so the Laravel authorization server owns its login interaction directly.

### BFF secret

Unauthenticated internal auth routes and guest upload routes are protected by `X-Baboons-BFF-Secret`. The browser never receives this value.

---

## 11. Passport initial setup

Passport migrations are not copied into the repository because the current Passport package owns the schema.

After dependencies are installed:

```bash
cd httpdocs/backend
php artisan vendor:publish --tag=passport-migrations
php artisan migrate
php artisan passport:keys
php artisan passport:client --public
```

Use this redirect URI for local development:

```text
http://localhost:3000/auth/callback
```

Copy the generated public client ID into:

```dotenv
NUXT_PUBLIC_PASSPORT_CLIENT_ID=...
```

Then restart the frontend container.

The custom Passport client model skips the approval screen for first-party clients. Do not extend that behavior to third-party OAuth clients.

---

## 12. Subscription model and notifications

The subscription layer is provider-agnostic through:

```text
App\Contracts\BillingGateway
```

The repository ships with:

```text
App\Services\Billing\DemoBillingGateway
```

The demo gateway activates a subscription immediately and redirects to the local thank-you page. **It does not charge money.**

### Production payment integration

A real provider implementation should:

1. implement `BillingGateway`;
2. create provider checkout / billing-portal sessions;
3. receive signed provider webhooks;
4. verify webhook signatures;
5. implement idempotency using provider event IDs;
6. update the local subscription through `SubscriptionEventService`;
7. treat webhooks — not the browser return URL — as payment truth.

### Scheduler

The Laravel scheduler runs:

```text
subscriptions:check    every 15 minutes
passport:purge         hourly
```

`subscriptions:check`:

- sends renewal warnings before `current_period_end`;
- detects failed-payment states;
- avoids repeating the same reminder through deduplication timestamps;
- marks cancelled subscriptions expired after the paid period;
- moves failed expired subscriptions to `past_due`.

The scheduler **does not initiate the recurring charge**. Charging belongs to the payment provider; the scheduler manages local lifecycle/notification safety checks.

Notification channels:

- database;
- email through Laravel queue.

Development email is visible in Mailpit.

---

## 13. Subscription plan placeholders

Starter plan values live in:

```text
httpdocs/backend/config/baboons.php
```

The current EUR prices and limits are product-design placeholders, not a pricing recommendation:

- Starter
- Creator
- Business

The frontend reads these plans from Laravel; it does not maintain a second hardcoded price source.

---

## 14. Docker development setup

From repository root:

```bash
cd .docker/dev

cp env/backend.secret.env.example env/backend.secret.env
cp env/frontend.secret.env.example env/frontend.secret.env
cp env/qr-renderer.secret.env.example env/qr-renderer.secret.env
cp env/database.secret.env.example env/database.secret.env
```

Generate secrets, for example:

```bash
openssl rand -hex 32
openssl rand -hex 32
printf 'base64:%s\n' "$(openssl rand -base64 32 | tr -d '\n')"
```

Use:

- one random value for `BFF_SHARED_SECRET` and the same value for `NUXT_BFF_SHARED_SECRET`;
- a different random value for `QR_RENDERER_SHARED_SECRET` and the same value for `NUXT_QR_RENDERER_SHARED_SECRET`;
- the same database password for `DB_PASSWORD` and `POSTGRES_PASSWORD`;
- generated Laravel key for `APP_KEY`.

Then:

```bash
docker compose build
docker compose up -d
```

Install/publish Passport once the backend container is healthy:

```bash
docker compose exec backend php artisan vendor:publish --tag=passport-migrations
docker compose exec backend php artisan migrate
docker compose exec backend php artisan passport:keys
docker compose exec backend php artisan passport:client --public
```

Update `env/frontend.env` with the generated Passport client ID and restart frontend:

```bash
docker compose restart frontend
```

Useful commands:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f qr-renderer
docker compose logs -f queue
docker compose logs -f scheduler
```

---

## 15. Frontend structure

Important reusable components:

```text
app/components/
├── ResponsiveImage.vue
├── AppHeader.vue
├── AppFooter.vue
├── DashboardSidebar.vue
├── DashboardTopbar.vue
├── GlobalQrSearch.vue
├── QrCard.vue
├── ThemeMenu.vue
└── QrGenerator/
    ├── GeneratorWorkspace.vue
    ├── TypePicker.vue
    ├── ContentPanel.vue
    ├── DesignPanel.vue
    └── PreviewCard.vue
```

QR payload construction is isolated in:

```text
app/utils/qr-content.ts
```

API DTO types are under:

```text
app/types/
```

Nuxt server routes form the BFF layer under:

```text
server/api/
server/utils/
```

Keep private environment variables in Nuxt `runtimeConfig`, never `runtimeConfig.public`.

---

## 16. Backend structure

Important domains:

```text
app/
├── Console/Commands/CheckSubscriptions.php
├── Contracts/BillingGateway.php
├── Http/Controllers/Api/V1/
├── Http/Middleware/
├── Jobs/TrackQrScan.php
├── Models/
├── Notifications/
├── Providers/AppServiceProvider.php
└── Services/
    ├── Analytics/
    ├── Billing/
    ├── Qr/
    └── Storage/
```

Do not move business rules into Nuxt. Entitlement checks, subscription state, storage ownership, QR ownership and dynamic redirect authorization belong to Laravel.

---

## 17. Quality tools — PHP

The supplied quality-tool examples were adapted to the new Laravel 13 project instead of copied blindly from the previous project structure.

Notable changes:

- obsolete module-specific Psalm excludes removed;
- PHPStan paths point at this project's app/routes/config/database/tests/Modules;
- PHPCS no longer excludes all tests while simultaneously declaring tests as an analysis path;
- supplied custom `ProjectStandard` is retained under `httpdocs/backend/phpcs/ProjectStandard`;
- production configs are stricter than local configs.

Commands from `httpdocs/backend`:

```bash
composer pint
composer phpcs
composer phpcs:fix
composer phpstan
composer phpstan:production
composer phpmd
composer psalm
composer psalm:production
composer quality
composer test
```

Equivalent scripts in `composer.json`:

```json
{
  "pint": "pint",
  "phpcs": "phpcs --standard=phpcs.xml --runtime-set ignore_warnings_on_exit 1 app routes config database tests Modules",
  "phpstan": "phpstan --configuration=phpstan.local.neon --memory-limit=1G analyse",
  "phpstan:production": "phpstan --configuration=phpstan.production.neon --memory-limit=1G analyse",
  "phpmd": "@php -d error_reporting=\"E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED\" vendor/bin/phpmd app,routes,config,database,tests,Modules text phpmd.xml --ignore-errors-on-exit --ignore-violations-on-exit",
  "phpcs:fix": "phpcbf --standard=phpcs.xml app routes config database tests Modules",
  "psalm": "php -d memory_limit=1G vendor/bin/psalm",
  "psalm:production": "php -d memory_limit=1G vendor/bin/psalm --config=psalm-production.xml"
}
```

---

## 18. Quality tools — Nuxt / TypeScript

Commands from `httpdocs/frontend`:

```bash
npm run ts:check
npm run ts:fix
npm run ts:format
npm run ts:lint
npm run ts:typecheck
npm run build
```

Scripts:

```json
{
  "build": "cross-env NODE_ENV=production nuxt build",
  "dev": "nuxt dev --host 0.0.0.0",
  "ts:check": "biome check . && tsc --noEmit -p tsconfig.json",
  "ts:fix": "biome check --write .",
  "ts:format": "biome format --write .",
  "ts:lint": "biome lint .",
  "ts:typecheck": "tsc --noEmit -p tsconfig.json"
}
```

The adapted `biome.json` includes Nuxt `.vue`, app `.ts`, server `.ts` and `nuxt.config.ts` instead of paths from the source project.

---

## 19. Quality tools — QR renderer

From `httpdocs/qr-renderer`:

```bash
npm run typecheck
npm run lint
```

The renderer is intentionally a small service. Keep it that way; billing/auth/domain logic must not migrate into it.

---

## 20. Validation performed on this generated starter

The generated files were checked in the artifact environment for:

- PHP syntax across application/bootstrap/config/database/routes/tests/custom PHPCS files;
- TypeScript syntax parsing for `.ts` and Vue `<script>` blocks;
- JSON syntax;
- XML syntax;
- Docker Compose YAML syntax;
- absence of `data:image` markup;
- local image-component usage and separation of pages/components.

A complete `npm install`, Nuxt build and Biome/TypeScript typecheck could not be completed in the artifact sandbox because its available NPM registry mirror did not provide the requested current Biome package, and the environment did not provide Docker/Composer. Run the commands above in the supplied Docker development environment before treating this as deployable.

This distinction matters: syntax validation is **not** a substitute for a real dependency-resolved build or integration test.

---

## 21. High-risk / production checklist

Before launch, review these items explicitly:

### Authentication

- HTTPS only;
- secure cookies enabled;
- correct shared parent domain for Passport session bootstrap;
- rotate BFF and renderer secrets;
- do not expose access/refresh tokens to browser JavaScript;
- restrict CORS/reverse-proxy hosts;
- preserve OAuth state + PKCE validation.

### Payments

- replace `DemoBillingGateway`;
- verify webhook signatures;
- webhook idempotency;
- retry policy;
- provider billing portal;
- cancellation flow;
- grace-period product policy;
- reconcile local state with provider state periodically.

### QR redirects

- separate `q.example.com` from dashboard traffic if volume grows;
- keep redirect destination cached;
- keep analytics asynchronous;
- set rate/abuse controls where appropriate;
- never resolve inactive or expired-account dynamic QR codes;
- monitor queue lag.

### Storage

- shared/object storage for multi-host deployment;
- backups/lifecycle rules;
- correct write permissions;
- CDN/cache headers for immutable generated files;
- retain renderer logo-origin allowlist;
- sanitize SVG before ever allowing user SVG uploads.

### Analytics

- add GeoIP asynchronously;
- decide retention period;
- document analytics/privacy behavior;
- consider bot/crawler scan classification before billing by scan count.

### Operations

- queue worker must be running;
- scheduler must be running;
- Redis persistence/eviction policy must be deliberate;
- PostgreSQL backup and migrations procedure;
- health checks and observability;
- do not run Laravel's development server or Nuxt dev server in production.

---

## 22. Suggested production topology

```text
Internet
   |
   +--> app.example.com --------> Nuxt/Nitro replicas
   |                                |
   |                                +--> Laravel API
   |                                +--> QR renderer (internal only)
   |
   +--> api.example.com --------> Laravel API replicas
   |
   +--> q.example.com ----------> thin Laravel redirect tier
   |                                |
   |                                +--> Redis
   |                                +--> analytics queue
   |
   +--> cdn.example.com --------> object/shared storage

Laravel workers ----------> Redis queues ----------> PostgreSQL
Laravel scheduler --------> subscription lifecycle checks
Payment webhooks ---------> Laravel billing webhook endpoint (to add with provider)
```

For very high scan volume, the redirect tier can later be separated from the main Laravel API without changing the Nuxt dashboard contract.

---

## 23. What is deliberately not faked

The starter does **not** invent integration details that were not specified:

- no real acquiring provider/card tokenization;
- no fabricated saved credit card;
- no GeoIP vendor/database;
- no fake company/business page unrelated to this QR SaaS;
- no arbitrary remote-image proxying;
- no claim that a full Docker/NPM/Composer integration build passed in the generation environment.

Those are extension points, not hidden TODOs disguised as completed features.
