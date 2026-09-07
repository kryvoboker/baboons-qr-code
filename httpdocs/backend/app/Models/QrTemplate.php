<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class QrTemplate extends Model
{
    /** @var list<string> */
    protected $fillable = ['user_id', 'name', 'kind', 'design', 'preview_path', 'source_qr_code_id'];

    protected function casts(): array { return ['design' => 'array']; }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function sourceQrCode(): BelongsTo { return $this->belongsTo(QrCode::class, 'source_qr_code_id'); }
}
