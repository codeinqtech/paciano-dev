<?php

namespace App\Models;

use App\Services\HomeMediaService;
use Illuminate\Database\Eloquent\Model;

class EventsCategoryExperienceItem extends Model
{
    protected $table = 'events_category_experience_items';

    protected $fillable = [
        'category_slug',
        'title',
        'description',
        'icon_key',
        'image_path',
        'show_on_landing',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'show_on_landing' => 'boolean',
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
            'icon_key' => $this->icon_key,
            'image_url' => $media->publicUrl($this->image_path),
            'show_on_landing' => $this->show_on_landing,
            'sort_order' => $this->sort_order,
        ];
    }
}