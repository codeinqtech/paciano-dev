<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use RuntimeException;

class HomeMediaService
{
    public function storeBannerImage(UploadedFile $file): array
    {
        $dir = public_path('uploads/banner/images');
        $this->ensureDir($dir);

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
        $dir = public_path('uploads/banner/videos');
        $this->ensureDir($dir);

        $ext = strtolower($file->getClientOriginalExtension() ?: 'mp4');
        $name = $this->uniqueName('banner_vid', $ext === 'mov' ? 'mp4' : ($ext ?: 'mp4'));
        $dest = $dir.DIRECTORY_SEPARATOR.$name;

        if ($this->ffmpegAvailable()) {
            $tmp = $file->getPathname();
            $this->runFfmpeg([
                'ffmpeg', '-y', '-i', $tmp,
                '-vf', 'scale=min(1920\\,iw):-2',
                '-c:v', 'libx264', '-crf', '28', '-preset', 'medium',
                '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart',
                $dest,
            ]);
        } else {
            $file->move($dir, $name);
        }

        return [
            'file_name' => $name,
            'file_path' => 'uploads/banner/videos/'.$name,
        ];
    }

    public function storeReviewThumbnail(UploadedFile $file, int $year): array
    {
        $dir = public_path('uploads/reviews/'.$year);
        $this->ensureDir($dir);

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

        $dir = public_path('uploads/reviews/'.$year);
        $this->ensureDir($dir);

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
        $dir = public_path('uploads/reviews/'.$year);
        $this->ensureDir($dir);

        $name = $this->uniqueName('review_vid', 'mp4');
        $dest = $dir.DIRECTORY_SEPARATOR.$name;

        if ($this->ffmpegAvailable()) {
            $this->runFfmpeg([
                'ffmpeg', '-y', '-i', $file->getPathname(),
                '-vf', 'scale=min(1280\\,iw):-2',
                '-c:v', 'libx264', '-crf', '28', '-preset', 'medium',
                '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart',
                $dest,
            ]);
        } else {
            $file->move($dir, $name);
        }

        return [
            'file_name' => $name,
            'file_path' => 'uploads/reviews/'.$year.'/'.$name,
        ];
    }

    public function storeLocationLandscape(UploadedFile $file): array
    {
        $dir = public_path('uploads/banner/images');
        $this->ensureDir($dir);

        $name = $this->uniqueName('location', 'webp');
        $path = $dir.DIRECTORY_SEPARATOR.$name;

        $this->convertImageToWebp($file->getPathname(), $path, 2560, 82);

        return [
            'file_name' => $name,
            'file_path' => 'uploads/banner/images/'.$name,
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

        return url('/'.ltrim(str_replace('\\', '/', $relativePath), '/'));
    }

    private function uniqueName(string $prefix, string $extension): string
    {
        return $prefix.'_'.now()->format('YmdHis').'_'.Str::lower(Str::random(10)).'.'.ltrim($extension, '.');
    }

    private function ensureDir(string $dir): void
    {
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
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
        @exec($line.' 2>&1', $out, $code);
        if ($code !== 0) {
            throw new RuntimeException('Video processing failed. Install ffmpeg or upload a smaller MP4.');
        }
    }
}
