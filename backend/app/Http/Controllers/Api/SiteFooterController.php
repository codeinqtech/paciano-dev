<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteFooter;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

class SiteFooterController extends Controller
{
    public function publicIndex()
    {
        try {
            $data = $this->buildPayload();
        } catch (\Throwable) {
            $data = [
                'settings' => null,
                'social' => [],
                'location_info' => [],
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function adminIndex(Request $request)
    {
        $this->ensureFooterPermission($request);

        return response()->json([
            'success' => true,
            'data' => $this->buildPayload(),
        ]);
    }

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

        $row = SiteFooter::singleton();
        $row->update($data);

        return response()->json([
            'success' => true,
            'data' => $this->settingsToArray($row->fresh()),
        ]);
    }

    public function storeSocial(Request $request)
    {
        $this->ensureFooterPermission($request);

        $data = $request->validate([
            'platform' => ['required', 'string', 'max:50'],
            'url' => ['required', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $row = SiteFooter::singleton();
        $links = $row->social_links ?? [];
        $item = [
            'id' => $row->nextJsonItemId($links),
            'platform' => strtolower(trim($data['platform'])),
            'url' => trim($data['url']),
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => true,
        ];
        $links[] = $item;
        $row->update(['social_links' => $links]);

        return response()->json([
            'success' => true,
            'data' => $item,
        ], 201);
    }

    public function updateSocial(Request $request, int $id)
    {
        $this->ensureFooterPermission($request);

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

        $row = SiteFooter::singleton();
        $links = $row->social_links ?? [];
        $updated = $this->patchJsonItem($links, $id, $data);
        $row->update(['social_links' => $links]);

        return response()->json([
            'success' => true,
            'data' => $updated,
        ]);
    }

    public function destroySocial(Request $request, int $id)
    {
        $this->ensureFooterPermission($request);

        $row = SiteFooter::singleton();
        $links = $row->social_links ?? [];
        $this->softDeleteJsonItem($links, $id);
        $row->update(['social_links' => $links]);

        return response()->json([
            'success' => true,
            'message' => 'Social link removed.',
        ]);
    }

    public function storeLocationInfo(Request $request)
    {
        $this->ensureFooterPermission($request);

        $data = $request->validate([
            'info_label' => ['required', 'string', 'max:120'],
            'info_value' => ['required', 'string', 'max:500'],
            'info_icon' => ['nullable', 'string', 'max:40'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $row = SiteFooter::singleton();
        $items = $row->location_info ?? [];
        $item = [
            'id' => $row->nextJsonItemId($items),
            'info_label' => trim($data['info_label']),
            'info_value' => trim($data['info_value']),
            'info_icon' => $data['info_icon'] ?? 'car',
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => true,
        ];
        $items[] = $item;
        $row->update(['location_info' => $items]);

        return response()->json([
            'success' => true,
            'data' => $item,
        ], 201);
    }

    public function updateLocationInfo(Request $request, int $id)
    {
        $this->ensureFooterPermission($request);

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

        $row = SiteFooter::singleton();
        $items = $row->location_info ?? [];
        $updated = $this->patchJsonItem($items, $id, $data);
        $row->update(['location_info' => $items]);

        return response()->json([
            'success' => true,
            'data' => $updated,
        ]);
    }

    public function destroyLocationInfo(Request $request, int $id)
    {
        $this->ensureFooterPermission($request);

        $row = SiteFooter::singleton();
        $items = $row->location_info ?? [];
        $this->softDeleteJsonItem($items, $id);
        $row->update(['location_info' => $items]);

        return response()->json([
            'success' => true,
            'message' => 'Location detail removed.',
        ]);
    }

    /**
     * @param  list<array<string, mixed>>  $items
     * @param  array<string, mixed>  $patch
     * @return array<string, mixed>
     */
    private function patchJsonItem(array &$items, int $id, array $patch): array
    {
        foreach ($items as $index => $item) {
            if ((int) ($item['id'] ?? 0) !== $id || ($item['is_active'] ?? true) === false) {
                continue;
            }
            $items[$index] = array_merge($item, $patch);

            return $items[$index];
        }

        abort(404);
    }

    /**
     * @param  list<array<string, mixed>>  $items
     */
    private function softDeleteJsonItem(array &$items, int $id): void
    {
        foreach ($items as $index => $item) {
            if ((int) ($item['id'] ?? 0) === $id && ($item['is_active'] ?? true) !== false) {
                $items[$index]['is_active'] = false;

                return;
            }
        }

        abort(404);
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
    private function buildPayload(): array
    {
        $row = SiteFooter::singleton();

        if (! $row->is_active) {
            return [
                'settings' => null,
                'social' => [],
                'location_info' => [],
            ];
        }

        return [
            'settings' => $this->settingsToArray($row),
            'social' => $row->activeSocialLinks(),
            'location_info' => $row->activeLocationInfo(),
        ];
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
}
