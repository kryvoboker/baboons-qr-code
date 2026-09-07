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

        if (($parsed['host'] ?? null) === $request->getHost() && ($parsed['path'] ?? null) === '/oauth/authorize') {
            return $redirect;
        }

        return route('login');
    }
}
