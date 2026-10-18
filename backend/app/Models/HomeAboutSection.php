<?php

namespace App\Models;

use App\Services\HomeMediaService;
use Illuminate\Database\Eloquent\Model;

class HomeAboutSection extends Model
{
    protected $table = 'home_about_sections';

    protected $fillable = [
        'heading_line_1',
        'heading_line_2',
        'heading_accent',
        'paragraph_1',
        'paragraph_2',
        'photo_left_name',
        'photo_left_path',
        'photo_center_name',
        'photo_center_path',
        'photo_right_name',
        'photo_right_path',
    ];

    public static function singleton(): self
    {
        return static::query()->firstOrCreate([], []);
    }

    /**
     * @return array<string, mixed>
     */
    public function toPublicArray(): array
    {
        $media = app(HomeMediaService::class);

        return [
            'heading_line_1' => $this->heading_line_1,
            'heading_line_2' => $this->heading_line_2,
            'heading_accent' => $this->heading_accent,
            'paragraph_1' => $this->paragraph_1,
            'paragraph_2' => $this->paragraph_2,
            'photo_left_url' => $media->publicUrl($this->photo_left_path),
            'photo_center_url' => $media->publicUrl($this->photo_center_path),
            'photo_right_url' => $media->publicUrl($this->photo_right_path),
        ];
    }
}
