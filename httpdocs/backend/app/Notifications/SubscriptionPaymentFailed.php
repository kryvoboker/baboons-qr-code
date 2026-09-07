<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class SubscriptionPaymentFailed extends Notification implements ShouldQueue
{
    use Queueable;
    public function __construct(private readonly Subscription $subscription) {}
    public function via(object $notifiable): array { return ['mail', 'database']; }
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->error()
            ->subject('Subscription payment failed')
            ->line('We could not renew your Baboons QR-code subscription.')
            ->line('Dynamic QR codes may become inactive after the grace period.')
            ->action('Update payment method', rtrim((string) config('baboons.frontend_url'), '/') . '/settings/billing');
    }
    public function toArray(object $notifiable): array
    {
        return [
            'event' => 'subscription.payment_failed',
            'subscription_id' => $this->subscription->id,
            'plan_code' => $this->subscription->plan_code,
            'payment_failed_at' => $this->subscription->payment_failed_at?->toIso8601String(),
        ];
    }
}
