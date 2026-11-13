<?php

namespace App\Services;

use App\Models\Enquiry;
use Throwable;

class EnquiryService
{
    public function __construct(
        private WhatsAppService $whatsapp
    ) {}

    public function create(array $data): Enquiry
    {
        // First save enquiry in database.
        $enquiry = Enquiry::create([
            'name' => $data['name'],
            'phone' => $data['phone'],
            'email' => $data['email'] ?? null,
            'preferred_dates' => $data['preferred_dates'] ?? null,
            'message' => $data['message'],
            'status' => 'new',
            'whatsapp_status' => 'pending',
        ]);

        // Then send WhatsApp notification.
        try {
            $result = $this->whatsapp->sendEnquiry($enquiry);

            $enquiry->update([
                'whatsapp_status' => $result['messages'][0]['message_status']
                    ?? 'accepted',
                'whatsapp_message_sid' => $result['messages'][0]['id']
                    ?? null,
                'whatsapp_error' => null,
            ]);

        } catch (Throwable $e) {
            logger()->error('Enquiry WhatsApp notification failed', [
                'enquiry_id' => $enquiry->id,
                'error' => $e->getMessage(),
            ]);

            $enquiry->update([
                'whatsapp_status' => 'failed',
                'whatsapp_error' => $e->getMessage(),
            ]);
        }
        return $enquiry->fresh();
    }
}
