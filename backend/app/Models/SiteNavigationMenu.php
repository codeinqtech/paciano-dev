<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteNavigationMenu extends Model
{
    protected $table = 'site_navigation_menu';

    protected $fillable = [
        'label',
        'url',
        'sort_order',
        'open_in_new_tab',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'open_in_new_tab' => 'boolean',
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
            'label' => $this->label,
            'url' => $this->url,
            'sort_order' => $this->sort_order,
            'open_in_new_tab' => (bool) $this->open_in_new_tab,
        ];
    }
}
