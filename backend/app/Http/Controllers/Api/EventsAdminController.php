<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EventsCategoryExperienceItem;
use App\Models\EventsCategoryPage;
use App\Models\EventsCategoryVenueItem;
use App\Models\EventsLanding;
use App\Models\EventsLandingAdvantageSlide;
use App\Models\EventsLandingTypePreview;
use App\Models\User;
use App\Services\HomeMediaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class EventsAdminController extends Controller
{
    /** @var list<string> */
    public const EXPERIENCE_ICON_KEYS = [
        'users',
        'users-round',
        'presentation',
        'chart',
        'calendar',
        'heart',
        'handshake',
        'flower',
        'sparkles',
        'landmark',
    ];

    public function show(Request $request)
    {
        $this->ensurePermission($request);

        if (! Schema::hasTable('events_landings')) {
            return response()->json(['success' => true, 'data' => null]);
        }

        $payload = app(EventsPublicController::class)->content()->getData(true);

        return response()->json([
            'success' => true,
            'data' => $payload['data'] ?? null,
        ]);
    }

    public function updateLanding(Request $request)
    {
        $this->ensurePermission($request);

        $data = $request->validate([
            'hero_kicker' => ['nullable', 'string', 'max:120'],
            'hero_title_main' => ['nullable', 'string', 'max:200'],
            'hero_title_accent' => ['nullable', 'string', 'max:200'],
            'hero_description' => ['nullable', 'string', 'max:5000'],
        ]);

        $landing = EventsLanding::singleton();
        $landing->fill($data);

        if ($request->hasFile('hero_banner')) {
            $stored = app(HomeMediaService::class)->storeEventImage(
                $request->file('hero_banner'),
                'landing',
            );
            $landing->hero_banner_path = $stored['file_path'];
        }

        $landing->save();

        return response()->json([
            'success' => true,
            'data' => $landing->fresh()->toPublicArray(),
        ]);
    }

    public function updateTypePreview(Request $request, string $slug)
    {
        $this->ensurePermission($request);

        if (! in_array($slug, ['corporate', 'wedding'], true)) {
            abort(404);
        }

        $data = $request->validate([
            'eyebrow' => ['nullable', 'string', 'max:120'],
            'title_main' => ['nullable', 'string', 'max:200'],
            'title_accent' => ['nullable', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:5000'],
        ]);

        $row = EventsLandingTypePreview::query()->updateOrCreate(
            ['slug' => $slug],
            $data,
        );

        return response()->json(['success' => true, 'data' => $row->toPublicArray()]);
    }

    public function storeAdvantageSlide(Request $request)
    {
        $this->ensurePermission($request);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:2000'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $slide = EventsLandingAdvantageSlide::query()->create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => true,
        ]);

        if ($request->hasFile('image')) {
            $stored = app(HomeMediaService::class)->storeEventImage($request->file('image'), 'advantage');
            $slide->image_path = $stored['file_path'];
            $slide->save();
        }

        return response()->json(['success' => true, 'data' => $slide->fresh()->toPublicArray()], 201);
    }

    public function updateAdvantageSlide(Request $request, int $id)
    {
        $this->ensurePermission($request);

        $slide = EventsLandingAdvantageSlide::query()->where('is_active', true)->findOrFail($id);

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:2000'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $slide->fill($data);

        if ($request->hasFile('image')) {
            $stored = app(HomeMediaService::class)->storeEventImage($request->file('image'), 'advantage');
            $slide->image_path = $stored['file_path'];
        }

        $slide->save();

        return response()->json(['success' => true, 'data' => $slide->fresh()->toPublicArray()]);
    }

    public function destroyAdvantageSlide(Request $request, int $id)
    {
        $this->ensurePermission($request);

        $slide = EventsLandingAdvantageSlide::query()->findOrFail($id);
        $slide->update(['is_active' => false]);

        return response()->json(['success' => true]);
    }

    public function updateCategoryPage(Request $request, string $slug)
    {
        $this->ensurePermission($request);

        if (! in_array($slug, ['corporate', 'wedding'], true)) {
            abort(404);
        }

        $data = $request->validate([
            'hero_event_type' => ['nullable', 'string', 'max:120'],
            'hero_title_line1' => ['nullable', 'string', 'max:200'],
            'hero_title_line2' => ['nullable', 'string', 'max:200'],
            'hero_description' => ['nullable', 'string', 'max:5000'],
            'hero_cta_text' => ['nullable', 'string', 'max:120'],
            'hero_cta_href' => ['nullable', 'string', 'max:300'],
            'advantage_eyebrow' => ['nullable', 'string', 'max:120'],
            'advantage_title_line1' => ['nullable', 'string', 'max:200'],
            'advantage_title_line2' => ['nullable', 'string', 'max:200'],
            'advantage_description' => ['nullable', 'string', 'max:5000'],
            'venues_eyebrow' => ['nullable', 'string', 'max:120'],
            'venues_title1' => ['nullable', 'string', 'max:200'],
            'venues_title2' => ['nullable', 'string', 'max:200'],
            'venues_description' => ['nullable', 'string', 'max:5000'],
        ]);

        $page = EventsCategoryPage::forSlug($slug);
        $page->fill($data);

        if ($request->hasFile('hero_image')) {
            $stored = app(HomeMediaService::class)->storeEventImage($request->file('hero_image'), $slug.'-hero');
            $page->hero_image_path = $stored['file_path'];
        }

        $page->save();

        return response()->json(['success' => true, 'data' => $page->fresh()->toPublicArray()]);
    }

    public function storeExperienceItem(Request $request, string $slug)
    {
        $this->ensurePermission($request);

        if (! in_array($slug, ['corporate', 'wedding'], true)) {
            abort(404);
        }

        $data = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:2000'],
            'icon_key' => ['required', 'string', 'in:'.implode(',', self::EXPERIENCE_ICON_KEYS)],
            'show_on_landing' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'image' => ['nullable', 'file', 'image', 'max:5120'],
        ]);

        $sortOrder = $data['sort_order']
            ?? ((int) EventsCategoryExperienceItem::query()
                ->where('category_slug', $slug)
                ->max('sort_order')) + 10;

        $showOnLanding = (bool) ($data['show_on_landing'] ?? false);

        if ($showOnLanding) {
            EventsCategoryExperienceItem::query()
                ->where('category_slug', $slug)
                ->update(['show_on_landing' => false]);
        }

        $item = EventsCategoryExperienceItem::query()->create([
            'category_slug' => $slug,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'icon_key' => $data['icon_key'],
            'show_on_landing' => $showOnLanding,
            'sort_order' => $sortOrder,
            'is_active' => true,
        ]);

        if ($request->hasFile('image')) {
            $stored = app(HomeMediaService::class)->storeEventImage(
                $request->file('image'),
                $slug.'-experience',
            );
            $item->image_path = $stored['file_path'];
            $item->save();
        }

        return response()->json([
            'success' => true,
            'data' => $item->fresh()->toPublicArray(),
        ], 201);
    }

    public function updateExperienceItem(Request $request, string $slug, int $id)
    {
        $this->ensurePermission($request);

        $item = EventsCategoryExperienceItem::query()
            ->where('category_slug', $slug)
            ->where('is_active', true)
            ->findOrFail($id);

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:2000'],
            'icon_key' => ['nullable', 'string', 'in:'.implode(',', self::EXPERIENCE_ICON_KEYS)],
            'show_on_landing' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        if (! empty($data['show_on_landing'])) {
            EventsCategoryExperienceItem::query()
                ->where('category_slug', $slug)
                ->where('id', '!=', $id)
                ->update(['show_on_landing' => false]);
        }

        $item->fill($data);

        if ($request->hasFile('image')) {
            $stored = app(HomeMediaService::class)->storeEventImage($request->file('image'), $slug.'-experience');
            $item->image_path = $stored['file_path'];
        }

        $item->save();

        return response()->json(['success' => true, 'data' => $item->fresh()->toPublicArray()]);
    }

    public function destroyExperienceItem(Request $request, string $slug, int $id)
    {
        $this->ensurePermission($request);

        $item = EventsCategoryExperienceItem::query()
            ->where('category_slug', $slug)
            ->where('is_active', true)
            ->findOrFail($id);

        $item->update(['is_active' => false]);

        return response()->json(['success' => true]);
    }

    public function storeVenueItem(Request $request, string $slug)
    {
        $this->ensurePermission($request);

        if (! in_array($slug, ['corporate', 'wedding'], true)) {
            abort(404);
        }

        $data = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:2000'],
            'capacity' => ['nullable', 'string', 'max:120'],
            'setup' => ['nullable', 'string', 'max:120'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'image' => ['nullable', 'file', 'image', 'max:5120'],
        ]);

        $sortOrder = $data['sort_order']
            ?? ((int) EventsCategoryVenueItem::query()
                ->where('category_slug', $slug)
                ->max('sort_order')) + 10;

        $item = EventsCategoryVenueItem::query()->create([
            'category_slug' => $slug,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'capacity' => $data['capacity'] ?? null,
            'setup' => $data['setup'] ?? null,
            'sort_order' => $sortOrder,
            'is_active' => true,
        ]);

        if ($request->hasFile('image')) {
            $stored = app(HomeMediaService::class)->storeEventImage(
                $request->file('image'),
                $slug.'-venue',
            );
            $item->image_path = $stored['file_path'];
            $item->save();
        }

        return response()->json([
            'success' => true,
            'data' => $item->fresh()->toPublicArray(),
        ], 201);
    }

    public function updateVenueItem(Request $request, string $slug, int $id)
    {
        $this->ensurePermission($request);

        $item = EventsCategoryVenueItem::query()
            ->where('category_slug', $slug)
            ->where('is_active', true)
            ->findOrFail($id);

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:2000'],
            'capacity' => ['nullable', 'string', 'max:120'],
            'setup' => ['nullable', 'string', 'max:120'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $item->fill($data);

        if ($request->hasFile('image')) {
            $stored = app(HomeMediaService::class)->storeEventImage($request->file('image'), $slug.'-venue');
            $item->image_path = $stored['file_path'];
        }

        $item->save();

        return response()->json(['success' => true, 'data' => $item->fresh()->toPublicArray()]);
    }

    public function destroyVenueItem(Request $request, string $slug, int $id)
    {
        $this->ensurePermission($request);

        $item = EventsCategoryVenueItem::query()
            ->where('category_slug', $slug)
            ->where('is_active', true)
            ->findOrFail($id);

        $item->update(['is_active' => false]);

        return response()->json(['success' => true]);
    }

    private function ensurePermission(Request $request): void
    {
        /** @var User|null $user */
        $user = $request->user();
        if (! $user) {
            abort(401);
        }
        if (! $user->isSuperAdmin() && ! $user->hasMenuPermission('events')) {
            abort(403, 'You do not have permission to manage events content.');
        }
    }
}