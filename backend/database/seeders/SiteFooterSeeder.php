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
            ['id' => 1],
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
                'social_links' => [
                    ['id' => 1, 'platform' => 'instagram', 'url' => 'https://instagram.com/', 'sort_order' => 10, 'is_active' => true],
                    ['id' => 2, 'platform' => 'facebook', 'url' => 'https://facebook.com/', 'sort_order' => 20, 'is_active' => true],
                    ['id' => 3, 'platform' => 'youtube', 'url' => 'https://youtube.com/', 'sort_order' => 30, 'is_active' => true],
                    ['id' => 4, 'platform' => 'linkedin', 'url' => 'https://linkedin.com/', 'sort_order' => 40, 'is_active' => true],
                ],
                'location_info' => [
                    ['id' => 1, 'info_label' => 'Gorumara National Park', 'info_value' => '12 km', 'info_icon' => 'car', 'sort_order' => 10, 'is_active' => true],
                    ['id' => 2, 'info_label' => 'Malbazar Railway Station', 'info_value' => '18 km', 'info_icon' => 'train', 'sort_order' => 20, 'is_active' => true],
                    ['id' => 3, 'info_label' => 'Bagdogra Airport', 'info_value' => '70 km', 'info_icon' => 'plane', 'sort_order' => 30, 'is_active' => true],
                ],
                'is_active' => true,
            ],
        );

        SiteFooter::query()->where('id', '!=', 1)->delete();
    }
}
