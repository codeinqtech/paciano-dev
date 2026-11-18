<?php

namespace App\Console\Commands;

use App\Services\GoogleReviewsSyncService;
use Illuminate\Console\Command;

class SyncGoogleReviewsCommand extends Command
{
    protected $signature = 'google-reviews:sync';

    protected $description = 'Fetch Google reviews (Business Profile or Places API) and store them locally';

    public function handle(GoogleReviewsSyncService $sync): int
    {
        $this->line('Sync mode: '.$sync->syncMode());
        $result = $sync->sync();
        $this->line($result['message']);

        return $result['success'] ? self::SUCCESS : self::FAILURE;
    }
}
