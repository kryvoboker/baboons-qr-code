<?php

declare(strict_types=1);

namespace App\Services\Analytics;

final class UserAgentSummary
{
    /** @return array{device:string,browser:string,os:string} */
    public static function parse(?string $userAgent): array
    {
        $ua = strtolower((string) $userAgent);

        $device = str_contains($ua, 'ipad') || str_contains($ua, 'tablet')
            ? 'tablet'
            : (str_contains($ua, 'mobile') || str_contains($ua, 'iphone') || str_contains($ua, 'android')
                ? 'mobile'
                : 'desktop');

        $browser = match (true) {
            str_contains($ua, 'edg/') => 'Edge',
            str_contains($ua, 'opr/') || str_contains($ua, 'opera') => 'Opera',
            str_contains($ua, 'firefox/') => 'Firefox',
            str_contains($ua, 'chrome/') || str_contains($ua, 'crios/') => 'Chrome',
            str_contains($ua, 'safari/') => 'Safari',
            default => 'Other',
        };

        $os = match (true) {
            str_contains($ua, 'android') => 'Android',
            str_contains($ua, 'iphone') || str_contains($ua, 'ipad') => 'iOS / iPadOS',
            str_contains($ua, 'windows') => 'Windows',
            str_contains($ua, 'mac os x') => 'macOS',
            str_contains($ua, 'linux') => 'Linux',
            default => 'Other',
        };

        return compact('device', 'browser', 'os');
    }
}
