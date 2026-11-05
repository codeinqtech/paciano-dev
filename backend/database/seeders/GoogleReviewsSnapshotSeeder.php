<?php

namespace Database\Seeders;

use App\Models\GooglePlace;
use App\Models\GoogleReview;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Seeds google_places + google_reviews from a JSON snapshot of the CMS database.
 * Refresh the snapshot: php scripts/export_google_reviews_for_seeder.php
 * then copy output to database/seeders/data/google_reviews_snapshot.json
 */
class GoogleReviewsSnapshotSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/google_reviews_snapshot.json');

        if (! is_readable($path)) {
            $this->command?->warn('Google reviews snapshot missing at '.$path);

            return;
        }

        /** @var array{place?: array<string, mixed>, reviews?: list<array<string, mixed>>}|null $payload */
        $payload = json_decode((string) file_get_contents($path), true);

        if (! is_array($payload) || empty($payload['place']['place_id'])) {
            $this->command?->warn('Google reviews snapshot is invalid or empty.');

            return;
        }

        $placeRow = $payload['place'];
        $lastSynced = $placeRow['last_synced_at'] ?? null;
        $placeId = GooglePlace::configuredPlaceId();

        $place = GooglePlace::query()->updateOrCreate(
            ['place_id' => $placeId],
            [
                'display_name' => $placeRow['display_name'] ?? null,
                'rating' => isset($placeRow['rating']) ? (float) $placeRow['rating'] : null,
                'user_rating_count' => isset($placeRow['user_rating_count'])
                    ? (int) $placeRow['user_rating_count']
                    : null,
                'maps_url' => $placeRow['maps_url'] ?? null,
                'photo_url' => $placeRow['photo_url'] ?? null,
                'last_synced_at' => is_string($lastSynced) && $lastSynced !== ''
                    ? Carbon::parse($lastSynced)
                    : null,
                'last_sync_error' => $placeRow['last_sync_error'] ?? null,
            ],
        );

        $reviews = $payload['reviews'] ?? [];
        $count = 0;

        foreach ($reviews as $row) {
            if (empty($row['source_fingerprint']) || empty($row['author_name'])) {
                continue;
            }

            $publishedAt = $row['published_at'] ?? null;
            $ownerReplyAt = $row['owner_reply_at'] ?? null;

            GoogleReview::query()->updateOrCreate(
                ['source_fingerprint' => (string) $row['source_fingerprint']],
                [
                    'google_place_id' => $place->id,
                    'author_name' => (string) $row['author_name'],
                    'author_url' => $row['author_url'] ?? null,
                    'profile_photo_url' => $row['profile_photo_url'] ?? null,
                    'rating' => (int) ($row['rating'] ?? 0),
                    'review_text' => $row['review_text'] ?? null,
                    'language' => $row['language'] ?? null,
                    'published_at' => is_string($publishedAt) && $publishedAt !== ''
                        ? Carbon::parse($publishedAt)
                        : null,
                    'owner_reply' => $row['owner_reply'] ?? null,
                    'owner_reply_at' => is_string($ownerReplyAt) && $ownerReplyAt !== ''
                        ? Carbon::parse($ownerReplyAt)
                        : null,
                    'photo_urls' => $row['photo_urls'] ?? null,
                    'is_approved' => (bool) ($row['is_approved'] ?? false),
                    'imported_from_legacy' => (bool) ($row['imported_from_legacy'] ?? false),
                ],
            );
            $count++;
        }

        $this->command?->info("Google reviews snapshot seeded: place + {$count} reviews.");
    }
}
