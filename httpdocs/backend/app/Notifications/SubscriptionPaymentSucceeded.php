<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class SubscriptionPaymentSucceeded extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Subscription $subscription,
        private readonly string $amount,
        private readonly string $currency,
    ) {
        $this->onQueue('notifications');
    }

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'event' => 'subscription.payment_succeeded',
            'plan_code' => $this->subscription->plan_code,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'current_period_end' => $this->subscription->current_period_end?->toIso8601String(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('Baboons QR-code subscription renewed')
            ->line(sprintf('Your subscription payment of %s %s was successful.', $this->amount, $this->currency))
            ->line('Your dynamic QR codes remain active.');
    }
}
