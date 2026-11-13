<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class GoogleProfilePhotoController extends Controller
{
    public function show(Request $request)
    {
        $raw = $request->query('u');
        if (! is_string($raw) || trim($raw) === '') {
            abort(400, 'Missing photo URL.');
        }

        $url = trim($raw);
        if (! $this->isAllowedGooglePhotoUrl($url)) {
            abort(403, 'URL not allowed.');
        }

        $response = Http::timeout(15)
            ->withHeaders([
                'Accept' => 'image/*,*/*;q=0.8',
                'Referer' => 'https://www.google.com/',
                'User-Agent' => 'Mozilla/5.0 (compatible; PacianoSite/1.0)',
            ])
            ->get($url);

        if (! $response->successful()) {
            abort(404);
        }

        $contentType = $response->header('Content-Type') ?? 'image/jpeg';
        if (! Str::startsWith(strtolower($contentType), 'image/')) {
            abort(404);
        }

        return response($response->body(), 200, [
            'Content-Type' => $contentType,
            'Cache-Control' => 'public, max-age=604800, immutable',
        ]);
    }

    private function isAllowedGooglePhotoUrl(string $url): bool
    {
        $parts = parse_url($url);
        if (! is_array($parts) || ($parts['scheme'] ?? '') !== 'https') {
            return false;
        }

        $host = strtolower((string) ($parts['host'] ?? ''));

        return $host !== '' && (
            str_ends_with($host, 'googleusercontent.com')
            || str_ends_with($host, 'ggpht.com')
        );
    }
}
