<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Support\MediaUploadLimits;

class ContactPageContentResource extends JsonResource
{
    private function mediaUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        return rtrim(config('app.url'), '/') . '/' . ltrim($path, '/');
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            // Banner section
            'banner_image' => $this->mediaUrl($this->banner_image),
            'heading_one' => $this->heading_one,
            'heading_two' => $this->heading_two,
            'heading_highlight' => $this->heading_highlight,

            // Connect With Us section
            'connect_with_us' => $this->connect_with_us,
            'connect_with_us_supporting_text' => $this->connect_with_us_supporting_text,
            'connect_with_us_image_one' => $this->mediaUrl($this->connect_with_us_image_one),
            'connect_with_us_image_two' => $this->mediaUrl($this->connect_with_us_image_two),

            // Subtitle section
            'subtitle_one' => $this->subtitle_one,
            'subtitle_two' => $this->subtitle_two,

            // Message section
            'send_us_message_text' => $this->send_us_message_text,
            'whatsapp_number' => $this->whatsapp_number,

            // Video section
            'until_we_meet_text' => $this->until_we_meet_text,
            'until_we_meet_video' => $this->mediaUrl($this->until_we_meet_video),
            'video_max_kb' => MediaUploadLimits::videoMaxKb(),
        ];
    }
}
