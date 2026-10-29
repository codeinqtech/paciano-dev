<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactPageContent extends Model
{
    protected $fillable = [
        'banner_image',
        'heading_one',
        'heading_two',
        'heading_highlight',
        'connect_with_us',
        'connect_with_us_supporting_text',
        'connect_with_us_image_one',
        'connect_with_us_image_two',
        'subtitle_one',
        'subtitle_two',
        'send_us_message_text',
        'until_we_meet_text',
        'until_we_meet_video',
    ];
}