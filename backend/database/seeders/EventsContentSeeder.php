<?php

namespace Database\Seeders;

use App\Models\EventsCategoryExperienceItem;
use App\Models\EventsCategoryPage;
use App\Models\EventsCategoryVenueItem;
use App\Models\EventsLanding;
use App\Models\EventsLandingAdvantageSlide;
use App\Models\EventsLandingTypePreview;
use Illuminate\Database\Seeder;

class EventsContentSeeder extends Seeder
{
    public function run(): void
    {
        EventsLanding::query()->updateOrCreate(
            ['id' => 1],
            [
                'hero_kicker' => 'Events at Paciano',
                'hero_title_main' => 'Celebrate In',
                'hero_title_accent' => "Nature's Embrace.",
                'hero_description' => 'From elegant corporate gatherings to intimate celebrations and destination weddings, Paciano offers a naturally inspiring setting where meaningful moments unfold.',
            ],
        );

        EventsLandingTypePreview::query()->updateOrCreate(
            ['slug' => 'corporate'],
            [
                'eyebrow' => 'Corporate Events',
                'title_main' => 'Inspiring Gatherings',
                'title_accent' => 'for Lasting Impact',
                'description' => 'Host corporate retreats, strategy meetings and team celebrations in a serene, nature-rich setting designed for focus, connection and growth.',
            ],
        );

        EventsLandingTypePreview::query()->updateOrCreate(
            ['slug' => 'wedding'],
            [
                'eyebrow' => 'Weddings',
                'title_main' => 'A Naturally Enchanting',
                'title_accent' => 'Wedding Destination',
                'description' => 'Celebrate your love amidst breathtaking mountain views, lush greenery and the warm, personalized hospitality of Paciano.',
            ],
        );

        $defaultSlides = [
            ['title' => "Nature's Embrace", 'description' => 'Celebrations surrounded by nature.', 'sort_order' => 10],
            ['title' => 'Inspired Gatherings', 'description' => 'Spaces designed for meaningful connections.', 'sort_order' => 20],
            ['title' => 'Dining Experiences', 'description' => 'Thoughtfully curated culinary moments.', 'sort_order' => 30],
            ['title' => 'Beautiful Celebrations', 'description' => 'A memorable setting for your special day.', 'sort_order' => 40],
        ];

        foreach ($defaultSlides as $slide) {
            EventsLandingAdvantageSlide::query()->updateOrCreate(
                ['title' => $slide['title']],
                [
                    'description' => $slide['description'],
                    'sort_order' => $slide['sort_order'],
                    'is_active' => true,
                ],
            );
        }

        EventsCategoryPage::query()->updateOrCreate(
            ['slug' => 'corporate'],
            [
                'hero_event_type' => 'Corporate Gatherings',
                'hero_title_line1' => 'Where Ideas Meet',
                'hero_title_line2' => 'Inspiring Spaces',
                'hero_description' => 'Bring people together in a setting where fresh ideas flourish. From meaningful meetings and team retreats to corporate celebrations, experience thoughtful hospitality and inspiring surroundings at Paciano.',
                'hero_cta_text' => 'Enquire Now',
                'hero_cta_href' => '/contact',
                'advantage_eyebrow' => 'THE PACIANO EXPERIENCE',
                'advantage_title_line1' => 'Inspired by Nature',
                'advantage_title_line2' => 'Designed for Connection',
                'advantage_description' => 'A natural setting, attentive hospitality and thoughtfully curated experiences come together to make every corporate gathering exceptional.',
                'venues_eyebrow' => 'OUR VENUES',
                'venues_title1' => 'The Perfect Setting',
                'venues_title2' => 'For Every Gathering',
                'venues_description' => 'Discover versatile settings designed to host everything from intimate meetings to larger corporate gatherings.',
            ],
        );

        EventsCategoryPage::query()->updateOrCreate(
            ['slug' => 'wedding'],
            [
                'hero_event_type' => 'Weddings & Celebrations',
                'hero_title_line1' => 'Beautiful Moments,',
                'hero_title_line2' => 'Timeless Celebrations',
                'hero_description' => 'Celebrate love and togetherness in a setting touched by nature and timeless charm. From intimate ceremonies to grand wedding celebrations, let Paciano turn your special moments into memories to cherish forever.',
                'hero_cta_text' => 'Plan Your Wedding',
                'hero_cta_href' => '/contact',
                'advantage_eyebrow' => 'THE PACIANO EXPERIENCE',
                'advantage_title_line1' => 'Love, Laughter &',
                'advantage_title_line2' => 'Lasting Memories',
                'advantage_description' => 'A naturally beautiful setting, warm hospitality and thoughtful details create the perfect backdrop for your special celebration.',
                'venues_eyebrow' => 'CELEBRATION SPACES',
                'venues_title1' => 'A Setting For',
                'venues_title2' => 'Your Forever',
                'venues_description' => 'Find the perfect setting for every chapter of your wedding celebration, from intimate ceremonies to grand receptions.',
            ],
        );

        $corporateExperience = [
            ['title' => 'Conferences & Meetings', 'description' => 'Purposeful spaces for productive discussions and presentations.', 'icon_key' => 'presentation', 'sort_order' => 10, 'show_on_landing' => true],
            ['title' => 'Executive Retreats', 'description' => 'Step away from the everyday and bring leadership teams together in a refreshing natural setting.', 'icon_key' => 'chart', 'sort_order' => 20, 'show_on_landing' => false],
            ['title' => 'Corporate Networking', 'description' => 'Create valuable connections and meaningful professional relationships.', 'icon_key' => 'handshake', 'sort_order' => 30, 'show_on_landing' => false],
            ['title' => 'Leadership Summits', 'description' => 'An inspiring setting for executive dialogue, vision and strategic decisions.', 'icon_key' => 'landmark', 'sort_order' => 40, 'show_on_landing' => false],
        ];

        foreach ($corporateExperience as $row) {
            EventsCategoryExperienceItem::query()->updateOrCreate(
                ['category_slug' => 'corporate', 'title' => $row['title']],
                [
                    'description' => $row['description'],
                    'icon_key' => $row['icon_key'],
                    'sort_order' => $row['sort_order'],
                    'show_on_landing' => $row['show_on_landing'],
                    'is_active' => true,
                ],
            );
        }

        $weddingExperience = [
            ['title' => 'Wedding Ceremonies', 'description' => 'Beautiful settings for exchanging vows and beginning forever.', 'icon_key' => 'heart', 'sort_order' => 10, 'show_on_landing' => true],
            ['title' => 'Wedding Receptions', 'description' => 'Elegant spaces for celebrating with family and friends.', 'icon_key' => 'flower', 'sort_order' => 20, 'show_on_landing' => false],
            ['title' => 'Family Celebrations', 'description' => 'Meaningful moments shared with the people closest to you.', 'icon_key' => 'users-round', 'sort_order' => 30, 'show_on_landing' => false],
            ['title' => 'Special Moments', 'description' => 'Thoughtfully curated experiences for every wedding occasion.', 'icon_key' => 'sparkles', 'sort_order' => 40, 'show_on_landing' => false],
        ];

        foreach ($weddingExperience as $row) {
            EventsCategoryExperienceItem::query()->updateOrCreate(
                ['category_slug' => 'wedding', 'title' => $row['title']],
                [
                    'description' => $row['description'],
                    'icon_key' => $row['icon_key'],
                    'sort_order' => $row['sort_order'],
                    'show_on_landing' => $row['show_on_landing'],
                    'is_active' => true,
                ],
            );
        }

        $corporateVenues = [
            ['title' => 'The Deck – Event Spaces', 'description' => 'An open-air setting with scenic surroundings, perfect for corporate gatherings, networking sessions and memorable team experiences.', 'capacity' => 'Up to 150 Guests', 'setup' => 'Open-air Setting', 'sort_order' => 10],
            ['title' => 'Conference Room', 'description' => 'Open-air settings surrounded by nature for engaging gatherings.', 'capacity' => 'Up to 150 Guests', 'setup' => 'Open-air Setting', 'sort_order' => 20],
            ['title' => 'Outdoor Lawn Spaces', 'description' => 'Open-air settings surrounded by nature for relaxed and engaging gatherings.', 'capacity' => 'Up to 150 Guests', 'setup' => 'Open-air Setting', 'sort_order' => 30],
            ['title' => 'Outdoor Gathering Spaces', 'description' => 'Open-air settings surrounded by nature for relaxed and engaging gatherings.', 'capacity' => 'Up to 150 Guests', 'setup' => 'Open-air Setting', 'sort_order' => 40],
        ];

        foreach ($corporateVenues as $row) {
            EventsCategoryVenueItem::query()->updateOrCreate(
                ['category_slug' => 'corporate', 'title' => $row['title']],
                array_merge($row, ['is_active' => true]),
            );
        }

        $weddingVenues = [
            ['title' => 'Dech Spaces', 'description' => 'Celebrate beneath the open sky in a naturally beautiful setting.', 'capacity' => 'Up to 150 Guests', 'setup' => 'Open-air Setting', 'sort_order' => 10],
            ['title' => 'Elegant Indoor Spaces', 'description' => 'Beautifully arranged spaces for intimate celebrations and receptions.', 'capacity' => 'Up to 150 Guests', 'setup' => 'Open-air Setting', 'sort_order' => 20],
            ['title' => 'Outdoor Lawn Spaces', 'description' => 'Beautifully arranged spaces for intimate celebrations and receptions.', 'capacity' => 'Up to 150 Guests', 'setup' => 'Open-air Setting', 'sort_order' => 30],
            ['title' => 'Elegant Hall Spaces', 'description' => 'Beautifully arranged spaces for intimate celebrations and receptions.', 'capacity' => 'Up to 150 Guests', 'setup' => 'Open-air Setting', 'sort_order' => 40],
        ];

        foreach ($weddingVenues as $row) {
            EventsCategoryVenueItem::query()->updateOrCreate(
                ['category_slug' => 'wedding', 'title' => $row['title']],
                array_merge($row, ['is_active' => true]),
            );
        }
    }
}