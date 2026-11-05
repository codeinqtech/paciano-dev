<?php

return [
    /** Pre-compression upload cap (Laravel `max` rule uses kilobytes). */
    'image_max_kb' => (int) env('MEDIA_IMAGE_MAX_KB', 2048),

    'video_max_kb' => (int) env('MEDIA_VIDEO_MAX_KB', 51200),

    /** WebP encode: start quality, minimum when stepping down. */
    'webp_quality_start' => (int) env('MEDIA_WEBP_QUALITY_START', 84),
    'webp_quality_min' => (int) env('MEDIA_WEBP_QUALITY_MIN', 68),

    /** H.264 CRF (lower = better quality, larger file). */
    'video_crf' => (int) env('MEDIA_VIDEO_CRF', 26),
];
