<?php

namespace App\Models;

use App\Services\HomeMediaService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class AboutExperienceItem extends Model
{
    public function getTable()
    {
        if (Schema::hasTable('about_experience_items')) {
            return 'about_experience_items';
        }

        return 'home_experience_items';
    }

    protected $fillable = [
        'title',
        'description',
        'image_name',
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

    /**
     * @return array<string, mixed>
     */
    public function toPublicArray(): array
    {
        $media = app(HomeMediaService::class);

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'image_url' => $media->publicUrl($this->image_path),
            'sort_order' => $this->sort_order,
        ];
    }
}
