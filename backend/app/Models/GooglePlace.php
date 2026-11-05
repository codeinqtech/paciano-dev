<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GooglePlace extends Model
{
    protected $fillable = [
        'place_id',
        'display_name',
        'rating',
        'user_rating_count',
        'maps_url',
        'photo_url',
        'last_synced_at',
        'last_sync_error',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'float',
            'user_rating_count' => 'integer',
            'last_synced_at' => 'datetime',
        ];
    }

    public static function forConfiguredPlace(): self
    {
        $placeId = (string) config('google_places.place_id');

        return static::query()->firstOrCreate(
            ['place_id' => $placeId],
            [
                'display_name' => 'Paciano',
                'maps_url' => 'https://maps.google.com/?cid=9097691192082573723',
            ],
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toPublicSummary(): array
    {
        return [
            'place_id' => $this->place_id,
            'display_name' => $this->display_name,
            'rating' => $this->rating,
            'user_rating_count' => $this->user_rating_count,
            'maps_url' => $this->maps_url,
            'last_synced_at' => $this->last_synced_at?->toIso8601String(),
        ];
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(GoogleReview::class);
    }
}
