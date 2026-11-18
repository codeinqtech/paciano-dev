<?php

namespace App\Services;

/**
 * Picks Google Business Profile sync when OAuth is connected; otherwise Places API.
 */
class GoogleReviewsSyncService
{
    public function __construct(
        private readonly GoogleBusinessReviewsSyncService $business,
        private readonly GooglePlacesSyncService $places,
    ) {}

    public function isConfigured(): bool
    {
        return $this->business->isConfigured() || $this->places->isConfigured();
    }

    public function syncMode(): string
    {
        if ($this->business->isConfigured()) {
            return 'business_profile';
        }

        if ($this->places->isConfigured()) {
            return 'places_api';
        }

        return 'none';
    }

    /**
     * @return array{success: bool, message: string, reviews_upserted?: int, sync_mode?: string}
     */
    public function sync(): array
    {
        if ($this->business->isConfigured()) {
            $result = $this->business->syncConfiguredPlace();
            $result['sync_mode'] = 'business_profile';

            return $result;
        }

        $result = $this->places->syncConfiguredPlace();
        $result['sync_mode'] = 'places_api';

        return $result;
    }
}