<?php

namespace App\Support;

class MediaUploadLimits
{
    public static function imageMaxKb(): int
    {
        return (int) config('media_upload.image_max_kb', 2048);
    }

    public static function videoMaxKb(): int
    {
        return (int) config('media_upload.video_max_kb', 51200);
    }

    public static function imageMaxMb(): int
    {
        return (int) round(self::imageMaxKb() / 1024);
    }

    public static function videoMaxMb(): int
    {
        return (int) round(self::videoMaxKb() / 1024);
    }

    /**
     * @return list<string|int>
     */
    public static function imageFileRules(bool $nullable = true): array
    {
        $rules = ['file', 'max:'.self::imageMaxKb()];

        return $nullable ? array_merge(['nullable'], $rules) : array_merge(['required'], $rules);
    }

    /**
     * @return list<string|int>
     */
    public static function videoFileRules(bool $required = true): array
    {
        $rules = ['file', 'max:'.self::videoMaxKb()];

        return $required ? array_merge(['required'], $rules) : array_merge(['nullable'], $rules);
    }
}
