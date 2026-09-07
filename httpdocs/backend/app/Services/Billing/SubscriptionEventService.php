<?php

declare(strict_types=1);

namespace App\Services\Billing;

use App\Models\Subscription;
use App\Notifications\SubscriptionPaymentFailed;
use App\Notifications\SubscriptionPaymentSucceeded;
use Carbon\CarbonInterface;

final class SubscriptionEventService
{
    public function paymentSucceeded(
        Subscription $subscription,
        CarbonInterface $periodStart,
        CarbonInterface $periodEnd,
        string $amount,
        string $currency,
    ): void {
        $subscription->forceFill([
            'status' => 'active',
            'current_period_start' => $periodStart,
            'current_period_end' => $periodEnd,
            'payment_failed_at' => null,
            'payment_failure_notified_at' => null,
            'renewal_reminder_sent_for' => null,
        ])->save();

        $subscription->user?->notify(new SubscriptionPaymentSucceeded(
            $subscription,
            $amount,
            $currency,
        ));
    }

    public function paymentFailed(Subscription $subscription): void
    {
        $subscription->forceFill([
            'status' => 'past_due',
            'payment_failed_at' => now(),
        ])->save();

        $subscription->user?->notify(new SubscriptionPaymentFailed($subscription));
        $subscription->forceFill(['payment_failure_notified_at' => now()])->save();
    }
}
