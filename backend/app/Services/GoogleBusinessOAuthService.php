<?php

namespace App\Services;

use App\Models\GoogleBusinessCredential;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Throwable;

class GoogleBusinessOAuthService
{
    public function isClientConfigured(): bool
    {
        $clientId = config('services.google_business.client_id');
        $secret = config('services.google_business.client_secret');
        $redirect = config('services.google_business.redirect');

        return is_string($clientId) && $clientId !== ''
            && is_string($secret) && $secret !== ''
            && is_string($redirect) && $redirect !== '';
    }

    public function bootstrapFromEnvironment(): void
    {
        if (! $this->isClientConfigured()) {
            return;
        }

        if (! Schema::hasTable('google_business_credentials')) {
            return;
        }

        $fromEnv = config('services.google_business.refresh_token');
        if (! is_string($fromEnv) || trim($fromEnv) === '') {
            return;
        }

        $credential = GoogleBusinessCredential::singleton();
        if ($credential->hasRefreshToken()) {
            return;
        }

        $credential->refresh_token = trim($fromEnv);
        $credential->connected_at = now();
        $credential->save();
    }

    public function isConnected(): bool
    {
        if (! $this->isClientConfigured()) {
            return false;
        }

        $this->bootstrapFromEnvironment();

        return GoogleBusinessCredential::singleton()->hasRefreshToken();
    }

    /**
     * @return array{url: string, state: string}
     */
    public function createAuthorizeUrl(?int $adminUserId = null): array
    {
        if (! $this->isClientConfigured()) {
            throw new \RuntimeException('Google OAuth client is not configured.');
        }

        $state = Str::random(64);
        Cache::put(
            'google_reviews_oauth_state_'.$state,
            ['user_id' => $adminUserId],
            now()->addMinutes(15),
        );

        $query = http_build_query([
            'client_id' => config('services.google_business.client_id'),
            'redirect_uri' => config('services.google_business.redirect'),
            'response_type' => 'code',
            'scope' => config('services.google_business.scope'),
            'access_type' => 'offline',
            'prompt' => 'consent',
            'state' => $state,
        ]);

        return [
            'url' => 'https://accounts.google.com/o/oauth2/v2/auth?'.$query,
            'state' => $state,
        ];
    }

    /**
     * @return array{success: bool, message: string}
     */
    public function handleCallback(string $code, string $state): array
    {
        $cached = Cache::pull('google_reviews_oauth_state_'.$state);
        if (! $cached) {
            return ['success' => false, 'message' => 'Invalid or expired OAuth state.'];
        }

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'code' => $code,
            'client_id' => config('services.google_business.client_id'),
            'client_secret' => config('services.google_business.client_secret'),
            'redirect_uri' => config('services.google_business.redirect'),
            'grant_type' => 'authorization_code',
        ]);

        if (! $response->successful()) {
            $message = $response->json('error_description')
                ?? $response->json('error')
                ?? $response->body();

            return [
                'success' => false,
                'message' => 'Unable to exchange Google authorization code: '.Str::limit((string) $message, 300),
            ];
        }

        $tokens = $response->json();
        $credential = GoogleBusinessCredential::singleton();

        if (! empty($tokens['refresh_token'])) {
            $credential->refresh_token = (string) $tokens['refresh_token'];
        } elseif (! $credential->hasRefreshToken()) {
            return [
                'success' => false,
                'message' => 'Google did not return a refresh token. Revoke app access and authorize again with prompt=consent.',
            ];
        }

        if (! empty($tokens['access_token'])) {
            $credential->access_token = (string) $tokens['access_token'];
            $expiresIn = (int) ($tokens['expires_in'] ?? 3600);
            $credential->access_token_expires_at = now()->addSeconds(max(60, $expiresIn - 30));
        }

        $credential->scope = isset($tokens['scope']) ? (string) $tokens['scope'] : null;
        $credential->connected_at = now();
        $credential->save();

        return ['success' => true, 'message' => 'Google Business Profile connected.'];
    }

    public function getAccessToken(): ?string
    {
        $this->bootstrapFromEnvironment();

        $credential = GoogleBusinessCredential::singleton();

        if (
            is_string($credential->access_token)
            && $credential->access_token !== ''
            && $credential->access_token_expires_at
            && $credential->access_token_expires_at->isFuture()
        ) {
            return $credential->access_token;
        }

        if (! $credential->hasRefreshToken()) {
            return null;
        }

        try {
            $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'client_id' => config('services.google_business.client_id'),
                'client_secret' => config('services.google_business.client_secret'),
                'refresh_token' => $credential->refresh_token,
                'grant_type' => 'refresh_token',
            ]);

            if (! $response->successful()) {
                return null;
            }

            $tokens = $response->json();
            $access = (string) ($tokens['access_token'] ?? '');
            if ($access === '') {
                return null;
            }

            $credential->access_token = $access;
            $expiresIn = (int) ($tokens['expires_in'] ?? 3600);
            $credential->access_token_expires_at = now()->addSeconds(max(60, $expiresIn - 30));
            $credential->save();

            return $access;
        } catch (Throwable) {
            return null;
        }
    }
}