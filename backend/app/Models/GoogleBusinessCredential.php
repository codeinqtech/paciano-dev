<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class GoogleBusinessCredential extends Model
{
    protected $fillable = [
        'refresh_token',
        'access_token',
        'access_token_expires_at',
        'scope',
        'connected_at',
    ];

    protected function casts(): array
    {
        return [
            'access_token_expires_at' => 'datetime',
            'connected_at' => 'datetime',
        ];
    }

    public static function singleton(): self
    {
        return static::query()->firstOrCreate(['id' => 1]);
    }

    public function setRefreshTokenAttribute(?string $value): void
    {
        $this->attributes['refresh_token'] = $value !== null && $value !== ''
            ? Crypt::encryptString($value)
            : null;
    }

    public function getRefreshTokenAttribute(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        try {
            return Crypt::decryptString($value);
        } catch (\Throwable) {
            return null;
        }
    }

    public function setAccessTokenAttribute(?string $value): void
    {
        $this->attributes['access_token'] = $value !== null && $value !== ''
            ? Crypt::encryptString($value)
            : null;
    }

    public function getAccessTokenAttribute(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        try {
            return Crypt::decryptString($value);
        } catch (\Throwable) {
            return null;
        }
    }

    public function hasRefreshToken(): bool
    {
        return is_string($this->refresh_token) && $this->refresh_token !== '';
    }
}