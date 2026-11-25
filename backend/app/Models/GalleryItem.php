<?php

namespace App\Models;

use App\Services\HomeMediaService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GalleryItem extends Model
{
    protected $table = 'gallery_items';

    protected $fillable = [
        'gallery_category_id',
        'title',
        'alt_text',
        'image_path',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(GalleryCategory::class, 'gallery_category_id');
    }

    /**
     * @return array<string, mixed>
     */
    public function toPublicArray(): array
    {
        $media = app(HomeMediaService::class);
        $category = $this->relationLoaded('category') ? $this->category : $this->category()->first();

        return [
            'id' => $this->id,
            'category_id' => $this->gallery_category_id,
            'category_slug' => $category?->slug,
            'category_label' => $category?->label,
            'title' => $this->title,
            'alt_text' => $this->alt_text,
            'image_url' => $media->publicUrl($this->image_path),
            'sort_order' => $this->sort_order,
        ];
    }
}