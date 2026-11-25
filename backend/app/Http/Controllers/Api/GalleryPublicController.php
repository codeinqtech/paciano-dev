<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryCategory;
use App\Models\GalleryItem;
use App\Models\GalleryPage;
use Illuminate\Support\Facades\Schema;

class GalleryPublicController extends Controller
{
    public function content()
    {
        if (! Schema::hasTable('gallery_pages')) {
            return response()->json(['success' => true, 'data' => null]);
        }

        $page = GalleryPage::singleton()->toPublicArray();

        $categories = GalleryCategory::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (GalleryCategory $c) => $c->toPublicArray());

        $items = GalleryItem::query()
            ->with('category')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (GalleryItem $i) => $i->toPublicArray());

        return response()->json([
            'success' => true,
            'data' => [
                'page' => $page,
                'categories' => $categories,
                'items' => $items,
            ],
        ]);
    }
}