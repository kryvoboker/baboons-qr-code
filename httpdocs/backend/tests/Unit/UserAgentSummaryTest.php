<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Services\Analytics\UserAgentSummary;
use PHPUnit\Framework\TestCase;

final class UserAgentSummaryTest extends TestCase
{
    public function testMobileChromeOnAndroid(): void
    {
        $summary = UserAgentSummary::parse(
            'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36',
        );

        self::assertSame('mobile', $summary['device']);
        self::assertSame('Chrome', $summary['browser']);
        self::assertSame('Android', $summary['os']);
    }
}
