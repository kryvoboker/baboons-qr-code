<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\QrCode;
use App\Models\QrScan;
use App\Services\Analytics\UserAgentSummary;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

final class TrackQrScan implements ShouldQueue
{
    use Queueable;

    /** @param array{ip:?string,user_agent:?string,referrer:?string} $meta */
    public function __construct(public string $qrCodeId, public array $meta)
    {
        $this->onQueue('analytics');
    }

    public function handle(): void
    {
        $ip = (string) ($this->meta['ip'] ?? '');
        $summary = UserAgentSummary::parse($this->meta['user_agent'] ?? null);

        QrScan::query()->create([
            'qr_code_id' => $this->qrCodeId,
            'scanned_at' => now(),
            'ip_hash' => $ip === '' ? null : hash_hmac('sha256', $ip, (string) config('app.key')),
            'country' => null,
            'device' => $summary['device'],
            'browser' => $summary['browser'],
            'os' => $summary['os'],
            'referrer' => $this->meta['referrer'] ?? null,
        ]);

        QrCode::query()
            ->whereKey($this->qrCodeId)
            ->update(['last_scanned_at' => now()]);
    }
}
