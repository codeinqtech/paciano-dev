<?php

namespace App\Models;

use App\Services\HomeMediaService;
use Illuminate\Database\Eloquent\Model;

class EventsCategoryVenueItem extends Model
{
    protected $table = 'events_category_venue_items';

    protected $fillable = [
        'category_slug',
        'title',
        'description',
        'image_path',
        'capacity',
        'setup',
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

    /**
     * @return array<string, mixed>
     */
    public function toPublicArray(): array
    {
        $media = app(HomeMediaService::class);

        return [
            'id' => $this->id,
            'category_slug' => $this->category_slug,
            'title' => $this->title,
            'description' => $this->description,
            'image_url' => $media->publicUrl($this->image_path),
            'capacity' => $this->capacity,
            'setup' => $this->setup,
            'sort_order' => $this->sort_order,
        ];
    }
}