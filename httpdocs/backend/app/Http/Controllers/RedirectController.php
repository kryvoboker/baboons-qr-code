<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Jobs\TrackQrScan;
use App\Models\QrCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

final class RedirectController extends Controller
{
    public function __invoke(Request $request, string $slug): RedirectResponse
    {
        /** @var array{id:string,destination_url:string}|null $target */
        $target = Cache::remember(
            'qr:redirect:' . $slug,
            now()->addMinutes(5),
            static function () use ($slug): ?array {
                $qr = QrCode::query()
                    ->select(['id', 'destination_url'])
                    ->where('slug', $slug)
                    ->where('mode', 'dynamic')
                    ->where('is_active', true)
                    ->whereHas('user.subscriptions', static function ($query): void {
                        $query->where('status', 'active')
                            ->where('current_period_end', '>', now());
                    })
                    ->first();

                if ($qr === null || $qr->destination_url === null) {
                    return null;
                }

                return [
                    'id' => (string) $qr->id,
                    'destination_url' => (string) $qr->destination_url,
                ];
            },
        );

        abort_if($target === null, 404);

        TrackQrScan::dispatch($target['id'], [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'referrer' => $request->headers->get('referer'),
        ]);

        return redirect()->away($target['destination_url'], 302);
    }
}
