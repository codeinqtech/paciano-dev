<?php

namespace Database\Seeders;

use App\Models\HomeAboutSection;
use App\Models\HomeDiningSection;
use App\Models\HomeDiningSlide;
use App\Models\HomeExperienceItem;
use App\Models\HomeExperienceSection;
use App\Models\HomeStayItem;
use App\Models\HomeStaysSection;
use Illuminate\Database\Seeder;

class HomeSectionSeeder extends Seeder
{
    public function run(): void
    {
        HomeAboutSection::query()->updateOrCreate(
            ['id' => 1],
            [
                'heading_line_1' => 'Inspired By',
                'heading_line_2' => 'Nature.',
                'heading_accent' => 'Created For You.',
                'paragraph_1' => 'Paciano is more than a resort — it\'s a sanctuary where nature, comfort and genuine hospitality come together to create unforgettable moments.',
                'paragraph_2' => 'A place to retreat. A place to reconnect. A place that stays with you long after you leave.',
            ],
        );

        HomeExperienceSection::query()->updateOrCreate(
            ['id' => 1],
            [
                'heading_main' => 'Moments Crafted by Nature,',
                'heading_accent' => 'Curated for You.',
            ],
        );

        $experiences = [
            ['title' => 'Riverside Bliss', 'description' => 'Unwind by the serene river and feel the calm.', 'sort_order' => 10],
            ['title' => 'Tea Garden Walks', 'description' => 'Stroll through lush tea gardens and breathe in freshness.', 'sort_order' => 20],
            ['title' => 'Culinary Delights', 'description' => 'Savor flavors crafted from the finest local ingredients.', 'sort_order' => 30],
            ['title' => 'Wellness & Spa', 'description' => 'Rejuvenate your mind, body and soul.', 'sort_order' => 40],
            ['title' => 'Sustainable Stay', 'description' => 'Committed to nature and a better tomorrow.', 'sort_order' => 50],
        ];

        foreach ($experiences as $exp) {
            HomeExperienceItem::query()->updateOrCreate(
                ['title' => $exp['title']],
                [
                    'description' => $exp['description'],
                    'sort_order' => $exp['sort_order'],
                    'is_active' => true,
                ],
            );
        }

        HomeStaysSection::query()->updateOrCreate(
            ['id' => 1],
            [
                'heading_main' => 'Where Every Stay,',
                'heading_accent' => 'Feels Like Home in Nature.',
                'intro_text' => 'Wake to misty mountains, unwind beside the river, and let nature set the pace. Our stays are crafted for quiet comfort, generous space and a deeper sense of belonging.',
            ],
        );

        $stays = [
            [
                'slug' => 'riverside',
                'menu_label' => 'Riverside',
                'title' => 'Wake to Tranquility',
                'description' => 'Wake to the gentle rhythm of the river, framed by mountains and softened by the quiet of nature.',
                'sort_order' => 10,
            ],
            [
                'slug' => 'garden',
                'menu_label' => 'Garden',
                'title' => 'Wake Among Greenery',
                'description' => 'A peaceful retreat overlooking Paciano\'s gardens, where quiet mornings unfold beneath open skies and surrounding greenery.',
                'sort_order' => 20,
            ],
            [
                'slug' => 'valley',
                'menu_label' => 'Valley',
                'title' => 'Closer to the Wild',
                'description' => 'A quiet escape where mountain views stretch beyond the room and every morning begins a little slower.',
                'sort_order' => 30,
            ],
            [
                'slug' => 'family',
                'menu_label' => 'Family',
                'title' => 'Space to Be Together',
                'description' => 'Thoughtfully arranged for families, with generous space to slow down, reconnect and enjoy the landscape together.',
                'sort_order' => 40,
            ],
        ];

        foreach ($stays as $stay) {
            HomeStayItem::query()->updateOrCreate(
                ['slug' => $stay['slug']],
                [
                    'menu_label' => $stay['menu_label'],
                    'title' => $stay['title'],
                    'description' => $stay['description'],
                    'sort_order' => $stay['sort_order'],
                    'is_active' => true,
                ],
            );
        }

        HomeDiningSection::query()->updateOrCreate(
            ['id' => 1],
            [
                'heading_line_1' => 'Dining, Inspired By',
                'heading_line_2' => 'Nature.',
                'heading_accent' => 'Flavours, Slowly Savoured.',
                'description' => 'Seasonal ingredients, locally sourced. Thoughtfully prepared. At Paciano, dining is a celebration of the land — where the valley\'s harvest, rivers and forests inspire meaningful flavours and unhurried moments.',
            ],
        );

        $slides = [
            ['quote' => '“Good food brings people closer to what matters.”', 'sort_order' => 10],
            ['quote' => '“Flavours become memories when shared slowly.”', 'sort_order' => 20],
            ['quote' => '“From the land, thoughtfully prepared.”', 'sort_order' => 30],
            ['quote' => '“A table is where moments begin.”', 'sort_order' => 40],
        ];

        foreach ($slides as $i => $slide) {
            HomeDiningSlide::query()->updateOrCreate(
                ['sort_order' => $slide['sort_order']],
                [
                    'quote' => $slide['quote'],
                    'is_active' => true,
                ],
            );
        }
    }
}
