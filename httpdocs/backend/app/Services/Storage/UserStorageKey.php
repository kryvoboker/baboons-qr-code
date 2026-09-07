<?php

declare(strict_types=1);

namespace App\Services\Storage;

final class UserStorageKey
{
    public static function fromEmail(string $email): string
    {
        return hash('sha256', mb_strtolower(trim($email)));
    }

    public static function fromGuestSession(string $sessionKey): string
    {
        return 'guest-' . hash('sha256', $sessionKey);
    }
}
