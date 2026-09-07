<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class QrCode extends Model
{
    use HasUuids;

    /** @var list<string> */
    protected $fillable = [
        'user_id', 'qr_folder_id', 'name', 'slug', 'kind', 'mode', 'payload', 'design',
        'image_path', 'destination_url', 'is_active', 'last_scanned_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'design' => 'array',
            'is_active' => 'boolean',
            'last_scanned_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(QrFolder::class, 'qr_folder_id');
    }

    public function scans(): HasMany
    {
        return $this->hasMany(QrScan::class);
    }
}
