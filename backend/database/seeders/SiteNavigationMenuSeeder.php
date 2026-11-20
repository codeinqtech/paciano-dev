<?php

namespace Database\Seeders;

use App\Models\SiteNavigationMenu;
use Illuminate\Database\Seeder;

class SiteNavigationMenuSeeder extends Seeder
{
    public function run(): void
    {
        $top = [
            ['label' => 'Stay', 'url' => '/stay', 'sort_order' => 10],
            ['label' => 'Dining', 'url' => '#dining', 'sort_order' => 20],
            ['label' => 'Events', 'url' => '/events', 'sort_order' => 30],
            ['label' => 'About Us', 'url' => '/about', 'sort_order' => 40],
            ['label' => 'Contact', 'url' => '/contact', 'sort_order' => 50],
        ];

        foreach ($top as $row) {
            SiteNavigationMenu::query()->updateOrCreate(
                ['label' => $row['label'], 'parent_id' => null],
                [
                    'url' => $row['url'],
                    'sort_order' => $row['sort_order'],
                    'open_in_new_tab' => false,
                    'is_active' => true,
                ],
            );
        }

        $events = SiteNavigationMenu::query()
            ->whereNull('parent_id')
            ->where('label', 'Events')
            ->first();

        if ($events) {
            $children = [
                [
                    'label' => 'Corporate Events',
                    'url' => '/events/corporate-events',
                    'sort_order' => 10,
                ],
                [
                    'label' => 'Weddings',
                    'url' => '/events/weddings',
                    'sort_order' => 20,
                ],
            ];

            foreach ($children as $row) {
                SiteNavigationMenu::query()->updateOrCreate(
                    [
                        'parent_id' => $events->id,
                        'label' => $row['label'],
                    ],
                    [
                        'url' => $row['url'],
                        'sort_order' => $row['sort_order'],
                        'open_in_new_tab' => false,
                        'is_active' => true,
                    ],
                );
            }
        }
    }
}