<?php

namespace Database\Seeders;

use App\Models\SiteNavigationMenu;
use Illuminate\Database\Seeder;

class SiteNavigationMenuSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['label' => 'Stay', 'url' => '/stay', 'sort_order' => 10],
            ['label' => 'Experiences', 'url' => '#experiences', 'sort_order' => 20],
            ['label' => 'Dining', 'url' => '#dining', 'sort_order' => 30],
            ['label' => 'About Us', 'url' => '#about', 'sort_order' => 40],
            ['label' => 'Contact', 'url' => '/contact', 'sort_order' => 50],
        ];

        foreach ($items as $row) {
            SiteNavigationMenu::query()->updateOrCreate(
                ['label' => $row['label'], 'url' => $row['url']],
                [
                    'sort_order' => $row['sort_order'],
                    'open_in_new_tab' => false,
                    'is_active' => true,
                ],
            );
        }
    }
}
