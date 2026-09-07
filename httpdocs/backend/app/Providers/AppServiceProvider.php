<?php

declare(strict_types=1);

namespace App\Providers;

use App\Contracts\BillingGateway;
use App\Models\Passport\Client;
use App\Services\Billing\DemoBillingGateway;
use Carbon\CarbonInterval;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Passport;

final class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $new_storage_path = string_value(config('filesystems.new_storage_path'));

        if ($new_storage_path) {
            config([
                // Override compiled views path
                'view.compiled' => $new_storage_path.'/framework/views',
                'debugbar.storage.path' => $new_storage_path.'/debugbar',
                'logging.channels.single.path' => $new_storage_path.'/logs/laravel.log',
                'logging.channels.daily.path' => $new_storage_path.'/logs/laravel.log',
                'logging.channels.stack.path' => $new_storage_path.'/logs/laravel.log',
            ]);
        }

        $this->app->bind(BillingGateway::class, DemoBillingGateway::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        require_once app_path('Supports/helpers.php');

        Passport::useClientModel(Client::class);
        Passport::tokensExpireIn(CarbonInterval::minutes(60));
        Passport::refreshTokensExpireIn(CarbonInterval::days(30));
        Passport::personalAccessTokensExpireIn(CarbonInterval::days(7));
        Passport::authorizationView('storefront.passport.authorize');
        Passport::tokensCan([
            'profile:read' => 'Read the current user profile',
            'profile:write' => 'Update the current user profile',
            'qr:read' => 'Read QR codes, templates and analytics',
            'qr:write' => 'Create and update QR codes and templates',
            'billing:read' => 'Read plans and subscription status',
            'billing:write' => 'Start checkout or manage billing',
        ]);

        ResetPassword::createUrlUsing(static function ($user, string $token): string {
            return rtrim((string) config('baboons.frontend_url'), '/')
                .'/auth/reset-password?token='.urlencode($token)
                .'&email='.urlencode((string) $user->getEmailForPasswordReset());
        });
    }
}
