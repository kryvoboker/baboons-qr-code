<?php

use App\Http\Controllers\AuthSessionController;
use Illuminate\Support\Facades\Route;

Route::get('/login', [AuthSessionController::class, 'create'])->name('login');
Route::post('/login', [AuthSessionController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('login.store');

Route::get('/', function () {
    return view('welcome');
});
