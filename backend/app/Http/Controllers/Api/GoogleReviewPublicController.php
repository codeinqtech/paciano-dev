<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GooglePlace;
use App\Models\GoogleReview;
use Illuminate\Support\Facades\Schema;

class GoogleReviewPublicController extends Controller
{
    public function aboutReviews()
    {
        if (! Schema::hasTable('google_places') || ! Schema::hasTable('google_reviews')) {
            return response()->json([
                'success' => true,
                'data' => [
                    'place' => null,
                    'reviews' => [],
                ],
            ]);
        }

        $place = GooglePlace::forReviewQueries();

        $reviews = GoogleReview::query()
            ->where('google_place_id', $place->id)
            ->where('is_approved', true)
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn (GoogleReview $r) => $r->toPublicArray());

        return response()->json([
            'success' => true,
            'data' => [
                'place' => $place->toPublicSummary(),
                'reviews' => $reviews,
            ],
        ]);
    }
}
