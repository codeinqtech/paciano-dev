<?php

namespace Database\Seeders;

use App\Models\SiteFooter;
use Illuminate\Database\Seeder;

class SiteFooterSeeder extends Seeder
{
    public function run(): void
    {
        $address = 'Para: Banshbari, Vill: Manabari tea garden, Oodlabari, Ps: Malbazar, Dist: Jalpaiguri, State: West Bengal 735222';

        SiteFooter::query()->updateOrCreate(
            ['kind' => SiteFooter::KIND_SETTINGS],
            [
                'intro_paragraph' => 'A quiet retreat in the heart of Dooars, shaped by forest mornings, riverside stillness and the timeless rhythm of nature. Come away from the ordinary and return to what matters.',
                'map_address' => $address,
                'map_latitude' => 26.869761,
                'map_longitude' => 88.732941,
                'map_title' => 'Manabari, Oodlabari',
                'map_subtitle' => 'Jalpaiguri, West Bengal, India',
                'map_description' => 'A serene location at the edge of the Himalayas, perfectly connected yet wonderfully secluded.',
                'location_eyebrow' => 'Our Location',
                'location_heading' => 'Find Your Way Here',
                'location_subtitle' => 'Manabari Tea Garden, Oodlabari — Jalpaiguri, West Bengal',
                'location_description' => 'Tucked within the emerald foothills of the Eastern Himalayas, Paciano sits at Manabari tea garden near Oodlabari — accessible from Siliguri and Alipurduar, a journey as scenic as the destination itself.',
                'maps_link' => 'https://www.google.com/maps/search/?api=1&query='.rawurlencode('Manabari tea garden Oodlabari Malbazar 735222'),
                'is_active' => true,
            ],
        );

        $social = [
            ['platform' => 'instagram', 'url' => 'https://instagram.com/', 'sort_order' => 10],
            ['platform' => 'facebook', 'url' => 'https://facebook.com/', 'sort_order' => 20],
            ['platform' => 'youtube', 'url' => 'https://youtube.com/', 'sort_order' => 30],
            ['platform' => 'linkedin', 'url' => 'https://linkedin.com/', 'sort_order' => 40],
        ];

        foreach ($social as $row) {
            SiteFooter::query()->updateOrCreate(
                [
                    'kind' => SiteFooter::KIND_SOCIAL,
                    'platform' => $row['platform'],
                ],
                [
                    'url' => $row['url'],
                    'sort_order' => $row['sort_order'],
                    'is_active' => true,
                ],
            );
        }

        $locationInfo = [
            [
                'info_label' => 'Gorumara National Park',
                'info_value' => '12 km',
                'info_icon' => 'car',
                'sort_order' => 10,
            ],
            [
                'info_label' => 'Malbazar Railway Station',
                'info_value' => '18 km',
                'info_icon' => 'train',
                'sort_order' => 20,
            ],
            [
                'info_label' => 'Bagdogra Airport',
                'info_value' => '70 km',
                'info_icon' => 'plane',
                'sort_order' => 30,
            ],
        ];

        SiteFooter::query()
            ->where('kind', SiteFooter::KIND_LOCATION_INFO)
            ->whereNotIn('info_label', array_column($locationInfo, 'info_label'))
            ->update(['is_active' => false]);

        foreach ($locationInfo as $row) {
            SiteFooter::query()->updateOrCreate(
                [
                    'kind' => SiteFooter::KIND_LOCATION_INFO,
                    'info_label' => $row['info_label'],
                ],
                [
                    'info_value' => $row['info_value'],
                    'info_icon' => $row['info_icon'],
                    'sort_order' => $row['sort_order'],
                    'is_active' => true,
                ],
            );
        }
    }
}
