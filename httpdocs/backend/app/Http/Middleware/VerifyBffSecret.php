<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class VerifyBffSecret
{
    public function handle(Request $request, Closure $next): Response
    {
        $configured = (string) config('baboons.bff_secret');
        $provided = (string) $request->header('X-Baboons-BFF-Secret');

        abort_if($configured === '' || ! hash_equals($configured, $provided), 404);

        return $next($request);
    }
}
