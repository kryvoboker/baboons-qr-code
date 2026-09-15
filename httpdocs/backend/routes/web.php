<?php

use App\Http\Controllers\AuthSessionController;
use App\Http\Controllers\RedirectController;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/login', [AuthSessionController::class, 'create'])->name('login');
Route::post('/login', [AuthSessionController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('login.store');

Route::get('/email/verify', static function (): RedirectResponse {
    return redirect()->to(rtrim((string) config('baboons.frontend_url'), '/').'/auth/verify-email');
})->middleware('auth')->name('verification.notice');

Route::get('/email/verify/{id}/{hash}', static function (EmailVerificationRequest $request): RedirectResponse {
    $request->fulfill();

    return redirect()->to(rtrim((string) config('baboons.frontend_url'), '/').'/auth/verify-email?verified=1');
})->middleware(['auth', 'signed', 'throttle:6,1'])->name('verification.verify');

Route::post('/email/verification-notification', static function (Request $request): RedirectResponse {
    $user = $request->user();

    if ($user instanceof MustVerifyEmail && ! $user->hasVerifiedEmail()) {
        $user->sendEmailVerificationNotification();
    }

    return back()->with('status', 'verification-link-sent');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');

Route::get('/', function () {
    return view('storefront.welcome');
});

Route::get('/r/{slug}', RedirectController::class)->where('slug', '[A-Za-z0-9_-]+');
