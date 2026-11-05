<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GooglePlace;
use App\Models\GoogleReview;
use App\Services\GooglePlacesSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class GoogleReviewAdminController extends Controller
{
    public function index(Request $request)
    {
        $this->ensurePermission($request);

        if (! Schema::hasTable('google_reviews')) {
            return response()->json([
                'success' => true,
                'data' => [
                    'place' => null,
                    'reviews' => [],
                    'stats' => [
                        'stored_count' => 0,
                        'approved_count' => 0,
                        'google_rating_count' => null,
                    ],
                    'api_configured' => app(GooglePlacesSyncService::class)->isConfigured(),
                ],
            ]);
        }

        $place = GooglePlace::forConfiguredPlace();

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
                'api_configured' => app(GooglePlacesSyncService::class)->isConfigured(),
            ],
        ]);
    }

    public function updateApproval(Request $request, int $id)
    {
        $this->ensurePermission($request);

        $data = $request->validate([
            'is_approved' => ['required', 'boolean'],
        ]);

        $place = GooglePlace::forConfiguredPlace();
        $review = GoogleReview::query()
            ->where('google_place_id', $place->id)
            ->findOrFail($id);

        $review->is_approved = (bool) $data['is_approved'];
        $review->save();

        return response()->json([
            'success' => true,
            'data' => $review->fresh()->toAdminArray(),
        ]);
    }

    public function sync(Request $request, GooglePlacesSyncService $sync)
    {
        $this->ensurePermission($request);

        $result = $sync->syncConfiguredPlace();

        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'],
            'data' => [
                'reviews_upserted' => $result['reviews_upserted'] ?? 0,
                'place' => GooglePlace::forConfiguredPlace()->fresh()?->toPublicSummary(),
            ],
        ], $result['success'] ? 200 : 422);
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
