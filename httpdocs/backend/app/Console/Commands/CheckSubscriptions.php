<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Notifications\SubscriptionPaymentFailed;
use App\Notifications\SubscriptionRenewalReminder;
use Illuminate\Console\Command;

final class CheckSubscriptions extends Command
{
    protected $signature = 'subscriptions:check';
    protected $description = 'Check subscription renewal windows, expirations and failed payments.';

    public function handle(): int
    {
        $warningDate = now()->addDays((int) config('baboons.billing.renewal_warning_days', 3));

        Subscription::query()
            ->with('user')
            ->where('status', 'active')
            ->whereBetween('current_period_end', [now(), $warningDate])
            ->where(function ($query): void {
                $query->whereNull('renewal_reminder_sent_for')
                    ->orWhereColumn('renewal_reminder_sent_for', '<>', 'current_period_end');
            })
            ->chunkById(100, function ($subscriptions): void {
                foreach ($subscriptions as $subscription) {
                    $subscription->user?->notify(new SubscriptionRenewalReminder($subscription));
                    $subscription->forceFill([
                        'renewal_reminder_sent_for' => $subscription->current_period_end,
                    ])->save();
                }
            });

        Subscription::query()
            ->with('user')
            ->whereNotNull('payment_failed_at')
            ->where(function ($query): void {
                $query->whereNull('payment_failure_notified_at')
                    ->orWhereColumn('payment_failure_notified_at', '<', 'payment_failed_at');
            })
            ->chunkById(100, function ($subscriptions): void {
                foreach ($subscriptions as $subscription) {
                    $subscription->user?->notify(new SubscriptionPaymentFailed($subscription));
                    $subscription->forceFill(['payment_failure_notified_at' => now()])->save();
                }
            });

        Subscription::query()
            ->whereIn('status', ['active', 'past_due'])
            ->where('current_period_end', '<=', now())
            ->where('cancel_at_period_end', true)
            ->update(['status' => 'expired']);

        Subscription::query()
            ->where('status', 'active')
            ->where('current_period_end', '<=', now())
            ->whereNotNull('payment_failed_at')
            ->update(['status' => 'past_due']);

        return self::SUCCESS;
    }
}
