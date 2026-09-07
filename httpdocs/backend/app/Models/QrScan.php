<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class QrScan extends Model
{
    public $timestamps = false;

    /** @var list<string> */
    protected $fillable = ['qr_code_id', 'scanned_at', 'ip_hash', 'country', 'device', 'browser', 'os', 'referrer'];

    protected function casts(): array { return ['scanned_at' => 'datetime']; }
    public function qrCode(): BelongsTo { return $this->belongsTo(QrCode::class); }
}
