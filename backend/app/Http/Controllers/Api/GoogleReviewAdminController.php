<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GooglePlace;
use App\Models\GoogleReview;
use App\Services\GoogleBusinessOAuthService;
use App\Services\GoogleBusinessReviewsSyncService;
use App\Services\GoogleReviewsSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class GoogleReviewAdminController extends Controller
{
    public function index(
        Request $request,
        GoogleReviewsSyncService $sync,
        GoogleBusinessOAuthService $oauth,
    ) {
        $this->ensurePermission($request);

        $oauth->bootstrapFromEnvironment();

        if (! Schema::hasTable('google_reviews')) {
            return response()->json([
                'success' => true,
                'data' => $this->emptyIndexPayload($sync, $oauth),
            ]);
        }

        $place = GooglePlace::forReviewQueries();

        $reviewModels = GoogleReview::query()
            ->where('google_place_id', $place->id)
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->get();

        $reviews = $reviewModels->map(fn (GoogleReview $r) => $r->toAdminArray());

        return response()->json([
            'success' => true,
            'data' => [
                'place' => array_merge($place->toPublicSummary(), [
                    'last_sync_error' => $place->last_sync_error,
                ]),
                'reviews' => $reviews,
                'stats' => [
                    'stored_count' => $reviewModels->count(),
                    'approved_count' => $reviewModels->where('is_approved', true)->count(),
                    'google_rating_count' => $place->user_rating_count,
                ],
                'api_configured' => $sync->isConfigured(),
                'sync_mode' => $sync->syncMode(),
                'google_business_oauth' => [
                    'client_configured' => $oauth->isClientConfigured(),
                    'connected' => $oauth->isConnected(),
                ],
            ],
        ]);
    }

    public function update(
        Request $request,
        int $id,
        GoogleBusinessReviewsSyncService $business,
    ) {
        $this->ensurePermission($request);

        $data = $request->validate([
            'is_approved' => ['sometimes', 'boolean'],
            'owner_reply' => ['sometimes', 'nullable', 'string', 'max:4096'],
            'publish_reply_to_google' => ['sometimes', 'boolean'],
        ]);

        $place = GooglePlace::forReviewQueries();
        $review = GoogleReview::query()
            ->where('google_place_id', $place->id)
            ->findOrFail($id);

        if (array_key_exists('is_approved', $data)) {
            $review->is_approved = (bool) $data['is_approved'];
        }

        $publishReply = (bool) ($data['publish_reply_to_google'] ?? false);

        if (array_key_exists('owner_reply', $data)) {
            $replyText = $data['owner_reply'];
            if ($publishReply && is_string($replyText) && trim($replyText) !== '') {
                $result = $business->publishOwnerReply($review, $replyText);
                if (! $result['success']) {
                    return response()->json([
                        'success' => false,
                        'message' => $result['message'],
                    ], 422);
                }
            } elseif (is_string($replyText)) {
                $trimmed = trim($replyText);
                $review->owner_reply = $trimmed === '' ? null : $trimmed;
                if ($trimmed !== '') {
                    $review->owner_reply_at = now();
                }
            }
        }

        $review->save();

        return response()->json([
            'success' => true,
            'data' => $review->fresh()->toAdminArray(),
        ]);
    }

    public function sync(
        Request $request,
        GoogleReviewsSyncService $sync,
        GoogleBusinessOAuthService $oauth,
    ) {
        $this->ensurePermission($request);

        $oauth->bootstrapFromEnvironment();

        $result = $sync->sync();

        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'],
            'data' => [
                'reviews_upserted' => $result['reviews_upserted'] ?? 0,
                'sync_mode' => $result['sync_mode'] ?? $sync->syncMode(),
                'place' => GooglePlace::forConfiguredPlace()->fresh()?->toPublicSummary(),
            ],
        ], $result['success'] ? 200 : 422);
    }

    public function oauthStart(Request $request, GoogleBusinessOAuthService $oauth)
    {
        $this->ensurePermission($request);

        if (! $oauth->isClientConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI on the server.',
            ], 422);
        }

        $auth = $oauth->createAuthorizeUrl($request->user()?->id);

        return response()->json([
            'success' => true,
            'data' => [
                'authorize_url' => $auth['url'],
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function emptyIndexPayload(
        GoogleReviewsSyncService $sync,
        GoogleBusinessOAuthService $oauth,
    ): array {
        return [
            'place' => null,
            'reviews' => [],
            'stats' => [
                'stored_count' => 0,
                'approved_count' => 0,
                'google_rating_count' => null,
            ],
            'api_configured' => $sync->isConfigured(),
            'sync_mode' => $sync->syncMode(),
            'google_business_oauth' => [
                'client_configured' => $oauth->isClientConfigured(),
                'connected' => $oauth->isConnected(),
            ],
        ];
    }

    private function ensurePermission(Request $request): void
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }
        if (! $user->isSuperAdmin() && ! $user->hasMenuPermission('google_reviews')) {
            abort(403, 'You do not have permission to manage Google reviews.');
        }
    }
}