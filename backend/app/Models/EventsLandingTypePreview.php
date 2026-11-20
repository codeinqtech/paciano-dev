<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventsLandingTypePreview extends Model
{
    protected $table = 'events_landing_type_previews';

    protected $fillable = [
        'slug',
        'eyebrow',
        'title_main',
        'title_accent',
        'description',
    ];

    /**
     * @return array<string, mixed>
     */
    public function toPublicArray(): array
    {
        return [
            'slug' => $this->slug,
            'eyebrow' => $this->eyebrow,
            'title_main' => $this->title_main,
            'title_accent' => $this->title_accent,
            'description' => $this->description,
        ];
    }
}