<?php

declare(strict_types=1);

return [
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
    'api_public_url' => env('API_PUBLIC_URL', env('NUXT_PUBLIC_BACKEND_BASE', env('APP_URL', 'http://localhost'))),
    'storage_public_url' => env('STORAGE_PUBLIC_URL', 'http://localhost:8082'),
    'bff_secret' => env('BFF_SHARED_SECRET'),
    'qr_renderer_url' => env('QR_RENDERER_URL', 'http://qr-renderer:3100'),
    'qr_renderer_secret' => env('QR_RENDERER_SHARED_SECRET'),
    'qr_redirect_base' => env('QR_PUBLIC_REDIRECT_BASE', 'http://localhost:8000/r'),
    'billing' => [
        'driver' => env('BILLING_DRIVER', 'demo'),
        'renewal_warning_days' => (int) env('BILLING_RENEWAL_WARNING_DAYS', 3),
        'plans' => [
            'starter' => ['name' => 'Starter', 'price' => 6, 'currency' => 'EUR', 'dynamic_qr' => 10, 'scans' => 5000],
            'creator' => ['name' => 'Creator', 'price' => 12, 'currency' => 'EUR', 'dynamic_qr' => 50, 'scans' => 50000],
            'business' => ['name' => 'Business', 'price' => 29, 'currency' => 'EUR', 'dynamic_qr' => 250, 'scans' => 250000],
        ],
    ],
];
