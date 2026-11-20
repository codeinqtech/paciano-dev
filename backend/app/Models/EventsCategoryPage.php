<?php

namespace App\Models;

use App\Services\HomeMediaService;
use Illuminate\Database\Eloquent\Model;

class EventsCategoryPage extends Model
{
    protected $table = 'events_category_pages';

    protected $fillable = [
        'slug',
        'hero_event_type',
        'hero_title_line1',
        'hero_title_line2',
        'hero_description',
        'hero_image_path',
        'hero_cta_text',
        'hero_cta_href',
        'advantage_eyebrow',
        'advantage_title_line1',
        'advantage_title_line2',
        'advantage_description',
        'venues_eyebrow',
        'venues_title1',
        'venues_title2',
        'venues_description',
    ];

    public static function forSlug(string $slug): self
    {
        return static::query()->firstOrCreate(
            ['slug' => $slug],
            ['slug' => $slug],
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toPublicArray(): array
    {
        $media = app(HomeMediaService::class);

        return [
            'slug' => $this->slug,
            'hero' => [
                'event_type' => $this->hero_event_type,
                'title_line1' => $this->hero_title_line1,
                'title_line2' => $this->hero_title_line2,
                'description' => $this->hero_description,
                'image_url' => $media->publicUrl($this->hero_image_path),
                'cta_text' => $this->hero_cta_text,
                'cta_href' => $this->hero_cta_href,
            ],
            'advantage' => [
                'eyebrow' => $this->advantage_eyebrow,
                'title_line1' => $this->advantage_title_line1,
                'title_line2' => $this->advantage_title_line2,
                'description' => $this->advantage_description,
            ],
            'venues' => [
                'eyebrow' => $this->venues_eyebrow,
                'title1' => $this->venues_title1,
                'title2' => $this->venues_title2,
                'description' => $this->venues_description,
            ],
        ];
    }
}