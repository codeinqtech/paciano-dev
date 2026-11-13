<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GooglePlace extends Model
{
    public const DEFAULT_PLACE_ID = 'ChIJ835SmFAR5DkRmylIBPB9QX4';

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

    public static function configuredPlaceId(): string
    {
        $placeId = trim((string) config('google_places.place_id'));

        return $placeId !== '' ? $placeId : self::DEFAULT_PLACE_ID;
    }

    public static function forConfiguredPlace(): self
    {
        return static::query()->firstOrCreate(
            ['place_id' => static::configuredPlaceId()],
            [
                'display_name' => 'Paciano',
                'maps_url' => 'https://maps.google.com/?cid=9097691192082573723',
            ],
        );
    }

    /**
     * Resolve the place row whose reviews should be shown in admin/public APIs.
     * Falls back to any place that already has seeded/synced reviews when the
     * configured place row is empty (e.g. legacy empty GOOGLE_PLACE_ID on staging).
     */
    public static function forReviewQueries(): self
    {
        $configured = static::forConfiguredPlace();

        if ($configured->reviews()->exists()) {
            return $configured;
        }

        $withReviews = static::query()
            ->withCount('reviews')
            ->orderByDesc('reviews_count')
            ->get()
            ->first(fn (self $place) => $place->reviews_count > 0);

        return $withReviews ?? $configured;
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
