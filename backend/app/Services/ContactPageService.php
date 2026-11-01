<?php

namespace App\Services;

use App\Models\ContactPageContent;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ContactPageService
{
    public function getContent(): ContactPageContent
    {
        return ContactPageContent::firstOrCreate(
            ['id' => 1]
        );
    }

    public function update(array $data): ContactPageContent
    {
        if (isset($data['until_we_meet_video']) && $data['until_we_meet_video'] instanceof UploadedFile) {
            $video = $data['until_we_meet_video'];

            $folder = public_path('media/contact');

            File::ensureDirectoryExists($folder);

            $filename = 'contact_video_' . Str::uuid() . '.' . $video->getClientOriginalExtension();

            $video->move($folder, $filename);

            $data['until_we_meet_video'] = 'media/contact/' . $filename;
        }
        $content = $this->getContent();

        $content->update($data);

        return $content->refresh();
    }
}
