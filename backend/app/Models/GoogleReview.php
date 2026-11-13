<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoogleReview extends Model
{
    protected $fillable = [
        'google_place_id',
        'source_fingerprint',
        'author_name',
        'author_url',
        'profile_photo_url',
        'rating',
        'review_text',
        'language',
        'published_at',
        'owner_reply',
        'owner_reply_at',
        'photo_urls',
        'is_approved',
        'imported_from_legacy',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'published_at' => 'datetime',
            'owner_reply_at' => 'datetime',
            'photo_urls' => 'array',
            'is_approved' => 'boolean',
            'imported_from_legacy' => 'boolean',
        ];
    }

    public static function fingerprint(string $authorUrl, int $publishedUnix): string
    {
        return hash('sha256', trim($authorUrl).'|'.$publishedUnix);
    }

    public function place(): BelongsTo
    {
        return $this->belongsTo(GooglePlace::class, 'google_place_id');
    }

    /**
     * @return array<string, mixed>
     */
    public function toPublicArray(): array
    {
        return [
            'id' => $this->id,
            'author_name' => $this->author_name,
            'author_url' => $this->author_url,
            'profile_photo_url' => $this->profile_photo_url,
            'rating' => $this->rating,
            'review_text' => $this->review_text,
            'language' => $this->language,
            'published_at' => $this->published_at?->toIso8601String(),
            'owner_reply' => $this->owner_reply,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminArray(): array
    {
        return array_merge($this->toPublicArray(), [
            'is_approved' => $this->is_approved,
            'imported_from_legacy' => $this->imported_from_legacy,
            'owner_reply_at' => $this->owner_reply_at?->toIso8601String(),
            'photo_urls' => $this->photo_urls,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ]);
    }
}
