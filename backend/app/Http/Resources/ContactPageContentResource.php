
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactPageContentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            // Banner section
            'banner_image' => $this->banner_image,
            'heading_one' => $this->heading_one,
            'heading_two' => $this->heading_two,
            'heading_highlight' => $this->heading_highlight,

            // Connect with us section
            'connect_with_us' => $this->connect_with_us,
            'connect_with_us_supporting_text' => $this->connect_with_us_supporting_text,
            'connect_with_us_image_one' => $this->connect_with_us_image_one,
            'connect_with_us_image_two' => $this->connect_with_us_image_two,

            // Subtitles
            'subtitle_one' => $this->subtitle_one,
            'subtitle_two' => $this->subtitle_two,

            // Send message section
            'send_us_message_text' => $this->send_us_message_text,

            // Until we meet section
            'until_we_meet_text' => $this->until_we_meet_text,
            'until_we_meet_video' => $this->until_we_meet_video,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
