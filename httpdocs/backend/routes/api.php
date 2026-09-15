<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController as LegacyAuthController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\AssetController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BillingController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\QrCodeController;
use App\Http\Controllers\Api\V1\QrFolderController;
use App\Http\Controllers\Api\V1\QrTemplateController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('bff.secret')->group(function (): void {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/session', [AuthController::class, 'createSession']);
    Route::delete('/auth/session', [AuthController::class, 'destroySession']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
    Route::get('/billing/plans', [BillingController::class, 'plans']);
    Route::post('/guest-assets/logo', [AssetController::class, 'logo']);

    Route::middleware(['auth:api', 'verified'])->group(function (): void {
        Route::get('/auth/user', [AuthController::class, 'user']);
        Route::delete('/auth/token', [AuthController::class, 'revokeToken']);
        Route::get('/dashboard', [DashboardController::class, 'show']);

        Route::apiResource('qr-codes', QrCodeController::class)->parameters(['qr-codes' => 'qrCode'])->except(['create', 'edit']);
        Route::get('/qr-codes/{qrCode}/analytics', [AnalyticsController::class, 'show']);
        Route::post('/qr-codes/{qrCode}/template', [QrTemplateController::class, 'fromQrCode']);
        Route::apiResource('folders', QrFolderController::class)->parameters(['folders' => 'folder'])->except(['show', 'create', 'edit']);
        Route::apiResource('templates', QrTemplateController::class)->parameters(['templates' => 'template'])->except(['show', 'create', 'edit']);
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::patch('/notifications/{notificationId}/read', [NotificationController::class, 'markRead']);
        Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead']);
        Route::match(['put', 'patch'], '/profile', [ProfileController::class, 'update']);
        Route::post('/billing/checkout', [BillingController::class, 'checkout']);
        Route::get('/billing/subscription', [BillingController::class, 'subscription']);
        Route::post('/assets/logo', [AssetController::class, 'logo']);
    });
});

// Keep the original API endpoints available for existing clients.
Route::middleware(['auth:api', 'verified'])->group(function (): void {
    Route::get('/auth/me', [LegacyAuthController::class, 'me']);
    Route::post('/auth/logout', [LegacyAuthController::class, 'logout']);
    Route::get('/user', static fn (Request $request) => $request->user());
});
