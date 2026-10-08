<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteFooter extends Model
{
    public const KIND_SETTINGS = 'settings';

    public const KIND_SOCIAL = 'social';

    public const KIND_LOCATION_INFO = 'location_info';

    protected $table = 'site_footer';

    protected $fillable = [
        'kind',
        'intro_paragraph',
        'map_address',
        'map_latitude',
        'map_longitude',
        'map_title',
        'map_subtitle',
        'map_description',
        'location_eyebrow',
        'location_heading',
        'location_subtitle',
        'location_description',
        'maps_link',
        'platform',
        'url',
        'info_label',
        'info_value',
        'info_icon',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'map_latitude' => 'float',
            'map_longitude' => 'float',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
