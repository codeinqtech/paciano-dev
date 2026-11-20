<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EventsCategoryExperienceItem;
use App\Models\EventsCategoryPage;
use App\Models\EventsCategoryVenueItem;
use App\Models\EventsLanding;
use App\Models\EventsLandingAdvantageSlide;
use App\Models\EventsLandingTypePreview;
use Illuminate\Support\Facades\Schema;

class EventsPublicController extends Controller
{
    public function content()
    {
        if (! Schema::hasTable('events_landings')) {
            return response()->json(['success' => true, 'data' => null]);
        }

        $landing = EventsLanding::singleton()->toPublicArray();
        $previews = EventsLandingTypePreview::query()
            ->orderBy('id')
            ->get()
            ->map(fn (EventsLandingTypePreview $r) => $r->toPublicArray());

        $slides = EventsLandingAdvantageSlide::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (EventsLandingAdvantageSlide $s) => $s->toPublicArray());

        $categories = [];
        foreach (['corporate', 'wedding'] as $slug) {
            $categories[$slug] = $this->categoryPayload($slug);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'landing' => $landing,
                'type_previews' => $previews,
                'advantage_slides' => $slides,
                'categories' => $categories,
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function categoryPayload(string $slug): array
    {
        $page = EventsCategoryPage::forSlug($slug)->toPublicArray();

        $experience = EventsCategoryExperienceItem::query()
            ->where('category_slug', $slug)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (EventsCategoryExperienceItem $i) => $i->toPublicArray())
            ->values();

        $venues = EventsCategoryVenueItem::query()
            ->where('category_slug', $slug)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (EventsCategoryVenueItem $i) => $i->toPublicArray())
            ->values();

        $landingImage = $experience->firstWhere('show_on_landing', true);

        return [
            'page' => $page,
            'experience_items' => $experience,
            'venue_items' => $venues,
            'landing_preview_image_url' => $landingImage['image_url'] ?? null,
        ];
    }
}