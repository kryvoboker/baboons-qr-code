<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'plan_code',
        'provider',
        'provider_subscription_id',
        'status',
        'current_period_start',
        'current_period_end',
        'cancel_at_period_end',
        'payment_failed_at',
        'renewal_reminder_sent_for',
        'payment_failure_notified_at',
    ];

    protected function casts(): array
    {
        return [
            'current_period_start' => 'datetime',
            'current_period_end' => 'datetime',
            'cancel_at_period_end' => 'boolean',
            'payment_failed_at' => 'datetime',
            'renewal_reminder_sent_for' => 'datetime',
            'payment_failure_notified_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
