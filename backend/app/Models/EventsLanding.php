<?php

namespace App\Models;

use App\Services\HomeMediaService;
use Illuminate\Database\Eloquent\Model;

class EventsLanding extends Model
{
    protected $table = 'events_landings';

    protected $fillable = [
        'hero_kicker',
        'hero_title_main',
        'hero_title_accent',
        'hero_description',
        'hero_banner_path',
    ];

    public static function singleton(): self
    {
        return static::query()->firstOrCreate(
            ['id' => 1],
            [
                'hero_kicker' => 'Events at Paciano',
                'hero_title_main' => 'Celebrate In',
                'hero_title_accent' => "Nature's Embrace.",
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
            'hero_kicker' => $this->hero_kicker,
            'hero_title_main' => $this->hero_title_main,
            'hero_title_accent' => $this->hero_title_accent,
            'hero_description' => $this->hero_description,
            'hero_banner_url' => $media->publicUrl($this->hero_banner_path),
        ];
    }
}