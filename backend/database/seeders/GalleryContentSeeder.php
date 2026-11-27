<?php

namespace Database\Seeders;

use App\Models\GalleryCategory;
use App\Models\GalleryItem;
use App\Models\GalleryPage;
use Illuminate\Database\Seeder;

class GalleryContentSeeder extends Seeder
{
    public function run(): void
    {
        GalleryPage::query()->updateOrCreate(
            ['id' => 1],
            [
                'hero_eyebrow' => 'Gallery',
                'hero_title' => 'Moments at Paciano',
                'hero_subtitle' => 'A Visual Journey of Stays, Celebrations and Experiences.',
                'moments_eyebrow' => 'Explore Our Moments',
                'all_moments_label' => 'All Moments',
            ],
        );

        $categories = [
            ['slug' => 'stays', 'label' => 'Stays', 'icon_prefix' => '⌂', 'sort_order' => 10],
            ['slug' => 'dining', 'label' => 'Dining', 'icon_prefix' => '♧', 'sort_order' => 20],
            ['slug' => 'celebrations', 'label' => 'Celebrations', 'icon_prefix' => '◇', 'sort_order' => 30],
            ['slug' => 'experiences', 'label' => 'Experiences', 'icon_prefix' => '⌁', 'sort_order' => 40],
            ['slug' => 'property', 'label' => 'Property', 'icon_prefix' => '♧', 'sort_order' => 50],
        ];

        $categoryIds = [];
        foreach ($categories as $row) {
            $cat = GalleryCategory::query()->updateOrCreate(
                ['slug' => $row['slug']],
                [
                    'label' => $row['label'],
                    'icon_prefix' => $row['icon_prefix'],
                    'sort_order' => $row['sort_order'],
                    'is_active' => true,
                ],
            );
            $categoryIds[$row['slug']] = $cat->id;
        }

        $items = [
            ['category' => 'celebrations', 'title' => 'Beautifully Celebrated', 'alt' => 'Beautiful celebrations at Paciano', 'sort' => 10],
            ['category' => 'stays', 'title' => 'A Stay to Remember', 'alt' => 'Deluxe accommodation at Paciano', 'sort' => 20],
            ['category' => 'dining', 'title' => 'Dining in Nature', 'alt' => 'Dining experience at Paciano', 'sort' => 30],
            ['category' => 'experiences', 'title' => "Nature's Embrace", 'alt' => 'Beautiful resort garden', 'sort' => 40],
            ['category' => 'dining', 'title' => null, 'alt' => 'Outdoor dining experience', 'sort' => 50],
            ['category' => 'experiences', 'title' => null, 'alt' => 'Nature and river views', 'sort' => 60],
            ['category' => 'stays', 'title' => null, 'alt' => 'Family accommodation', 'sort' => 70],
            ['category' => 'property', 'title' => null, 'alt' => 'Paciano resort surroundings', 'sort' => 80],
            ['category' => 'property', 'title' => null, 'alt' => 'Aerial view of Paciano property', 'sort' => 90],
        ];

        foreach ($items as $row) {
            GalleryItem::query()->updateOrCreate(
                [
                    'gallery_category_id' => $categoryIds[$row['category']],
                    'sort_order' => $row['sort'],
                ],
                [
                    'title' => $row['title'],
                    'alt_text' => $row['alt'],
                    'is_active' => true,
                ],
            );
        }
    }
}