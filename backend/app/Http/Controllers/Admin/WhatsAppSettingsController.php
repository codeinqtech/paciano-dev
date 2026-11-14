<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppSetting;
use App\Services\WhatsAppSettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Models\Enquiry;

class WhatsAppSettingsController extends Controller
{
    public function __construct(
        private WhatsAppSettingsService $whatsAppSettingsService
    ) {}

    // Get all configurations
    public function index(): JsonResponse
    {
        $settings = WhatsAppSetting::query()
            ->orderByDesc('is_active')
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn ($setting) => $this->formatSettings($setting));

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    // Get single configuration
    public function show(WhatsAppSetting $whatsAppSetting): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->formatSettings($whatsAppSetting),
        ]);
    }

    // Create new configuration
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'api_version' => ['required', 'string', 'max:50'],
            'phone_number_id' => ['required', 'string', 'max:255'],
            'business_account_id' => ['nullable', 'string', 'max:255'],
            'access_token' => ['required', 'string'],
            'recipient' => ['required', 'string', 'max:30'],
            'template_name' => ['required', 'string', 'max:255'],
            'template_language' => ['required', 'string', 'max:20'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $settings = $this->whatsAppSettingsService
            ->createSettings($data);

        return response()->json([
            'success' => true,
            'message' => 'WhatsApp configuration created successfully.',
            'data' => $this->formatSettings($settings),
        ], 201);
    }

    // Update existing configuration
    public function update(
        Request $request,
        WhatsAppSetting $whatsAppSetting
    ): JsonResponse {
        $data = $request->validate([
            'api_version' => ['sometimes', 'required', 'string', 'max:50'],
            'phone_number_id' => ['sometimes', 'required', 'string', 'max:255'],
            'business_account_id' => ['sometimes', 'nullable', 'string', 'max:255'],
            'access_token' => ['sometimes', 'nullable', 'string'],
            'recipient' => ['sometimes', 'required', 'string', 'max:30'],
            'template_name' => ['sometimes', 'required', 'string', 'max:255'],
            'template_language' => ['sometimes', 'required', 'string', 'max:20'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        // Blank token means keep the existing token
        if (empty($data['access_token'] ?? null)) {
            unset($data['access_token']);
        }

        $settings = $this->whatsAppSettingsService
            ->updateSettings($whatsAppSetting, $data);

        return response()->json([
            'success' => true,
            'message' => 'WhatsApp configuration updated successfully.',
            'data' => $this->formatSettings($settings),
        ]);
    }

    // Activate configuration
    public function activate(
        WhatsAppSetting $whatsAppSetting
    ): JsonResponse {
        $settings = $this->whatsAppSettingsService
            ->activateSettings($whatsAppSetting);

        return response()->json([
            'success' => true,
            'message' => 'WhatsApp configuration activated successfully.',
            'data' => $this->formatSettings($settings),
        ]);
    }

    // Safe response format - never expose access token
    private function formatSettings(WhatsAppSetting $settings): array
    {
        return [
            'id' => $settings->id,
            'api_version' => $settings->api_version,
            'phone_number_id' => $settings->phone_number_id,
            'business_account_id' => $settings->business_account_id,
            'access_token_configured' => !empty($settings->access_token),
            'recipient' => $settings->recipient,
            'template_name' => $settings->template_name,
            'template_language' => $settings->template_language,
            'is_active' => $settings->is_active,
            'created_at' => $settings->created_at,
            'updated_at' => $settings->updated_at,
        ];
    }

    public function enquiries(Request $request): JsonResponse
    {
        $query = Enquiry::query()->latest();

        if ($request->filled('whatsapp_status')) {
            $query->where(
                'whatsapp_status',
                $request->whatsapp_status
            );
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $enquiries = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $enquiries,
        ]);
    }
}
