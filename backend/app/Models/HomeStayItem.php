<?php

namespace App\Models;

use App\Services\HomeMediaService;
use Illuminate\Database\Eloquent\Model;

class HomeStayItem extends Model
{
    protected $table = 'home_stay_items';

    protected $fillable = [
        'slug',
        'title',
        'description',
        'photo_1_name',
        'photo_1_path',
        'photo_2_name',
        'photo_2_path',
        'photo_3_name',
        'photo_3_path',
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
            'slug' => $this->slug,
            'title' => $this->title,
            'description' => $this->description,
            'photo_1_url' => $media->publicUrl($this->photo_1_path),
            'photo_2_url' => $media->publicUrl($this->photo_2_path),
            'photo_3_url' => $media->publicUrl($this->photo_3_path),
            'sort_order' => $this->sort_order,
        ];
    }
}
