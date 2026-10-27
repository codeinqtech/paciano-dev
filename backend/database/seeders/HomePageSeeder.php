<?php

namespace Database\Seeders;

use App\Models\HomeLocationSetting;
use Illuminate\Database\Seeder;

class HomePageSeeder extends Seeder
{
    public function run(): void
    {
        HomeLocationSetting::query()->updateOrCreate(
            ['id' => 1],
            [
                'eyebrow' => 'OUR LOCATION',
                'heading_primary' => 'Paciano Means',
                'heading_accent' => 'Peace.',
                'description' => 'Nestled in Lataguri, Dooars, Paciano is surrounded by rivers, forests and misty mountains — a place where nature slows you down and life feels fuller.',
                'feature_labels' => HomeLocationSetting::defaultFeatures(),
                'is_active' => true,
            ],
        );
    }
}
