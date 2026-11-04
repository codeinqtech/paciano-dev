<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AboutValueItem extends Model
{
    protected $table = 'about_value_items';

    protected $fillable = [
        'title',
        'description',
        'icon_key',
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
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'icon_key' => $this->icon_key,
            'sort_order' => $this->sort_order,
        ];
    }
}
