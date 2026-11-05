<?php

return [
    'api_key' => env('GOOGLE_PLACES_API_KEY'),
    'place_id' => env('GOOGLE_PLACE_ID', 'ChIJ835SmFAR5DkRmylIBPB9QX4'),
    'field_mask' => env(
        'GOOGLE_PLACES_FIELD_MASK',
        'id,displayName,rating,userRatingCount,reviews',
    ),
    'base_url' => 'https://places.googleapis.com/v1/places',
];
