<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomePostcardsSetting extends Model
{
    protected $table = 'home_postcards_settings';

    protected $fillable = [
        'section_label',
        'heading_primary',
        'heading_accent',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public static function singleton(): self
    {
        return static::query()->firstOrCreate([], [
            'is_active' => true,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function toPublicArray(): array
    {
        return [
            'section_label' => $this->section_label,
            'heading_primary' => $this->heading_primary,
            'heading_accent' => $this->heading_accent,
            'description' => $this->description,
        ];
    }
}
