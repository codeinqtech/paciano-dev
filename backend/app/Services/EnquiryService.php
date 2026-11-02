<?php

namespace App\Services;

use App\Models\Enquiry;

class EnquiryService
{
    public function create(array $data): Enquiry
    {
        return Enquiry::create([
            'name' => $data['name'],
            'phone' => $data['phone'],
            'email' => $data['email'] ?? null,
            'message' => $data['message'],
            'status' => 'new',
            'whatsapp_status' => 'pending',
        ]);
    }
}
