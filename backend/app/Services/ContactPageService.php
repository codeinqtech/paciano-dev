
<?php

namespace App\Services;

use App\Models\ContactPageContent;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Throwable;

class ContactPageService
{
    public function __construct(private HomeMediaService $media) {}

    /** @var array<string, 'image'|'video'> */
    private array $mediaFields = [
        'banner_image' => 'image',
        'connect_with_us_image_one' => 'image',
        'connect_with_us_image_two' => 'image',
        'until_we_meet_video' => 'video',
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
            foreach ($this->mediaFields as $field => $kind) {
                if (
                    ! isset($data[$field]) ||
                    ! $data[$field] instanceof UploadedFile
                ) {
                    continue;
                }

                /** @var UploadedFile $file */
                $file = $data[$field];

                if ($kind === 'image') {
                    $stored = $this->media->storeContactPageImage($file);
                    $newPath = $stored['file_path'];
                } else {
                    $stored = $this->media->storeContactPageVideo($file);
                    $newPath = $stored['file_path'];
                }

                $newFiles[] = $newPath;

                if ($content->{$field}) {
                    $oldFiles[] = $content->{$field};
                }

                $data[$field] = $newPath;
            }

            $content->update($data);

        } catch (Throwable $exception) {
            foreach ($newFiles as $path) {
                File::delete(public_path($path));
            }

            throw $exception;
        }

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
