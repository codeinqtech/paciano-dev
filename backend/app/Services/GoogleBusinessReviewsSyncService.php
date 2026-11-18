<?php

namespace App\Services;

use App\Models\GooglePlace;
use App\Models\GoogleReview;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class GoogleBusinessReviewsSyncService
{
    public function __construct(
        private readonly GoogleBusinessOAuthService $oauth,
    ) {}

    public function isConfigured(): bool
    {
        $account = config('services.google_business.account_id');
        $location = config('services.google_business.location_id');
        $idsOk = is_string($account) && $account !== ''
            && is_string($location) && $location !== '';

        if (! $idsOk) {
            return false;
        }

        return $this->oauth->isConnected();
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
                'message' => 'Connect Google Business Profile in admin (OAuth) and set GOOGLE_BUSINESS_ACCOUNT_ID / GOOGLE_BUSINESS_LOCATION_ID.',
            ];
        }

        $accessToken = $this->oauth->getAccessToken();
        if (! $accessToken) {
            return [
                'success' => false,
                'message' => 'Could not obtain Google access token. Re-authorize Business Profile.',
            ];
        }

        $accountId = (string) config('services.google_business.account_id');
        $locationId = (string) config('services.google_business.location_id');
        $base = rtrim((string) config('services.google_business.reviews_api_url'), '/');

        $url = "{$base}/accounts/{$accountId}/locations/{$locationId}/reviews";
        $pageToken = null;
        $totalUpserted = 0;
        $pages = 0;
        $maxPages = max(8, (int) config('services.google_business.max_sync_pages', 120));
        $averageRating = null;
        $totalReviewCount = null;
        $truncated = false;

        try {
            do {
                $query = [
                    'pageSize' => 50,
                    'orderBy' => 'updateTime desc',
                ];
                if ($pageToken) {
                    $query['pageToken'] = $pageToken;
                }

                $response = Http::timeout(45)
                    ->withToken($accessToken)
                    ->acceptJson()
                    ->get($url, $query);

                if (! $response->successful()) {
                    $message = $response->json('error.message') ?? $response->body();
                    $place->update([
                        'last_sync_error' => Str::limit((string) $message, 2000),
                    ]);

                    return [
                        'success' => false,
                        'message' => 'Google Business API error: '.Str::limit((string) $message, 500),
                    ];
                }

                $payload = is_array($response->json()) ? $response->json() : [];
                $reviews = data_get($payload, 'reviews', []);
                if (is_array($reviews)) {
                    foreach ($reviews as $review) {
                        if (is_array($review) && $this->upsertBusinessReview($place, $review)) {
                            $totalUpserted++;
                        }
                    }
                }

                if ($averageRating === null && data_get($payload, 'averageRating') !== null) {
                    $averageRating = (float) data_get($payload, 'averageRating');
                }
                if ($totalReviewCount === null && data_get($payload, 'totalReviewCount') !== null) {
                    $totalReviewCount = (int) data_get($payload, 'totalReviewCount');
                    $needed = (int) ceil($totalReviewCount / 50) + 1;
                    $maxPages = max($maxPages, min(120, $needed));
                }

                $pageToken = data_get($payload, 'nextPageToken');
                $pages++;

                if (
                    is_string($pageToken) && $pageToken !== ''
                    && $pages >= $maxPages
                ) {
                    $truncated = true;
                    break;
                }
            } while (is_string($pageToken) && $pageToken !== '');

            $storedWithGoogleId = GoogleReview::query()
                ->where('google_place_id', $place->id)
                ->whereNotNull('google_review_id')
                ->count();

            $syncError = null;
            if ($truncated) {
                $syncError = 'Sync reached the page safety limit before fetching all reviews. '
                    .'Increase GOOGLE_BUSINESS_MAX_SYNC_PAGES or run sync again.';
            }

            $place->fill([
                'display_name' => $place->display_name ?: 'Paciano',
                'place_id' => (string) config('services.google_business.place_id', $place->place_id),
                'rating' => $averageRating ?? $place->rating,
                'user_rating_count' => $totalReviewCount ?? $place->user_rating_count,
                'last_synced_at' => now(),
                'last_sync_error' => $syncError,
            ]);
            $place->save();

            $mapsTotal = $totalReviewCount ?? $place->user_rating_count;
            $message = "Synced {$totalUpserted} review row(s) across {$pages} page(s). "
                ."{$storedWithGoogleId} Business Profile review(s) stored in database.";
            if ($mapsTotal !== null) {
                $message .= " Google reports {$mapsTotal} total ratings on Maps.";
            }
            if ($truncated) {
                $message .= ' Some pages were not fetched — see last sync warning.';
            }

            return [
                'success' => true,
                'message' => $message,
                'reviews_upserted' => $totalUpserted,
                'stored_business_reviews' => $storedWithGoogleId,
                'google_total_review_count' => $mapsTotal,
            ];
        } catch (Throwable $e) {
            $place->update([
                'last_sync_error' => Str::limit($e->getMessage(), 2000),
            ]);

            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Import one API page payload (e.g. from staging.json) — useful for local verification.
     *
     * @param  array<string, mixed>  $payload
     * @return array{success: bool, message: string, reviews_upserted?: int}
     */
    public function importReviewsPayload(array $payload): array
    {
        $place = GooglePlace::forConfiguredPlace();
        $reviews = data_get($payload, 'reviews', []);
        if (! is_array($reviews)) {
            return ['success' => false, 'message' => 'Payload has no reviews array.'];
        }

        $count = 0;
        foreach ($reviews as $review) {
            if (is_array($review) && $this->upsertBusinessReview($place, $review)) {
                $count++;
            }
        }

        $place->fill([
            'rating' => data_get($payload, 'averageRating') ?? $place->rating,
            'user_rating_count' => data_get($payload, 'totalReviewCount') ?? $place->user_rating_count,
            'last_synced_at' => now(),
            'last_sync_error' => null,
        ]);
        $place->save();

        return [
            'success' => true,
            'message' => "Imported {$count} review(s) from sample payload.",
            'reviews_upserted' => $count,
        ];
    }

    /**
     * @return array{success: bool, message: string}
     */
    public function publishOwnerReply(GoogleReview $review, string $comment): array
    {
        $comment = trim($comment);
        if ($comment === '') {
            return ['success' => false, 'message' => 'Reply text is empty.'];
        }

        if (! $review->google_review_id) {
            return ['success' => false, 'message' => 'This review has no Google review id. Sync from Business Profile first.'];
        }

        $accessToken = $this->oauth->getAccessToken();
        if (! $accessToken) {
            return ['success' => false, 'message' => 'Google is not connected.'];
        }

        $accountId = (string) config('services.google_business.account_id');
        $locationId = (string) config('services.google_business.location_id');
        $base = rtrim((string) config('services.google_business.reviews_api_url'), '/');
        $reviewId = $review->google_review_id;

        $url = "{$base}/accounts/{$accountId}/locations/{$locationId}/reviews/{$reviewId}/reply";

        try {
            $response = Http::timeout(30)
                ->withToken($accessToken)
                ->acceptJson()
                ->put($url, ['comment' => $comment]);

            if (! $response->successful()) {
                $message = $response->json('error.message') ?? $response->body();

                return [
                    'success' => false,
                    'message' => 'Google reply error: '.Str::limit((string) $message, 500),
                ];
            }

            $body = $response->json();
            $replyComment = is_array($body)
                ? (string) (data_get($body, 'comment') ?? $comment)
                : $comment;
            $replyAt = $this->parseTime(data_get($body, 'updateTime'));

            $review->owner_reply = $replyComment;
            $review->owner_reply_at = $replyAt ?? now();
            $review->save();

            return ['success' => true, 'message' => 'Reply published to Google.'];
        } catch (Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * @param  array<string, mixed>  $review
     */
    private function upsertBusinessReview(GooglePlace $place, array $review): bool
    {
        $reviewId = (string) (data_get($review, 'reviewId') ?? '');
        if ($reviewId === '') {
            return false;
        }

        $fingerprint = hash('sha256', 'google_business|'.$reviewId);
        $reviewer = data_get($review, 'reviewer', []);
        $authorName = is_array($reviewer)
            ? (string) (data_get($reviewer, 'displayName') ?? 'Google user')
            : 'Google user';
        $photoUrl = is_array($reviewer)
            ? data_get($reviewer, 'profilePhotoUrl')
            : null;

        $publishedAt = $this->parseTime(data_get($review, 'createTime') ?? data_get($review, 'updateTime'));
        $comment = data_get($review, 'comment');
        $comment = is_string($comment) ? trim($comment) : null;

        $replyBlock = data_get($review, 'reviewReply');
        $ownerReply = null;
        $ownerReplyAt = null;
        if (is_array($replyBlock)) {
            $ownerReply = data_get($replyBlock, 'comment');
            $ownerReply = is_string($ownerReply) ? trim($ownerReply) : null;
            $ownerReplyAt = $this->parseTime(data_get($replyBlock, 'updateTime'));
        }

        $attrs = [
            'google_place_id' => $place->id,
            'google_review_id' => $reviewId,
            'author_name' => $authorName,
            'author_url' => null,
            'profile_photo_url' => is_string($photoUrl) ? trim($photoUrl) : null,
            'rating' => $this->starRatingToInt((string) data_get($review, 'starRating', '')),
            'review_text' => $comment === '' ? null : $comment,
            'language' => null,
            'published_at' => $publishedAt,
            'owner_reply' => $ownerReply === '' ? null : $ownerReply,
            'owner_reply_at' => $ownerReplyAt,
            'review_reply_url' => is_string(data_get($review, 'reviewReplyUrl'))
                ? trim((string) data_get($review, 'reviewReplyUrl'))
                : null,
            'imported_from_legacy' => false,
        ];

        $existing = GoogleReview::query()
            ->where('google_review_id', $reviewId)
            ->orWhere('source_fingerprint', $fingerprint)
            ->first();

        if ($existing) {
            $wasApproved = $existing->is_approved;
            $existing->fill($attrs);
            $existing->source_fingerprint = $fingerprint;
            $existing->is_approved = $wasApproved;
            $existing->save();
        } else {
            GoogleReview::query()->create(array_merge($attrs, [
                'source_fingerprint' => $fingerprint,
                'is_approved' => false,
            ]));
        }

        return true;
    }

    private function starRatingToInt(string $star): int
    {
        return match (strtoupper(trim($star))) {
            'ONE' => 1,
            'TWO' => 2,
            'THREE' => 3,
            'FOUR' => 4,
            'FIVE' => 5,
            default => 0,
        };
    }

    private function parseTime(mixed $value): ?Carbon
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