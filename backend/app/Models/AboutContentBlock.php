<?php

namespace App\Models;

use App\Services\HomeMediaService;
use Illuminate\Database\Eloquent\Model;

class AboutContentBlock extends Model
{
    protected $table = 'about_content_blocks';

    protected $fillable = [
        'section_key',
        'eyebrow',
        'heading_line_1',
        'heading_line_2',
        'heading_accent',
        'body_text',
        'image_name',
        'image_path',
    ];

    public static function forKey(string $key): self
    {
        return static::query()->firstOrCreate(
            ['section_key' => $key],
            [],
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toPublicArray(): array
    {
        $media = app(HomeMediaService::class);

        return [
            'section_key' => $this->section_key,
            'eyebrow' => $this->eyebrow,
            'heading_line_1' => $this->heading_line_1,
            'heading_line_2' => $this->heading_line_2,
            'heading_accent' => $this->heading_accent,
            'body_text' => $this->body_text,
            'image_url' => $media->publicUrl($this->image_path),
        ];
    }
}
