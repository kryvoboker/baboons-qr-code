<?php

declare(strict_types=1);

namespace App\Services\Billing;

use App\Contracts\BillingGateway;
use App\Models\User;
use Illuminate\Support\Str;

final class DemoBillingGateway implements BillingGateway
{
    public function __construct(private readonly SubscriptionEventService $events)
    {
    }

    public function createCheckout(User $user, string $planCode): array
    {
        $sessionId = (string) Str::uuid();
        $plan = (array) config('baboons.billing.plans.' . $planCode, []);

        $subscription = $user->subscriptions()->updateOrCreate(
            ['provider' => 'demo'],
            [
                'plan_code' => $planCode,
                'provider_subscription_id' => 'demo_' . $sessionId,
                'status' => 'active',
                'current_period_start' => now(),
                'current_period_end' => now()->addMonth(),
                'cancel_at_period_end' => false,
            ],
        );

        $this->events->paymentSucceeded(
            $subscription,
            now(),
            now()->addMonth(),
            (string) ($plan['price'] ?? '0'),
            (string) ($plan['currency'] ?? 'EUR'),
        );

        return [
            'session_id' => $sessionId,
            'checkout_url' => rtrim((string) config('baboons.frontend_url'), '/')
                . '/billing/thank-you?session=' . $sessionId . '&plan=' . urlencode($planCode),
        ];
    }
}
