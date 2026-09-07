<?php

declare(strict_types=1);

namespace App\Services\Qr;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

final class QrRendererClient
{
    private function client(): PendingRequest
    {
        return Http::baseUrl((string) config('baboons.qr_renderer_url'))
            ->acceptJson()
            ->withHeaders(['X-Baboons-Renderer-Secret' => (string) config('baboons.qr_renderer_secret')])
            ->timeout(15)
            ->retry(2, 150);
    }

    /** @param array<string, mixed> $options */
    public function renderAndSave(string $storageKey, array $options, string $format = 'png'): string
    {
        $response = $this->client()->post('/v1/render-and-save', [
            'storageKey' => $storageKey,
            'format' => $format,
            'options' => $options,
        ])->throw()->json();

        return (string) ($response['relativePath'] ?? '');
    }
}
