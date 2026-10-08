<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteFooter;
use App\Models\User;
use Illuminate\Http\Request;

class SiteFooterController extends Controller
{
    /**
     * GET /api/site-footer — public footer content (active only).
     */
    public function publicIndex()
    {
        return response()->json([
            'success' => true,
            'data' => $this->buildPublicPayload(),
        ]);
    }

    /**
     * GET /api/admin/site-footer
     */
    public function adminIndex(Request $request)
    {
        $this->ensureFooterPermission($request);

        return response()->json([
            'success' => true,
            'data' => $this->buildAdminPayload(),
        ]);
    }

    /**
     * PUT /api/admin/site-footer/settings
     */
    public function updateSettings(Request $request)
    {
        $this->ensureFooterPermission($request);

        $data = $request->validate([
            'intro_paragraph' => ['nullable', 'string', 'max:5000'],
            'map_address' => ['nullable', 'string', 'max:500'],
            'map_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'map_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'map_title' => ['nullable', 'string', 'max:200'],
            'map_subtitle' => ['nullable', 'string', 'max:200'],
            'map_description' => ['nullable', 'string', 'max:5000'],
            'location_eyebrow' => ['nullable', 'string', 'max:120'],
            'location_heading' => ['nullable', 'string', 'max:200'],
            'location_subtitle' => ['nullable', 'string', 'max:200'],
            'location_description' => ['nullable', 'string', 'max:5000'],
            'maps_link' => ['nullable', 'string', 'max:500'],
        ]);

        $row = SiteFooter::query()->firstOrCreate(
            ['kind' => SiteFooter::KIND_SETTINGS],
            ['is_active' => true],
        );

        $row->update($data);

        return response()->json([
            'success' => true,
            'data' => $this->settingsToArray($row->fresh()),
        ]);
    }

    /**
     * POST /api/admin/site-footer/social
     */
    public function storeSocial(Request $request)
    {
        $this->ensureFooterPermission($request);

        $data = $request->validate([
            'platform' => ['required', 'string', 'max:50'],
            'url' => ['required', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $item = SiteFooter::query()->create([
            'kind' => SiteFooter::KIND_SOCIAL,
            'platform' => strtolower(trim($data['platform'])),
            'url' => trim($data['url']),
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->socialToArray($item),
        ], 201);
    }

    /**
     * PUT /api/admin/site-footer/social/{id}
     */
    public function updateSocial(Request $request, int $id)
    {
        $this->ensureFooterPermission($request);

        $item = $this->findActiveSocial($id);

        $data = $request->validate([
            'platform' => ['sometimes', 'string', 'max:50'],
            'url' => ['sometimes', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        if (isset($data['platform'])) {
            $data['platform'] = strtolower(trim($data['platform']));
        }
        if (isset($data['url'])) {
            $data['url'] = trim($data['url']);
        }

        $item->update($data);

        return response()->json([
            'success' => true,
            'data' => $this->socialToArray($item->fresh()),
        ]);
    }

    /**
     * DELETE /api/admin/site-footer/social/{id}
     */
    public function destroySocial(Request $request, int $id)
    {
        $this->ensureFooterPermission($request);

        $item = $this->findActiveSocial($id);
        $item->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Social link removed.',
        ]);
    }

    /**
     * POST /api/admin/site-footer/location-info
     */
    public function storeLocationInfo(Request $request)
    {
        $this->ensureFooterPermission($request);

        $data = $request->validate([
            'info_label' => ['required', 'string', 'max:120'],
            'info_value' => ['required', 'string', 'max:500'],
            'info_icon' => ['nullable', 'string', 'max:40'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $item = SiteFooter::query()->create([
            'kind' => SiteFooter::KIND_LOCATION_INFO,
            'info_label' => trim($data['info_label']),
            'info_value' => trim($data['info_value']),
            'info_icon' => $data['info_icon'] ?? 'map_pin',
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->locationInfoToArray($item),
        ], 201);
    }

    /**
     * PUT /api/admin/site-footer/location-info/{id}
     */
    public function updateLocationInfo(Request $request, int $id)
    {
        $this->ensureFooterPermission($request);

        $item = $this->findActiveLocationInfo($id);

        $data = $request->validate([
            'info_label' => ['sometimes', 'string', 'max:120'],
            'info_value' => ['sometimes', 'string', 'max:500'],
            'info_icon' => ['nullable', 'string', 'max:40'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        if (isset($data['info_label'])) {
            $data['info_label'] = trim($data['info_label']);
        }
        if (isset($data['info_value'])) {
            $data['info_value'] = trim($data['info_value']);
        }

        $item->update($data);

        return response()->json([
            'success' => true,
            'data' => $this->locationInfoToArray($item->fresh()),
        ]);
    }

    /**
     * DELETE /api/admin/site-footer/location-info/{id}
     */
    public function destroyLocationInfo(Request $request, int $id)
    {
        $this->ensureFooterPermission($request);

        $item = $this->findActiveLocationInfo($id);
        $item->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Location detail removed.',
        ]);
    }

    private function findActiveSocial(int $id): SiteFooter
    {
        return SiteFooter::query()
            ->where('kind', SiteFooter::KIND_SOCIAL)
            ->where('is_active', true)
            ->findOrFail($id);
    }

    private function findActiveLocationInfo(int $id): SiteFooter
    {
        return SiteFooter::query()
            ->where('kind', SiteFooter::KIND_LOCATION_INFO)
            ->where('is_active', true)
            ->findOrFail($id);
    }

    private function ensureFooterPermission(Request $request): void
    {
        /** @var User|null $user */
        $user = $request->user();
        if (! $user) {
            abort(401);
        }
        if (! $user->isSuperAdmin() && ! $user->hasMenuPermission('footer')) {
            abort(403, 'You do not have permission to manage footer content.');
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function buildPublicPayload(): array
    {
        $settings = SiteFooter::query()
            ->where('kind', SiteFooter::KIND_SETTINGS)
            ->where('is_active', true)
            ->first();

        $social = SiteFooter::query()
            ->where('kind', SiteFooter::KIND_SOCIAL)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (SiteFooter $r) => $this->socialToArray($r))
            ->values()
            ->all();

        $locationInfo = SiteFooter::query()
            ->where('kind', SiteFooter::KIND_LOCATION_INFO)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (SiteFooter $r) => $this->locationInfoToArray($r))
            ->values()
            ->all();

        return [
            'settings' => $settings ? $this->settingsToArray($settings) : null,
            'social' => $social,
            'location_info' => $locationInfo,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function buildAdminPayload(): array
    {
        $payload = $this->buildPublicPayload();

        $payload['social_all'] = SiteFooter::query()
            ->where('kind', SiteFooter::KIND_SOCIAL)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (SiteFooter $r) => $this->socialToArray($r))
            ->values()
            ->all();

        $payload['location_info_all'] = SiteFooter::query()
            ->where('kind', SiteFooter::KIND_LOCATION_INFO)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (SiteFooter $r) => $this->locationInfoToArray($r))
            ->values()
            ->all();

        return $payload;
    }

    /**
     * @return array<string, mixed>
     */
    private function settingsToArray(SiteFooter $row): array
    {
        return [
            'id' => $row->id,
            'intro_paragraph' => $row->intro_paragraph,
            'map_address' => $row->map_address,
            'map_latitude' => $row->map_latitude,
            'map_longitude' => $row->map_longitude,
            'map_title' => $row->map_title,
            'map_subtitle' => $row->map_subtitle,
            'map_description' => $row->map_description,
            'location_eyebrow' => $row->location_eyebrow,
            'location_heading' => $row->location_heading,
            'location_subtitle' => $row->location_subtitle,
            'location_description' => $row->location_description,
            'maps_link' => $row->maps_link,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function socialToArray(SiteFooter $row): array
    {
        return [
            'id' => $row->id,
            'platform' => $row->platform,
            'url' => $row->url,
            'sort_order' => $row->sort_order,
            'is_active' => (bool) $row->is_active,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function locationInfoToArray(SiteFooter $row): array
    {
        return [
            'id' => $row->id,
            'info_label' => $row->info_label,
            'info_value' => $row->info_value,
            'info_icon' => $row->info_icon,
            'sort_order' => $row->sort_order,
            'is_active' => (bool) $row->is_active,
        ];
    }
}
