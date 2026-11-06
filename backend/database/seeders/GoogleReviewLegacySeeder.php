<?php

namespace Database\Seeders;

use App\Models\GooglePlace;
use App\Models\GoogleReview;
use Illuminate\Database\Seeder;

class GoogleReviewLegacySeeder extends Seeder
{
    public function run(): void
    {
        $place = GooglePlace::query()->updateOrCreate(
            ['place_id' => 'ChIJ835SmFAR5DkRmylIBPB9QX4'],
            [
                'display_name' => 'Paciano',
                'rating' => 4.2,
                'user_rating_count' => 77,
                'maps_url' => 'https://maps.google.com/?cid=9097691192082573723',
                'photo_url' => 'https://lh3.googleusercontent.com/places/ANXAkqEYz9vZDvi8ePA7T2SSndjZGcSRxf_sM_nUgs1VeuvuXPgCzsdPRLD1BF1dNZGBk1O7aRWTpwdIFaEClkbdPUGLA0xkKcE-ZRY=s1600-w300-h300',
            ],
        );

        foreach ($this->legacyReviews() as $row) {
            $fingerprint = GoogleReview::fingerprint($row['author_url'], $row['time']);

            GoogleReview::query()->updateOrCreate(
                ['source_fingerprint' => $fingerprint],
                [
                    'google_place_id' => $place->id,
                    'author_name' => $row['author_name'],
                    'author_url' => $row['author_url'],
                    'profile_photo_url' => $row['profile_photo_url'] ?? null,
                    'rating' => $row['rating'],
                    'review_text' => $row['text'] !== '' ? $row['text'] : null,
                    'language' => $row['language'] ?? null,
                    'published_at' => $row['time'] > 0 ? date('Y-m-d H:i:s', $row['time']) : null,
                    'owner_reply' => $row['reply'] ?? null,
                    'owner_reply_at' => isset($row['reply_time']) && $row['reply_time'] > 0
                        ? date('Y-m-d H:i:s', $row['reply_time'])
                        : null,
                    'photo_urls' => $row['images'] ?? null,
                    'is_approved' => empty($row['hide']),
                    'imported_from_legacy' => true,
                ],
            );
        }
    }

    /**
     * Cached reviews exported from the previous site (not live WordPress).
     *
     * @return list<array<string, mixed>>
     */
    private function legacyReviews(): array
    {
        return [
            [
                'author_name' => 'Sayantan Banerjee',
                'author_url' => 'https://www.google.com/maps/contrib/100583785439375768732/reviews',
                'profile_photo_url' => 'https://lh3.googleusercontent.com/a-/ALV-UjUkPuD4su-Fj4X_AXfIxaPj2rC7Ij2zpjIbQGkq6so0HCUmyns4=s128-c0x00000000-cc-rp-mo-ba3',
                'rating' => 5,
                'text' => 'This is a newly built resort in a beautiful location. Though the scenic beauty of the location is worth spending time but the road leading to the resort is not in good condition and if not improved then it will be a nightmare during the rainy season. The property is very big and all the rooms have similar views and a big balcony but top-floor rooms(double occupancy) are having open balcony and a view can be enjoyed from rooms. The only negative about the property is the food charges which was very high compared to quality and quantity.',
                'time' => 1736793044,
                'language' => 'en',
            ],
            [
                'author_name' => 'Subhabrata Sarkar',
                'author_url' => 'https://www.google.com/maps/contrib/103898697229353194506/reviews',
                'profile_photo_url' => 'https://lh3.googleusercontent.com/a-/ALV-UjU2FiTZbbGGmb77lEbq-v0utZRNj7KqGfPx86QLTggj-PjnlE82=s128-c0x00000000-cc-rp-mo-ba3',
                'rating' => 5,
                'text' => "We went for Lunch and ordered Chinese Combo. Food tasted good. even the noodles which I usually do not find tasty everywhere.\n\nOverall ambience is very good. The Resort seems to be well maintained as well. Clean.",
                'time' => 1736867811,
                'language' => 'en',
            ],
            [
                'author_name' => 'Dipali Banerjee',
                'author_url' => 'https://www.google.com/maps/contrib/105787192527697239057/reviews',
                'profile_photo_url' => 'https://lh3.googleusercontent.com/a/ACg8ocKBNsYN3ri0ovfhltF-DCGpps3icmk_xIlCYXUg1keYgHqDfw=s128-c0x00000000-cc-rp-mo',
                'rating' => 5,
                'text' => "Wonderful experience. Perfect for a relaxing getaway. The rooms were spacious, clean and equipped with all the modern amenities. The staff was extremely welcoming and courteous. Loved every minute of my stay. Can't wait to return!",
                'time' => 1732432035,
                'language' => 'en',
            ],
            [
                'author_name' => 'Saurav Basu',
                'author_url' => 'https://www.google.com/maps/contrib/106584643143776563528/reviews',
                'profile_photo_url' => 'https://lh3.googleusercontent.com/a-/ALV-UjVk5pExzfp2WioCeoK4jUrtt9ypCbfXTNKUqBbHQDhVkSthQwiG=s128-c0x00000000-cc-rp-mo',
                'rating' => 5,
                'text' => 'Excellent ambiance, hospitality and food. The staff is courteous and helpful, making the stay comfortable. The Bengali cuisine served at the property is delicious. The rooms are spacious and well-maintained. Overall we had a pleasant and memorable stay at this property.',
                'time' => 1732808798,
                'language' => 'en',
            ],
            [
                'author_name' => 'Biplab Kumar Basu',
                'author_url' => 'https://www.google.com/maps/contrib/114192217801598002626/reviews',
                'profile_photo_url' => 'https://lh3.googleusercontent.com/a/ACg8ocLa0B9Jz41RNU4a0t5YE4FsFe1rV7CxjErzGA3jJ-I6DTu_=s128-c0x00000000-cc-rp-mo',
                'rating' => 5,
                'text' => 'Our stay was amazing in Paciano. The rooms are quite spacious & view from the room is amazing. Also the food was delicious, be it breakfast or lunch/dinner. All the staff were courteous & well mannered. Overall, a very good experience.',
                'time' => 1733323008,
                'language' => 'en',
            ],
            [
                'author_name' => 'Ratirmoy De',
                'author_url' => 'https://www.google.com/maps/contrib/113951129557696379974/reviews',
                'profile_photo_url' => 'https://lh3.googleusercontent.com/a/ACg8ocKNgewSN9k_4yHZMKpuNvim3QyLbGB3bwp3KIWQHkrzWiIOnA=s128-c0x00000000-cc-rp-mo',
                'rating' => 1,
                'text' => 'Food quality is very bad, receptionist is not for hospitality industry, other staff behaviour is also very bad, billing system was also horrible as there were attempts of adding extra food items and over all the experience was very bad.',
                'time' => 1737569979,
                'language' => 'en',
            ],
            [
                'author_name' => 'Sayani Haldar',
                'author_url' => 'https://www.google.com/maps/contrib/113636920016454382275/reviews',
                'profile_photo_url' => 'https://lh3.googleusercontent.com/a-/ALV-UjWfujerBt8woPZZYuEHs6EvSlH6v9VnMsKBESkS7yhDwXvbZFM=s128-c0x00000000-cc-rp-mo-ba2',
                'rating' => 1,
                'text' => "Experience was too bad.. don't recommend... Worst food ever 👎food rate  very high but ambiance is good",
                'time' => 1737289205,
                'language' => 'en',
            ],
            [
                'author_name' => 'ANIRBAN BASU',
                'author_url' => 'https://www.google.com/maps/contrib/116699560135994914781/reviews',
                'profile_photo_url' => 'https://lh3.googleusercontent.com/a/ACg8ocLREd624ri7cH786zKtUn37uujCjlCpVU6KKz59G1P44TsF5g=s128-c0x00000000-cc-rp-mo',
                'rating' => 5,
                'text' => '',
                'time' => 1736668168,
                'language' => null,
            ],
            [
                'author_name' => 'MAHENDRA AGARWAL',
                'author_url' => 'https://www.google.com/maps/contrib/106580766525627250273/reviews',
                'profile_photo_url' => 'https://lh3.googleusercontent.com/a-/ALV-UjU-LpYjezzwXPIZbC6idFRpXqxe5dFxaURJUsdbzHmOqKj75nAW=s120-c-rp-mo-br100',
                'rating' => 4,
                'text' => '',
                'time' => 1749992678,
                'language' => null,
            ],
            [
                'author_name' => 'Shikha Tiwari',
                'author_url' => 'https://www.google.com/maps/contrib/112830848481041509890/reviews',
                'profile_photo_url' => 'https://lh3.googleusercontent.com/a-/ALV-UjU1LegEFFWqE3-goFzx4RIoExR-MmZ5NpYrDQYOsykhT1eyryvk=s120-c-rp-mo-br100',
                'rating' => 5,
                'text' => 'I had a great stay with my parents and kids. The size of the rooms are big, cozy and comforting. Riverview balcony. Surrounded by river n hills. It was my calm n pleasant time there including the luxuries of a pool and delicious food. The best part was the hospitality provided by the staffs there.',
                'time' => 1749793384,
                'language' => 'en',
                'reply' => 'Thank you for your kind words! We’re thrilled to have hosted you at Paciano and look forward to welcoming you again.',
                'reply_time' => 1749795883,
            ],
            [
                'author_name' => 'Tarun Kumar Bhadra',
                'author_url' => 'https://www.google.com/maps/contrib/114240858240466112150/reviews',
                'profile_photo_url' => 'https://lh3.googleusercontent.com/a-/ALV-UjXjcbkQEWe1E8OrsA4cSEZvtMIjvUlxQBCONzQkVy-qrUlJpg3NpA=s120-c-rp-mo-br100',
                'rating' => 5,
                'text' => 'Good atmosphere.Best Service.',
                'time' => 1749517858,
                'language' => 'en',
                'reply' => 'Thank you for your kind words! We’re thrilled to have hosted you at Paciano and look forward to welcoming you again.',
                'reply_time' => 1749795892,
            ],
            [
                'author_name' => 'Jeet Sharma',
                'author_url' => 'https://www.google.com/maps/contrib/112043232877202752071/reviews',
                'profile_photo_url' => 'https://lh3.googleusercontent.com/a/ACg8ocLEb8vgUU19E-jrsndHriJYHourW23rvf6x1vqDhCnWW9BaXQ=s120-c-rp-mo-br100',
                'rating' => 1,
                'text' => "It's very bad service ,\nVery bad quality rooms",
                'time' => 1749364938,
                'language' => 'en',
                'hide' => true,
                'reply' => 'We’re sorry to hear about your experience. Kindly email your booking details, and our team will get in touch with you shortly.',
                'reply_time' => 1749795920,
            ],
            [
                'author_name' => 'Debojit Mitra',
                'author_url' => 'https://www.google.com/maps/contrib/109075249429923989012/reviews',
                'profile_photo_url' => 'https://lh3.googleusercontent.com/a-/ALV-UjXeBMWwcyP5uRzYvO-cQg08rIYNjlDp8AKH-lD1-Izvl5NcgH_eOw=s120-c-rp-mo-br100',
                'rating' => 5,
                'text' => '',
                'time' => 1748843498,
                'language' => null,
                'reply' => 'We truly appreciate your feedback! It was a pleasure having you, and we can’t wait to host you again.',
                'reply_time' => 1749795940,
            ],
            [
                'author_name' => 'Dr Kalyan Kumar Ghosh',
                'author_url' => 'https://www.google.com/maps/contrib/103017300798323680298/reviews',
                'profile_photo_url' => 'https://lh3.googleusercontent.com/a/ACg8ocL9NoCRw_pwGAWZvoKuxM6ZKklMjqBWOBJxtz_SjEufjovTeg=s120-c-rp-mo-br100',
                'rating' => 1,
                'text' => "Worst experience @ Dooars. They actually don't know the meaning of services. Most of time u have to wait for a long time to get any kind of help.Behavior also was not up to the mark.",
                'time' => 1748783928,
                'language' => 'en',
                'hide' => true,
                'reply' => 'We sincerely regret any inconvenience caused during your stay. Please share your booking details via email and we’ll reach out to resolve this as soon as possible.',
                'reply_time' => 1749795971,
            ],
            [
                'author_name' => 'Siddhartha Basak',
                'author_url' => 'https://www.google.com/maps/contrib/100510311209739147160/reviews',
                'profile_photo_url' => 'https://lh3.googleusercontent.com/a-/ALV-UjXsRzXrtn5VOSCuWEovLsjTzx0vNfuFpUOWhx6vzmSyvciATdyQ8g=s120-c-rp-mo-br100',
                'rating' => 5,
                'text' => '',
                'time' => 1748583508,
                'language' => null,
                'reply' => 'We truly appreciate your feedback! It was a pleasure having you, and we can’t wait to host you again.',
                'reply_time' => 1749795989,
            ],
            [
                'author_name' => 'Trinanjan GHOSH',
                'author_url' => 'https://www.google.com/maps/contrib/110204411216159998806/reviews',
                'profile_photo_url' => 'https://lh3.googleusercontent.com/a-/ALV-UjWvRKK1x2LYf6vupWdn4Wl4Uul_3W7ya427S8rJWZjoh5n_yNwa=s120-c-rp-mo-ba4-br100',
                'rating' => 5,
                'text' => "The resort was amazing, one of the best resorts I have ever visited...the rooms were really big, airy, neat and clean, and to my surprise, the room had iGeneral central AC like in malls...the AC was top notch with top class bathroom fittings, the location and the view from it was just worth the money, the food was costly though it was really tasty , loved it...the service and behaviour of the staff were very nice and humble....I have absolutely no complaints about the resort, but one thing that needs serious improvement is the road to the resort, it is really rough, has many potholes which become difficult to notice during rain, although it is not much of a problem...I'm really eager to visit and stay again... Must say that it was a grand experience.",
                'time' => 1748411586,
                'language' => 'en',
                'reply' => 'Thank you for your kind words! We’re thrilled to have hosted you at Paciano and look forward to welcoming you again.',
                'reply_time' => 1749796061,
            ],
            [
                'author_name' => 'Bapi Ghosh',
                'author_url' => 'https://www.google.com/maps/contrib/110746556269453043286/reviews',
                'profile_photo_url' => 'https://lh3.googleusercontent.com/a/ACg8ocJgOQ8I_6L1ekf0YL1DhTSmzbWmnFhnrIsTK8Mcstl0bgddWg=s120-c-rp-mo-br100',
                'rating' => 5,
                'text' => "Just speechless about the resort.....The resort's location is just amazing, the rooms were near and clean and very large, full of amenities and the taste of  food was very good, the service and behaviour of the staff was also very good... Really want to visit again.....",
                'time' => 1748409665,
                'language' => 'en',
                'reply' => 'Thank you for your kind words! We’re thrilled to have hosted you at Paciano and look forward to welcoming you again.',
                'reply_time' => 1749795853,
            ],
            [
                'author_name' => 'AAYUSH HOLIDAYS HIMALAYAN GLORY',
                'author_url' => 'https://www.google.com/maps/contrib/117887696523813415248/reviews',
                'profile_photo_url' => 'https://lh3.googleusercontent.com/a/ACg8ocL9t73BVAfdHgzd7l8QInTTdqVQHn9wXpgAP-cOCcvhqEAJLA=s120-c-rp-mo-ba3-br100',
                'rating' => 4,
                'text' => 'late check in given to guest AC in lobby/Reception was off. Humidity felt reception area. Food is good but rates are not as standard as property 5***** property rates are charge for food as there is no option guest need to order and pay high rates. Less staff seen.',
                'time' => 1748242059,
                'language' => 'en',
                'reply' => 'We’re sorry to hear about your experience. Kindly email your booking details, and our team will get in touch with you shortly.',
                'reply_time' => 1748266146,
            ],
        ];
    }
}
