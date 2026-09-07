<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Services\Storage\UserStorageKey;
use PHPUnit\Framework\TestCase;

final class UserStorageKeyTest extends TestCase
{
    public function testEmailIsNormalizedBeforeHashing(): void
    {
        self::assertSame(
            UserStorageKey::fromEmail('user@example.com'),
            UserStorageKey::fromEmail(' User@Example.COM '),
        );
    }

    public function testGuestKeyHasGuestPrefix(): void
    {
        self::assertMatchesRegularExpression(
            '/^guest-[a-f0-9]{64}$/',
            UserStorageKey::fromGuestSession('a-secure-session-key'),
        );
    }
}
