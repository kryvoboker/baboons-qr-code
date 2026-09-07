<?php

declare(strict_types=1);

namespace App\Services\Billing;

use App\Models\User;
use Illuminate\Validation\ValidationException;

final class DynamicQrEntitlement
{
    public function assertCanCreate(User $user): void
    {
        $subscription = $user->subscriptions()
            ->where('status', 'active')
            ->where('current_period_end', '>', now())
            ->latest('current_period_end')
            ->first();

        if ($subscription === null) {
            throw ValidationException::withMessages([
                'mode' => ['An active subscription is required for dynamic QR codes.'],
            ]);
        }

        $plans = (array) config('baboons.billing.plans', []);
        $limit = (int) ($plans[$subscription->plan_code]['dynamic_qr'] ?? 0);
        $used = $user->qrCodes()->where('mode', 'dynamic')->count();

        if ($limit <= 0 || $used >= $limit) {
            throw ValidationException::withMessages([
                'mode' => ['The dynamic QR code limit for this plan has been reached.'],
            ]);
        }
    }

    public function hasActiveSubscription(User $user): bool
    {
        return $user->subscriptions()
            ->where('status', 'active')
            ->where('current_period_end', '>', now())
            ->exists();
    }
}
