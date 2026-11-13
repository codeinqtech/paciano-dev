<?php

namespace App\Services;

use App\Models\Enquiry;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class WhatsAppService
{
    public function sendEnquiry(Enquiry $enquiry): array
    {
        $version = config('services.meta_whatsapp.api_version');
        $phoneNumberId = config('services.meta_whatsapp.phone_number_id');
        $token = config('services.meta_whatsapp.access_token');

        $recipient = config('services.meta_whatsapp.recipient');
        $templateName = config('services.meta_whatsapp.template_name');
        $language = config('services.meta_whatsapp.template_language');

        if (!$version || !$phoneNumberId || !$token || !$recipient || !$templateName) {
            throw new RuntimeException('Meta WhatsApp configuration is incomplete.');
        }

        // Convert all whitespace into a single space.
        $clean = fn ($value) => preg_replace(
            '/\s+/',
            ' ',
            trim((string) ($value ?? '-'))
        );

        $parameters = [
            $clean($enquiry->name),
            $clean($enquiry->phone),
            $clean($enquiry->email),
            $clean($enquiry->preferred_dates),
            $clean($enquiry->message),
        ];

        $payload = [
            'messaging_product' => 'whatsapp',
            'to' => $recipient,
            'type' => 'template',
            'template' => [
                'name' => $templateName,
                'language' => [
                    'code' => $language ?: 'en',
                ],
                'components' => [
                    [
                        'type' => 'body',
                        'parameters' => array_map(
                            fn ($value) => [
                                'type' => 'text',
                                'text' => $value,
                            ],
                            $parameters
                        ),
                    ],
                ],
            ],
        ];

        $response = Http::withToken($token)
            ->acceptJson()
            ->timeout(30)
            ->post(
                "https://graph.facebook.com/{$version}/{$phoneNumberId}/messages",
                $payload
            );

        if (!$response->successful()) {
            logger()->error('Meta WhatsApp API Error', [
                'status' => $response->status(),
                'response' => $response->json(),
                'enquiry_id' => $enquiry->id,
            ]);

            throw new RuntimeException(
                $response->json('error.message')
                ?? 'Meta WhatsApp request failed.'
            );
        }

        return $response->json();
    }
}