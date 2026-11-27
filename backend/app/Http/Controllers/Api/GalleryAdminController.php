<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryCategory;
use App\Models\GalleryItem;
use App\Models\GalleryPage;
use App\Models\User;
use App\Services\HomeMediaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class GalleryAdminController extends Controller
{
    public function show(Request $request)
    {
        $this->ensurePermission($request);

        if (! Schema::hasTable('gallery_pages')) {
            return response()->json(['success' => true, 'data' => null]);
        }

        $payload = app(GalleryPublicController::class)->content()->getData(true);

        return response()->json([
            'success' => true,
            'data' => $payload['data'] ?? null,
        ]);
    }

    public function updatePage(Request $request)
    {
        $this->ensurePermission($request);

        $data = $request->validate([
            'hero_eyebrow' => ['nullable', 'string', 'max:120'],
            'hero_title' => ['nullable', 'string', 'max:200'],
            'hero_subtitle' => ['nullable', 'string', 'max:500'],
            'moments_eyebrow' => ['nullable', 'string', 'max:120'],
            'all_moments_label' => ['nullable', 'string', 'max:120'],
        ]);

        $page = GalleryPage::singleton();
        $page->fill($data);

        if ($request->hasFile('hero_banner')) {
            $stored = app(HomeMediaService::class)->storeGalleryImage(
                $request->file('hero_banner'),
                'banner',
            );
            $page->hero_banner_path = $stored['file_path'];
        }

        if ($request->hasFile('closing_image')) {
            $stored = app(HomeMediaService::class)->storeGalleryImage(
                $request->file('closing_image'),
                'closing',
            );
            $page->closing_image_path = $stored['file_path'];
        }

        $page->save();

        return response()->json([
            'success' => true,
            'data' => $page->fresh()->toPublicArray(),
        ]);
    }

    public function storeCategory(Request $request)
    {
        $this->ensurePermission($request);

        $data = $request->validate([
            'label' => ['required', 'string', 'max:120'],
            'icon_prefix' => ['nullable', 'string', 'max:16'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $baseSlug = Str::slug($data['label']);
        if ($baseSlug === '') {
            $baseSlug = 'category';
        }

        $slug = $baseSlug;
        $n = 2;
        while (GalleryCategory::query()->where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$n;
            $n++;
        }

        $sortOrder = $data['sort_order']
            ?? ((int) GalleryCategory::query()->max('sort_order')) + 10;

        $category = GalleryCategory::query()->create([
            'slug' => $slug,
            'label' => $data['label'],
            'icon_prefix' => $data['icon_prefix'] ?? null,
            'sort_order' => $sortOrder,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'data' => $category->fresh()->toPublicArray(),
        ], 201);
    }

    public function updateCategory(Request $request, int $id)
    {
        $this->ensurePermission($request);

        $category = GalleryCategory::query()
            ->where('is_active', true)
            ->findOrFail($id);

        $data = $request->validate([
            'label' => ['sometimes', 'string', 'max:120'],
            'icon_prefix' => ['nullable', 'string', 'max:16'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $category->fill($data);
        $category->save();

        return response()->json([
            'success' => true,
            'data' => $category->fresh()->toPublicArray(),
        ]);
    }

    public function destroyCategory(Request $request, int $id)
    {
        $this->ensurePermission($request);

        $category = GalleryCategory::query()
            ->where('is_active', true)
            ->findOrFail($id);

        $category->is_active = false;
        $category->save();

        return response()->json(['success' => true]);
    }

    public function storeItems(Request $request)
    {
        $this->ensurePermission($request);

        $data = $request->validate([
            'gallery_category_id' => ['required', 'integer', 'exists:gallery_categories,id'],
            'image' => ['required', 'file', 'image', 'max:5120'],
            'title' => ['required', 'string', 'max:200'],
            'alt_text' => ['nullable', 'string', 'max:300'],
        ]);

        $categoryId = (int) $data['gallery_category_id'];
        $baseSort = (int) GalleryItem::query()
            ->where('gallery_category_id', $categoryId)
            ->max('sort_order');

        $stored = app(HomeMediaService::class)->storeGalleryImage(
            $request->file('image'),
            'items',
        );

        $item = GalleryItem::query()->create([
            'gallery_category_id' => $categoryId,
            'title' => $data['title'],
            'alt_text' => $data['alt_text'] ?? null,
            'image_path' => $stored['file_path'],
            'sort_order' => $baseSort + 1,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'data' => $item->fresh()->load('category')->toPublicArray(),
        ], 201);
    }

    public function updateItem(Request $request, int $id)
    {
        $this->ensurePermission($request);

        $item = GalleryItem::query()->where('is_active', true)->findOrFail($id);

        $data = $request->validate([
            'gallery_category_id' => ['sometimes', 'integer', 'exists:gallery_categories,id'],
            'title' => ['nullable', 'string', 'max:200'],
            'alt_text' => ['nullable', 'string', 'max:300'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $item->fill($data);

        if ($request->hasFile('image')) {
            $stored = app(HomeMediaService::class)->storeGalleryImage(
                $request->file('image'),
                'items',
            );
            $item->image_path = $stored['file_path'];
        }

        $item->save();

        return response()->json([
            'success' => true,
            'data' => $item->fresh()->load('category')->toPublicArray(),
        ]);
    }

    public function destroyItem(Request $request, int $id)
    {
        $this->ensurePermission($request);

        $item = GalleryItem::query()->where('is_active', true)->findOrFail($id);
        $item->is_active = false;
        $item->save();

        return response()->json(['success' => true]);
    }

    private function ensurePermission(Request $request): void
    {
        /** @var User|null $user */
        $user = $request->user();
        if (! $user) {
            abort(401);
        }
        if (! $user->isSuperAdmin() && ! $user->hasMenuPermission('gallery')) {
            abort(403, 'You do not have permission to manage gallery content.');
        }
    }
}