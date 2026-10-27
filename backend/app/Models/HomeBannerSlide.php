<?php

namespace App\Models;

use App\Services\HomeMediaService;
use Illuminate\Database\Eloquent\Model;

class HomeBannerSlide extends Model
{
    protected $table = 'home_banner_slides';

    protected $fillable = [
        'media_type',
        'file_name',
        'file_path',
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
            'media_type' => $this->media_type,
            'url' => $media->publicUrl($this->file_path),
            'sort_order' => $this->sort_order,
        ];
    }
}
