<?php

namespace App\Models;

use App\Services\HomeMediaService;
use Illuminate\Database\Eloquent\Model;

class HomeReviewVideo extends Model
{
    protected $table = 'home_review_videos';

    protected $fillable = [
        'reviewer_name',
        'location',
        'display_title',
        'thumbnail_name',
        'thumbnail_path',
        'video_name',
        'video_path',
        'upload_year',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'upload_year' => 'integer',
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
            'reviewer_name' => $this->reviewer_name,
            'location' => $this->location,
            'display_title' => $this->display_title,
            'thumbnail_url' => $media->publicUrl($this->thumbnail_path),
            'video_url' => $media->publicUrl($this->video_path),
            'sort_order' => $this->sort_order,
        ];
    }
}
