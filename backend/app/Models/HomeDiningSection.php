<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeDiningSection extends Model
{
    protected $table = 'home_dining_sections';

    protected $fillable = [
        'heading_line_1',
        'heading_line_2',
        'heading_accent',
        'description',
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
            'heading_line_1' => $this->heading_line_1,
            'heading_line_2' => $this->heading_line_2,
            'heading_accent' => $this->heading_accent,
            'description' => $this->description,
        ];
    }
}
