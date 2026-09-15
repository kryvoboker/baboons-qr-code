<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

final class AuthSessionController extends Controller
{
    public function create(Request $request): View
    {
        return view('storefront.auth.login', ['redirect' => $request->query('redirect')]);
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'redirect' => ['required', 'url'],
        ]);

        if (! Auth::guard('web')->attempt([
            'email' => $credentials['email'],
            'password' => $credentials['password'],
        ])) {
            return back()->withErrors(['email' => 'Неверный email или пароль.'])->withInput();
        }

        $request->session()->regenerate();

        return redirect()->to($this->allowedRedirect($credentials['redirect'], $request));
    }

    private function allowedRedirect(string $redirect, Request $request): string
    {
        $parsed = parse_url($redirect);
        $path = $parsed['path'] ?? '';
        $isOAuthRedirect = $path === '/oauth/authorize';
        $isEmailVerificationRedirect = preg_match('#^/email/verify/[0-9]+/[a-f0-9]{40}$#D', $path) === 1;

        if (
            ($parsed['host'] ?? null) === $request->getHost()
            && ($parsed['scheme'] ?? null) === ($request->isSecure() ? 'https' : 'http')
            && (($parsed['port'] ?? null) === null || $parsed['port'] === $request->getPort())
            && ($isOAuthRedirect || $isEmailVerificationRedirect)
        ) {
            return $redirect;
        }

        return route('login');
    }
}
