<?php

use App\Http\Controllers\AuthSessionController;
use App\Http\Controllers\RedirectController;
use Illuminate\Support\Facades\Route;

Route::get('/login', [AuthSessionController::class, 'create'])->name('login');
Route::post('/login', [AuthSessionController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('login.store');

Route::get('/', function () {
    return view('storefront.welcome');
});

Route::get('/r/{slug}', RedirectController::class)->where('slug', '[A-Za-z0-9_-]+');
