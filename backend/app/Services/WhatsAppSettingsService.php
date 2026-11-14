<?php

namespace App\Services;

use App\Models\WhatsAppSetting;
use Illuminate\Support\Facades\DB;

class WhatsAppSettingsService
{
    public function getSettings(): ?WhatsAppSetting
    {
        return WhatsAppSetting::query()
            ->where('is_active', true)
            ->first();
    }

    public function getConfig(): array
    {
        $settings = $this->getSettings();

        return [
            'api_version' => $settings?->api_version ?? 'v25.0',
            'phone_number_id' => $settings?->phone_number_id,
            'business_account_id' => $settings?->business_account_id,
            'access_token' => $settings?->access_token,
            'recipient' => $settings?->recipient,
            'template_name' => $settings?->template_name ?? 'paciano_new_enquiry',
            'template_language' => $settings?->template_language ?? 'en',
        ];
    }

    // Update existing configuration
    public function updateSettings(
        WhatsAppSetting $settings,
        array $data
    ): WhatsAppSetting {
        return DB::transaction(function () use ($settings, $data) {

            if (isset($data['is_active']) && $data['is_active']) {
                WhatsAppSetting::query()
                    ->where('id', '!=', $settings->id)
                    ->update(['is_active' => false]);
            }

            $settings->fill($data);
            $settings->save();

            return $settings->fresh();
        });
    }

    // Save as new configuration
    public function createSettings(array $data): WhatsAppSetting
    {
        return DB::transaction(function () use ($data) {

            if ($data['is_active'] ?? false) {
                WhatsAppSetting::query()
                    ->update(['is_active' => false]);
            }

            return WhatsAppSetting::create($data);
        });
    }

    // Activate an existing configuration
    public function activateSettings(
        WhatsAppSetting $settings
    ): WhatsAppSetting {
        return DB::transaction(function () use ($settings) {

            WhatsAppSetting::query()
                ->update(['is_active' => false]);

            $settings->is_active = true;
            $settings->save();

            return $settings->fresh();
        });
    }
}
