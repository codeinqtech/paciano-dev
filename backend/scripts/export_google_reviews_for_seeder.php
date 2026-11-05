<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\GooglePlace;
use App\Models\GoogleReview;

$place = GooglePlace::query()->first();
$reviews = GoogleReview::query()->orderBy('published_at', 'desc')->get();

$payload = [
    'place' => $place?->only([
        'place_id',
        'display_name',
        'rating',
        'user_rating_count',
        'maps_url',
        'photo_url',
        'last_synced_at',
        'last_sync_error',
    ]),
    'reviews' => $reviews->map(fn (GoogleReview $r) => [
        'source_fingerprint' => $r->source_fingerprint,
        'author_name' => $r->author_name,
        'author_url' => $r->author_url,
        'profile_photo_url' => $r->profile_photo_url,
        'rating' => $r->rating,
        'review_text' => $r->review_text,
        'language' => $r->language,
        'published_at' => $r->published_at?->toIso8601String(),
        'owner_reply' => $r->owner_reply,
        'owner_reply_at' => $r->owner_reply_at?->toIso8601String(),
        'photo_urls' => $r->photo_urls,
        'is_approved' => $r->is_approved,
        'imported_from_legacy' => $r->imported_from_legacy,
    ])->values()->all(),
];

$json = json_encode(
    $payload,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE,
);

if ($json === false) {
    fwrite(STDERR, 'JSON encode failed: '.json_last_error_msg().PHP_EOL);
    exit(1);
}

$out = $argv[1] ?? null;
if (is_string($out) && $out !== '') {
    file_put_contents($out, $json);
    fwrite(STDOUT, 'Wrote '.count($payload['reviews'])." reviews to {$out}".PHP_EOL);
} else {
    echo $json;
}
