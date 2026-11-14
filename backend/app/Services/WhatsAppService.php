<?php

namespace App\Services;

use App\Models\Enquiry;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class WhatsAppService
{
    public function __construct(
        private WhatsAppSettingsService $settingsService
    ) {}

    public function sendEnquiry(Enquiry $enquiry): array
    {
        // Get active WhatsApp configuration from database
        $config = $this->settingsService->getConfig();

        $version = $config['api_version'];
        $phoneNumberId = $config['phone_number_id'];
        $token = $config['access_token'];
        $recipient = $config['recipient'];
        $templateName = $config['template_name'];
        $language = $config['template_language'];

        if (!$version || !$phoneNumberId || !$token || !$recipient || !$templateName) {
            throw new RuntimeException(
                'Active Meta WhatsApp configuration is incomplete.'
            );
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

        $url = "https://graph.facebook.com/{$version}/{$phoneNumberId}/messages";

        $response = Http::withToken($token)
            ->acceptJson()
            ->timeout(30)
            ->post($url, $payload);

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
