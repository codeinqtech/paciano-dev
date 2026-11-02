<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class WhatsAppService
{
    public function send(string $message): array
    {
        $sid = config('services.twilio.account_sid');
        $token = config('services.twilio.auth_token');

        $response = Http::asForm()
            ->withBasicAuth($sid, $token)
            ->post(
                "https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json",
                [
                    'From' => config('services.twilio.whatsapp_from'),
                    'To' => config('services.twilio.whatsapp_to'),
                    'ContentSid' => config('services.twilio.content_sid'),
                ]
            );

        if (!$response->successful()) {
            logger()->error('Twilio API Error', [
                'status' => $response->status(),
                'response' => $response->json(),
            ]);

            throw new RuntimeException(
                $response->json('message') ?? 'Twilio request failed'
            );
        }

        return $response->json();
    }
}
