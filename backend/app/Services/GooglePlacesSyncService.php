<?php

namespace App\Services;

use App\Models\GooglePlace;
use App\Models\GoogleReview;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class GooglePlacesSyncService
{
    public function isConfigured(): bool
    {
        $key = config('google_places.api_key');

        return is_string($key) && trim($key) !== '';
    }

    /**
     * @return array{success: bool, message: string, reviews_upserted?: int}
     */
    public function syncConfiguredPlace(): array
    {
        $place = GooglePlace::forConfiguredPlace();

        if (! $this->isConfigured()) {
            return [
                'success' => false,
                'message' => 'GOOGLE_PLACES_API_KEY is not set. Add it to .env when your key is ready.',
            ];
        }

        $placeId = (string) config('google_places.place_id');
        $url = rtrim((string) config('google_places.base_url'), '/').'/'.$placeId;
        $fieldMask = (string) config('google_places.field_mask');

        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'X-Goog-Api-Key' => (string) config('google_places.api_key'),
                    'X-Goog-FieldMask' => $fieldMask,
                    'Accept' => 'application/json',
                ])
                ->get($url);

            if (! $response->successful()) {
                $message = $response->json('error.message') ?? $response->body();
                $place->update([
                    'last_sync_error' => Str::limit((string) $message, 2000),
                ]);

                return [
                    'success' => false,
                    'message' => 'Google Places API error: '.Str::limit((string) $message, 500),
                ];
            }

            $payload = is_array($response->json()) ? $response->json() : [];
            $upserted = $this->applyPlacePayload($place, $payload);
            $reviewsFromGoogle = data_get($payload, 'reviews');
            $reviewCountInResponse = is_array($reviewsFromGoogle)
                ? count($reviewsFromGoogle)
                : 0;

            $place->update([
                'last_synced_at' => now(),
                'last_sync_error' => null,
            ]);

            $message = "Synced {$upserted} review(s) from Google.";
            if ($upserted === 0 && $reviewCountInResponse === 0) {
                $message = 'Rating and review count updated from Google, but the API returned no review text. '
                    .'Enable Place Details Enterprise + Atmosphere for the reviews field on this Cloud project '
                    .'(rating/count work; reviews need the higher SKU). Legacy reviews in admin are unchanged.';
            }

            return [
                'success' => true,
                'message' => $message,
                'reviews_upserted' => $upserted,
                'reviews_in_api_response' => $reviewCountInResponse,
            ];
        } catch (Throwable $e) {
            $place->update([
                'last_sync_error' => Str::limit($e->getMessage(), 2000),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function applyPlacePayload(GooglePlace $place, array $payload): int
    {
        $displayName = data_get($payload, 'displayName.text')
            ?? data_get($payload, 'displayName')
            ?? $place->display_name;

        $place->fill([
            'display_name' => is_string($displayName) ? $displayName : $place->display_name,
            'rating' => data_get($payload, 'rating'),
            'user_rating_count' => data_get($payload, 'userRatingCount'),
        ]);
        $place->save();

        $reviews = data_get($payload, 'reviews', []);
        if (! is_array($reviews)) {
            return 0;
        }

        $count = 0;
        foreach ($reviews as $review) {
            if (! is_array($review)) {
                continue;
            }
            if ($this->upsertApiReview($place, $review)) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * @param  array<string, mixed>  $review
     */
    private function upsertApiReview(GooglePlace $place, array $review): bool
    {
        $authorUrl = (string) (data_get($review, 'authorAttribution.uri') ?? '');
        $authorName = (string) (data_get($review, 'authorAttribution.displayName') ?? 'Google user');
        $publishTime = data_get($review, 'publishTime');
        $publishedAt = $this->parsePublishTime($publishTime);
        $publishedUnix = $publishedAt?->getTimestamp() ?? 0;

        $fingerprint = $authorUrl !== ''
            ? GoogleReview::fingerprint($authorUrl, $publishedUnix)
            : hash('sha256', $authorName.'|'.(string) data_get($review, 'name', uniqid('', true)));

        $text = data_get($review, 'text.text') ?? data_get($review, 'text');
        $text = is_string($text) ? trim($text) : null;

        $attrs = [
            'google_place_id' => $place->id,
            'author_name' => $authorName,
            'author_url' => $authorUrl !== '' ? $authorUrl : null,
            'profile_photo_url' => data_get($review, 'authorAttribution.photoUri'),
            'rating' => (int) (data_get($review, 'rating') ?? 0),
            'review_text' => $text === '' ? null : $text,
            'language' => data_get($review, 'text.languageCode')
                ?? data_get($review, 'originalText.languageCode'),
            'published_at' => $publishedAt,
            'imported_from_legacy' => false,
        ];

        $existing = GoogleReview::query()
            ->where('source_fingerprint', $fingerprint)
            ->first();

        if ($existing) {
            $existing->fill($attrs);
            $existing->save();
        } else {
            GoogleReview::query()->create(array_merge($attrs, [
                'source_fingerprint' => $fingerprint,
                'is_approved' => false,
            ]));
        }

        return true;
    }

    private function parsePublishTime(mixed $value): ?Carbon
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        try {
            return Carbon::parse($value);
        } catch (Throwable) {
            return null;
        }
    }
}
