<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\QrCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class AnalyticsController extends Controller
{
    public function show(Request $request, QrCode $qrCode): JsonResponse
    {
        abort_unless($qrCode->user_id === $request->user()->id, 404);

        $daily = $qrCode->scans()
            ->selectRaw("date(scanned_at) as day, count(*) as scans")
            ->where('scanned_at', '>=', now()->subDays(30))
            ->groupBy(DB::raw('date(scanned_at)'))
            ->orderBy('day')
            ->get();

        return response()->json([
            'data' => [
                'total' => $qrCode->scans()->count(),
                'last_30_days' => $qrCode->scans()->where('scanned_at', '>=', now()->subDays(30))->count(),
                'daily' => $daily,
                'top_countries' => $qrCode->scans()->selectRaw('country, count(*) as scans')->groupBy('country')->orderByDesc('scans')->limit(5)->get(),
                'top_devices' => $qrCode->scans()->selectRaw('device, count(*) as scans')->groupBy('device')->orderByDesc('scans')->limit(5)->get(),
            ],
        ]);
    }
}
