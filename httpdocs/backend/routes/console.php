<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('subscriptions:check')->everyFifteenMinutes()->withoutOverlapping();
Schedule::command('passport:purge --hours=24')->hourly()->withoutOverlapping();
