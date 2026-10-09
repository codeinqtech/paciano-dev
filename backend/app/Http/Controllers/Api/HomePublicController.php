<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeBannerSlide;
use App\Models\HomeLocationSetting;
use App\Models\HomeReviewVideo;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Schema;

class HomePublicController extends Controller
{
    public function bannerSlides()
    {
        if (! $this->homeTablesReady()) {
            return response()->json(['success' => true, 'data' => []]);
        }

        try {
            $slides = HomeBannerSlide::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(fn (HomeBannerSlide $s) => $s->toPublicArray())
                ->values();

            return response()->json(['success' => true, 'data' => $slides]);
        } catch (QueryException) {
            return response()->json(['success' => true, 'data' => []]);
        }
    }

    public function location()
    {
        if (! $this->homeTablesReady()) {
            return response()->json(['success' => true, 'data' => null]);
        }

        try {
            $row = HomeLocationSetting::singleton();
            if (! $row->is_active) {
                return response()->json(['success' => true, 'data' => null]);
            }

            return response()->json(['success' => true, 'data' => $row->toPublicArray()]);
        } catch (QueryException) {
            return response()->json(['success' => true, 'data' => null]);
        }
    }

    public function reviewVideos()
    {
        if (! $this->homeTablesReady()) {
            return response()->json(['success' => true, 'data' => []]);
        }

        try {
            $items = HomeReviewVideo::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(fn (HomeReviewVideo $v) => $v->toPublicArray())
                ->values();

            return response()->json(['success' => true, 'data' => $items]);
        } catch (QueryException) {
            return response()->json(['success' => true, 'data' => []]);
        }
    }

    private function homeTablesReady(): bool
    {
        return Schema::hasTable('home_banner_slides')
            && Schema::hasTable('home_location_settings')
            && Schema::hasTable('home_review_videos');
    }
}
