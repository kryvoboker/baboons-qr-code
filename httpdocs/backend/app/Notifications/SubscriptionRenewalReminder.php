<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class SubscriptionRenewalReminder extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Subscription $subscription) {}
    public function via(object $notifiable): array { return ['mail', 'database']; }
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('Your Baboons QR-code subscription renews soon')
            ->line('Your subscription renews on ' . $this->subscription->current_period_end?->toDateString() . '.')
            ->action('Manage subscription', rtrim((string) config('baboons.frontend_url'), '/') . '/settings/billing');
    }
    public function toArray(object $notifiable): array
    {
        return [
            'event' => 'subscription.renewal_reminder',
            'subscription_id' => $this->subscription->id,
            'plan_code' => $this->subscription->plan_code,
            'current_period_end' => $this->subscription->current_period_end?->toIso8601String(),
        ];
    }
}
