<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeAboutSection;
use App\Models\HomeDiningSection;
use App\Models\HomeDiningSlide;
use App\Models\HomeExperienceItem;
use App\Models\HomeExperienceSection;
use App\Models\HomeStayItem;
use App\Models\HomeStaysSection;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Schema;

class HomeSectionsPublicController extends Controller
{
    private function hasTable(string $table): bool
    {
        try {
            return Schema::hasTable($table);
        } catch (\Throwable) {
            return false;
        }
    }

    public function about()
    {
        if (! $this->hasTable('home_about_sections')) {
            return response()->json(['success' => true, 'data' => null]);
        }

        try {
            return response()->json([
                'success' => true,
                'data' => HomeAboutSection::singleton()->toPublicArray(),
            ]);
        } catch (QueryException) {
            return response()->json(['success' => true, 'data' => null]);
        }
    }

    public function experiences()
    {
        if (! $this->hasTable('home_experience_sections')) {
            return response()->json(['success' => true, 'data' => ['section' => null, 'items' => []]]);
        }

        try {
            $section = HomeExperienceSection::singleton()->toPublicArray();
            $items = HomeExperienceItem::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(fn (HomeExperienceItem $i) => $i->toPublicArray())
                ->values();

            return response()->json([
                'success' => true,
                'data' => ['section' => $section, 'items' => $items],
            ]);
        } catch (QueryException) {
            return response()->json(['success' => true, 'data' => ['section' => null, 'items' => []]]);
        }
    }

    public function stays()
    {
        if (! $this->hasTable('home_stays_sections')) {
            return response()->json(['success' => true, 'data' => ['section' => null, 'items' => []]]);
        }

        try {
            $section = HomeStaysSection::singleton()->toPublicArray();
            $items = HomeStayItem::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(fn (HomeStayItem $i) => $i->toPublicArray())
                ->values();

            return response()->json([
                'success' => true,
                'data' => ['section' => $section, 'items' => $items],
            ]);
        } catch (QueryException) {
            return response()->json(['success' => true, 'data' => ['section' => null, 'items' => []]]);
        }
    }

    public function dining()
    {
        if (! $this->hasTable('home_dining_sections')) {
            return response()->json(['success' => true, 'data' => ['section' => null, 'slides' => []]]);
        }

        try {
            $section = HomeDiningSection::singleton()->toPublicArray();
            $slides = HomeDiningSlide::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(fn (HomeDiningSlide $s) => $s->toPublicArray())
                ->values();

            return response()->json([
                'success' => true,
                'data' => ['section' => $section, 'slides' => $slides],
            ]);
        } catch (QueryException) {
            return response()->json(['success' => true, 'data' => ['section' => null, 'slides' => []]]);
        }
    }
}
