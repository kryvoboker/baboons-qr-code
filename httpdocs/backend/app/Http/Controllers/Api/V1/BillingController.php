<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Contracts\BillingGateway;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BillingController extends Controller
{
    public function plans(): JsonResponse
    {
        $plans = collect((array) config('baboons.billing.plans', []))
            ->map(static fn (array $plan, string $code): array => ['code' => $code, ...$plan])
            ->values();

        return response()->json(['data' => $plans]);
    }

    public function checkout(Request $request, BillingGateway $gateway): JsonResponse
    {
        $allowedPlans = implode(',', array_keys((array) config('baboons.billing.plans', [])));
        $planCode = $request->validate([
            'plan_code' => ['required', 'in:' . $allowedPlans],
        ])['plan_code'];

        return response()->json([
            'data' => $gateway->createCheckout($request->user(), $planCode),
        ]);
    }

    public function subscription(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()->subscriptions()->latest()->first(),
        ]);
    }
}
