<?php

namespace App\Models;

use App\Services\HomeMediaService;
use Illuminate\Database\Eloquent\Model;

class HomeLocationSetting extends Model
{
    protected $table = 'home_location_settings';

    protected $fillable = [
        'eyebrow',
        'heading_primary',
        'heading_accent',
        'description',
        'landscape_image_name',
        'landscape_image_path',
        'feature_labels',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'feature_labels' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public static function singleton(): self
    {
        return static::query()->firstOrCreate([], [
            'is_active' => true,
            'feature_labels' => self::defaultFeatures(),
        ]);
    }

    /**
     * @return list<array{line1: string, line2: string}>
     */
    public static function defaultFeatures(): array
    {
        return [
            ['line1' => 'Scenic', 'line2' => 'Surroundings'],
            ['line1' => 'Easy', 'line2' => 'Access'],
            ['line1' => 'By The', 'line2' => 'River'],
            ['line1' => 'Wild', 'line2' => 'Retreat'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toPublicArray(): array
    {
        $media = app(HomeMediaService::class);

        return [
            'eyebrow' => $this->eyebrow,
            'heading_primary' => $this->heading_primary,
            'heading_accent' => $this->heading_accent,
            'description' => $this->description,
            'landscape_image_url' => $media->publicUrl($this->landscape_image_path),
            'feature_labels' => $this->feature_labels ?? self::defaultFeatures(),
        ];
    }
}
