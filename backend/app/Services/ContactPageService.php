<?php

namespace App\Services;

use App\Models\ContactPageContent;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Throwable;

class ContactPageService
{
    private array $mediaFields = [
        'banner_image' => [
            'folder' => 'uploads/contact/images',
        ],
        'connect_with_us_image_one' => [
            'folder' => 'uploads/contact/images',
        ],
        'connect_with_us_image_two' => [
            'folder' => 'uploads/contact/images',
        ],
        'until_we_meet_video' => [
            'folder' => 'media/contact',
        ],
    ];

    public function getContent(): ContactPageContent
    {
        return ContactPageContent::firstOrCreate(['id' => 1]);
    }

    public function update(array $data): ContactPageContent
    {
        $content = $this->getContent();

        $oldFiles = [];
        $newFiles = [];

        try {
            foreach ($this->mediaFields as $field => $config) {

                if (
                    !isset($data[$field]) ||
                    !$data[$field] instanceof UploadedFile
                ) {
                    continue;
                }

                $file = $data[$field];

                $folder = $config['folder'];

                $directory = public_path($folder);

                File::ensureDirectoryExists($directory);

                $extension = strtolower(
                    $file->getClientOriginalExtension()
                );

                $filename = Str::uuid() . '.' . $extension;

                $file->move($directory, $filename);

                $newPath = $folder . '/' . $filename;

                $newFiles[] = $newPath;

                if ($content->{$field}) {
                    $oldFiles[] = $content->{$field};
                }

                $data[$field] = $newPath;
            }

            $content->update($data);

        } catch (Throwable $exception) {

            // Remove newly uploaded files if database update fails.
            foreach ($newFiles as $path) {
                File::delete(public_path($path));
            }

            throw $exception;
        }

        // Delete previous files only after successful DB update.
        foreach ($oldFiles as $path) {
            if (
                str_starts_with($path, 'uploads/contact/images/') ||
                str_starts_with($path, 'media/contact/')
            ) {
                File::delete(public_path($path));
            }
        }

        return $content->fresh();
    }
}
