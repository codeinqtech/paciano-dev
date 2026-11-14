<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppSetting extends Model
{
    protected $table = 'whatsapp_settings';
    
    protected $fillable = [
        'api_version',
        'phone_number_id',
        'business_account_id',
        'access_token',
        'recipient',
        'template_name',
        'template_language',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'access_token' => 'encrypted',
            'is_active' => 'boolean',
        ];
    }
}
