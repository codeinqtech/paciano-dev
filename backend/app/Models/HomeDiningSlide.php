<?php

namespace App\Models;

use App\Services\HomeMediaService;
use Illuminate\Database\Eloquent\Model;

class HomeDiningSlide extends Model
{
    protected $table = 'home_dining_slides';

    protected $fillable = [
        'quote',
        'image_name',
        'image_path',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
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
            'quote' => $this->quote,
            'image_url' => $media->publicUrl($this->image_path),
            'sort_order' => $this->sort_order,
        ];
    }
}
