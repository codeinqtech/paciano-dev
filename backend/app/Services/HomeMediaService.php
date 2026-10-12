<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use RuntimeException;

class HomeMediaService
{
    /** Videos at or above this size must be compressed with ffmpeg on upload. */
    public const VIDEO_LARGE_BYTES = 100 * 1024 * 1024;

    public function storeBannerImage(UploadedFile $file): array
    {
        $dir = $this->uploadDirectory('banner', 'images');

        $name = $this->uniqueName('banner', 'webp');
        $path = $dir.DIRECTORY_SEPARATOR.$name;

        $this->convertImageToWebp($file->getPathname(), $path, 2400, 82);

        return [
            'file_name' => $name,
            'file_path' => 'uploads/banner/images/'.$name,
        ];
    }

    public function storeBannerVideo(UploadedFile $file): array
    {
        $dir = $this->uploadDirectory('banner', 'videos');
        $name = $this->uniqueName('banner_vid', 'mp4');
        $dest = $dir.DIRECTORY_SEPARATOR.$name;

        $compression = $this->transcodeVideoToMp4(
            $file,
            $dest,
            'scale=min(1920\\,iw):-2',
        );

        return [
            'file_name' => $name,
            'file_path' => 'uploads/banner/videos/'.$name,
            'compression' => $compression,
        ];
    }

    public function storeReviewThumbnail(UploadedFile $file, int $year): array
    {
        $dir = $this->uploadDirectory('reviews', (string) $year);

        $name = $this->uniqueName('review_thumb', 'webp');
        $path = $dir.DIRECTORY_SEPARATOR.$name;

        $this->convertImageToWebp($file->getPathname(), $path, 1200, 80);

        return [
            'file_name' => $name,
            'file_path' => 'uploads/reviews/'.$year.'/'.$name,
        ];
    }

    /**
     * Capture first frame of an uploaded review video as WebP thumbnail.
     *
     * @return array{file_name: string, file_path: string}
     */
    public function storeReviewThumbnailFromVideo(string $relativeVideoPath, int $year): array
    {
        $videoFull = public_path(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativeVideoPath));
        if (! is_file($videoFull)) {
            throw new RuntimeException('Video file not found for thumbnail capture.');
        }

        $dir = $this->uploadDirectory('reviews', (string) $year);

        $name = $this->uniqueName('review_thumb', 'webp');
        $path = $dir.DIRECTORY_SEPARATOR.$name;
        $tmpJpg = sys_get_temp_dir().DIRECTORY_SEPARATOR.$this->uniqueName('frame', 'jpg');

        if (! $this->ffmpegAvailable()) {
            throw new RuntimeException('Upload a thumbnail or install ffmpeg to capture one from the video.');
        }

        $this->runFfmpeg([
            'ffmpeg', '-y', '-i', $videoFull,
            '-ss', '0.25', '-frames:v', '1', '-q:v', '2',
            $tmpJpg,
        ]);

        try {
            $this->convertImageToWebp($tmpJpg, $path, 1200, 80);
        } finally {
            if (is_file($tmpJpg)) {
                @unlink($tmpJpg);
            }
        }

        return [
            'file_name' => $name,
            'file_path' => 'uploads/reviews/'.$year.'/'.$name,
        ];
    }

    public function storeReviewVideo(UploadedFile $file, int $year): array
    {
        $dir = $this->uploadDirectory('reviews', (string) $year);

        $name = $this->uniqueName('review_vid', 'mp4');
        $dest = $dir.DIRECTORY_SEPARATOR.$name;

        $compression = $this->transcodeVideoToMp4(
            $file,
            $dest,
            'scale=min(1280\\,iw):-2',
        );

        return [
            'file_name' => $name,
            'file_path' => 'uploads/reviews/'.$year.'/'.$name,
            'compression' => $compression,
        ];
    }

    /**
     * @return array{
     *   applied: bool,
     *   original_bytes: int,
     *   stored_bytes: int,
     *   saved_percent: float
     * }
     */
    private function transcodeVideoToMp4(UploadedFile $file, string $dest, string $scaleFilter): array
    {
        $originalBytes = max(0, (int) $file->getSize());
        $mustCompress = $originalBytes >= self::VIDEO_LARGE_BYTES;
        $ffmpeg = $this->ffmpegAvailable();

        if ($mustCompress && ! $ffmpeg) {
            throw new RuntimeException(
                'Videos of 100 MB or larger must be compressed on the server. Install ffmpeg on the host or upload a smaller file.',
            );
        }

        if ($ffmpeg) {
            $this->runFfmpeg([
                'ffmpeg', '-y', '-i', $file->getPathname(),
                '-vf', $scaleFilter,
                '-c:v', 'libx264', '-crf', '28', '-preset', 'medium',
                '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart',
                $dest,
            ]);
            $storedBytes = is_file($dest) ? (int) filesize($dest) : 0;

            return $this->compressionStats(true, $originalBytes, $storedBytes);
        }

        $file->move(dirname($dest), basename($dest));
        $storedBytes = is_file($dest) ? (int) filesize($dest) : $originalBytes;

        return $this->compressionStats(false, $originalBytes, $storedBytes);
    }

    /**
     * @return array{
     *   applied: bool,
     *   original_bytes: int,
     *   stored_bytes: int,
     *   saved_percent: float
     * }
     */
    private function compressionStats(bool $applied, int $originalBytes, int $storedBytes): array
    {
        $savedPercent = 0.0;
        if ($applied && $originalBytes > 0 && $storedBytes > 0 && $storedBytes < $originalBytes) {
            $savedPercent = round((1 - ($storedBytes / $originalBytes)) * 100, 1);
        }

        return [
            'applied' => $applied,
            'original_bytes' => $originalBytes,
            'stored_bytes' => $storedBytes,
            'saved_percent' => $savedPercent,
        ];
    }

    public function storeLocationLandscape(UploadedFile $file): array
    {
        $dir = $this->uploadDirectory('banner', 'images');

        $name = $this->uniqueName('location', 'webp');
        $path = $dir.DIRECTORY_SEPARATOR.$name;

        $this->convertImageToWebp($file->getPathname(), $path, 2560, 82);

        return [
            'file_name' => $name,
            'file_path' => 'uploads/banner/images/'.$name,
        ];
    }

    /**
     * @param  string  $folder  e.g. about, experiences, stays, dining
     * @return array{file_name: string, file_path: string}
     */
    public function storeHomeSectionImage(UploadedFile $file, string $folder): array
    {
        $safe = preg_replace('/[^a-z0-9_-]/', '', strtolower($folder)) ?: 'misc';
        $dir = $this->uploadDirectory('home', $safe);

        $name = $this->uniqueName('home_'.$safe, 'webp');
        $path = $dir.DIRECTORY_SEPARATOR.$name;

        $this->convertImageToWebp($file->getPathname(), $path, 2400, 82);

        return [
            'file_name' => $name,
            'file_path' => 'uploads/home/'.$safe.'/'.$name,
        ];
    }

    public function deletePublicFile(?string $relativePath): void
    {
        if (! $relativePath) {
            return;
        }
        $full = public_path(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativePath));
        if (is_file($full)) {
            @unlink($full);
        }
    }

    public function publicUrl(?string $relativePath): ?string
    {
        if (! $relativePath) {
            return null;
        }

        $path = ltrim(str_replace('\\', '/', $relativePath), '/');
        $base = rtrim((string) config('app.media_url', config('app.url')), '/');

        return $base.'/'.$path;
    }

    private function uniqueName(string $prefix, string $extension): string
    {
        return $prefix.'_'.now()->format('YmdHis').'_'.Str::lower(Str::random(10)).'.'.ltrim($extension, '.');
    }

    /**
     * Resolve public/uploads/... and create the full path if missing.
     *
     * @param  string  ...$segments  Path under public/uploads (e.g. "banner", "images")
     */
    private function uploadDirectory(string ...$segments): string
    {
        $relative = 'uploads/'.implode('/', array_map(
            static fn (string $part) => trim(str_replace(['\\', '..'], '', $part), '/'),
            $segments,
        ));

        $dir = public_path(str_replace('/', DIRECTORY_SEPARATOR, $relative));
        $this->ensureDir($dir);

        return $dir;
    }

    private function ensureDir(string $dir): void
    {
        if (is_dir($dir)) {
            return;
        }

        try {
            File::ensureDirectoryExists($dir, 0755, true);
        } catch (\Throwable $e) {
            throw new RuntimeException(
                'Could not create upload folder: '.$dir,
                0,
                $e,
            );
        }

        if (! is_dir($dir) || ! is_writable($dir)) {
            throw new RuntimeException('Upload folder is not writable: '.$dir);
        }
    }

    private function convertImageToWebp(string $source, string $dest, int $maxWidth, int $quality): void
    {
        if (! function_exists('imagewebp')) {
            throw new RuntimeException('GD WebP support is required for image uploads.');
        }

        [$width, $height, $type] = @getimagesize($source) ?: [0, 0, 0];
        if ($width < 1 || $height < 1) {
            throw new RuntimeException('Invalid image file.');
        }

        $src = match ($type) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($source),
            IMAGETYPE_PNG => @imagecreatefrompng($source),
            IMAGETYPE_WEBP => @imagecreatefromwebp($source),
            default => false,
        };

        if ($src === false) {
            throw new RuntimeException('Unsupported image format.');
        }

        if ($width > $maxWidth) {
            $newW = $maxWidth;
            $newH = (int) round($height * ($maxWidth / $width));
            $resized = imagecreatetruecolor($newW, $newH);
            imagealphablending($resized, true);
            imagesavealpha($resized, true);
            imagecopyresampled($resized, $src, 0, 0, 0, 0, $newW, $newH, $width, $height);
            imagedestroy($src);
            $src = $resized;
        }

        if (! imagewebp($src, $dest, $quality)) {
            imagedestroy($src);
            throw new RuntimeException('Could not write WebP image.');
        }

        imagedestroy($src);
    }

    private function ffmpegAvailable(): bool
    {
        $out = [];
        $code = 1;
        @exec('ffmpeg -version 2>&1', $out, $code);

        return $code === 0;
    }

    /**
     * @param  list<string>  $command
     */
    private function runFfmpeg(array $command): void
    {
        $escaped = array_map(static fn (string $part) => escapeshellarg($part), $command);
        $line = implode(' ', $escaped);
        $out = [];
        $code = 1;
        $dest = $command[array_key_last($command)] ?? null;
        if (is_string($dest) && $dest !== '') {
            $this->ensureDir(dirname($dest));
        }

        @exec($line.' 2>&1', $out, $code);
        if ($code !== 0) {
            throw new RuntimeException('Video processing failed. Install ffmpeg or upload a smaller MP4.');
        }
    }
}
