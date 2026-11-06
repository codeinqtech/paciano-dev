<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteFooter extends Model
{
    protected $table = 'site_footer';

    protected $fillable = [
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
        'social_links',
        'location_info',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'map_latitude' => 'float',
            'map_longitude' => 'float',
            'social_links' => 'array',
            'location_info' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public static function singleton(): self
    {
        $row = static::query()->orderBy('id')->first();

        if ($row) {
            return $row;
        }

        return static::query()->create([
            'social_links' => [],
            'location_info' => [],
            'is_active' => true,
        ]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function activeSocialLinks(): array
    {
        return $this->sortedActiveItems($this->social_links ?? []);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function activeLocationInfo(): array
    {
        return $this->sortedActiveItems($this->location_info ?? []);
    }

    /**
     * @param  list<array<string, mixed>>  $items
     * @return list<array<string, mixed>>
     */
    private function sortedActiveItems(array $items): array
    {
        $active = array_values(array_filter($items, fn ($item) => ($item['is_active'] ?? true) !== false));

        usort($active, function ($a, $b) {
            $order = ($a['sort_order'] ?? 0) <=> ($b['sort_order'] ?? 0);
            if ($order !== 0) {
                return $order;
            }

            return ($a['id'] ?? 0) <=> ($b['id'] ?? 0);
        });

        return $active;
    }

    /**
     * @param  list<array<string, mixed>>  $items
     */
    public function nextJsonItemId(array $items): int
    {
        $max = 0;
        foreach ($items as $item) {
            $max = max($max, (int) ($item['id'] ?? 0));
        }

        return $max + 1;
    }
}
