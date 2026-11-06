<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeStaysSection extends Model
{
    protected $table = 'home_stays_sections';

    protected $fillable = ['heading_main', 'heading_accent', 'intro_text'];

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
            'intro_text' => $this->intro_text,
        ];
    }
}
