<?php

use App\Services\BadgeAwardingService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('teach4free:award-badges', function (): int {
    $awarded = app(BadgeAwardingService::class)->awardForAllTeachers();

    $this->info("Awarded {$awarded} new badge(s).");

    return 0;
})->purpose('Award earned Teach4Free badges from real platform activity');
