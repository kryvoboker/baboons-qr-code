<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\QrScan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class DashboardController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscription = $user->subscriptions()->latest()->first();
        $plan = $subscription === null
            ? null
            : (array) config('baboons.billing.plans.' . $subscription->plan_code, []);

        $daily = QrScan::query()
            ->whereHas('qrCode', static fn ($query) => $query->where('user_id', $user->id))
            ->where('scanned_at', '>=', now()->subDays(13)->startOfDay())
            ->selectRaw('DATE(scanned_at) AS date, COUNT(*) AS scans')
            ->groupByRaw('DATE(scanned_at)')
            ->orderBy('date')
            ->get();

        $scansThisMonth = QrScan::query()
            ->whereHas('qrCode', static fn ($query) => $query->where('user_id', $user->id))
            ->whereBetween('scanned_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->count();

        $recentQrCodes = $user->qrCodes()
            ->with('folder:id,name')
            ->withCount('scans')
            ->latest('updated_at')
            ->limit(4)
            ->get();

        return response()->json([
            'data' => [
                'dynamic_qr_count' => $user->qrCodes()->where('mode', 'dynamic')->count(),
                'dynamic_qr_limit' => $plan['dynamic_qr'] ?? null,
                'scans_this_month' => $scansThisMonth,
                'scan_limit' => $plan['scans'] ?? null,
                'templates_count' => $user->templates()->count(),
                'folders_count' => $user->folders()->count(),
                'daily' => $daily,
                'recent_qr_codes' => $recentQrCodes,
                'subscription' => $subscription,
                'plan' => $subscription === null ? null : ['code' => $subscription->plan_code, ...$plan],
            ],
        ]);
    }
}
