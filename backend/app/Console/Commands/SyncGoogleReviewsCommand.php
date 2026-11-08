<?php

namespace App\Console\Commands;

use App\Services\GooglePlacesSyncService;
use Illuminate\Console\Command;

class SyncGoogleReviewsCommand extends Command
{
    protected $signature = 'google-reviews:sync';

    protected $description = 'Fetch Google Place reviews and store them locally';

    public function handle(GooglePlacesSyncService $sync): int
    {
        $result = $sync->syncConfiguredPlace();
        $this->line($result['message']);

        return $result['success'] ? self::SUCCESS : self::FAILURE;
    }
}
