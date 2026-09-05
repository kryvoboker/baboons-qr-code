[← Deployment](deployment.md) · [Back to README](../README.md)

# Testing

## Backend tests

The backend uses PHPUnit through Laravel's test runner.

```bash
docker exec dev-nuxt-php-fpm php artisan test --compact
```

For a focused run, pass a test path or filter:

```bash
docker exec dev-nuxt-php-fpm php artisan test --compact tests/Feature/ExampleTest.php
docker exec dev-nuxt-php-fpm php artisan test --compact --filter=ExampleTest
```

Format changed PHP files with Pint:

```bash
docker exec dev-nuxt-php-fpm vendor/bin/pint --dirty --format agent
```

## Frontend checks

The Nuxt package currently defines build, development, generate, and preview scripts. Run them in the Node container:

```bash
docker exec dev-nuxt-nodejs npm run build
docker exec dev-nuxt-nodejs npm run generate
```

## Integration verification

Before considering a local change complete, confirm that MariaDB and Redis are healthy, Laravel can boot, routes resolve, and the frontend build succeeds. Keep credentials and local runtime data outside committed changes.

## See Also

- [Getting Started](getting-started.md) — start the containers
- [Deployment](deployment.md) — release checklist

