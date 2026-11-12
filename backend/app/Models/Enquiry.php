<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enquiry extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'email',
        'preferred_dates',
        'message',
        'status',
        'whatsapp_status',
        'whatsapp_message_sid',
        'whatsapp_error',
    ];
}
