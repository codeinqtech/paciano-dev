<?php

namespace App\Models;

use App\Services\HomeMediaService;
use Illuminate\Database\Eloquent\Model;

class GalleryPage extends Model
{
    protected $table = 'gallery_pages';

    protected $fillable = [
        'hero_eyebrow',
        'hero_title',
        'hero_subtitle',
        'hero_banner_path',
        'moments_eyebrow',
        'all_moments_label',
        'closing_image_path',
    ];

    public static function singleton(): self
    {
        return static::query()->firstOrCreate(
            ['id' => 1],
            [
                'hero_eyebrow' => 'Gallery',
                'hero_title' => 'Moments at Paciano',
                'all_moments_label' => 'All Moments',
            ],
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toPublicArray(): array
    {
        $media = app(HomeMediaService::class);

        return [
            'hero_eyebrow' => $this->hero_eyebrow,
            'hero_title' => $this->hero_title,
            'hero_subtitle' => $this->hero_subtitle,
            'hero_banner_url' => $media->publicUrl($this->hero_banner_path),
            'moments_eyebrow' => $this->moments_eyebrow,
            'all_moments_label' => $this->all_moments_label,
            'closing_image_url' => $media->publicUrl($this->closing_image_path),
        ];
    }
}