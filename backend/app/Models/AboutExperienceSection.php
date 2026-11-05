<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class AboutExperienceSection extends Model
{
    public function getTable()
    {
        if (Schema::hasTable('about_experience_sections')) {
            return 'about_experience_sections';
        }

        return 'home_experience_sections';
    }

    protected $fillable = [
        'heading_main',
        'heading_accent',
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
        return [
            'heading_main' => $this->heading_main,
            'heading_accent' => $this->heading_accent,
        ];
    }
}
