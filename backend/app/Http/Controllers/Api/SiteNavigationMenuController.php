<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteNavigationMenu;
use App\Models\User;
use Illuminate\Http\Request;

class SiteNavigationMenuController extends Controller
{
    /**
     * GET /api/navigation-menus — public, active items only.
     */
    public function publicIndex()
    {
        $items = SiteNavigationMenu::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (SiteNavigationMenu $m) => $m->toPublicArray());

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    /**
     * GET /api/admin/navigation-menus
     */
    public function index(Request $request)
    {
        $this->ensureNavbarPermission($request);

        $items = SiteNavigationMenu::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (SiteNavigationMenu $m) => $this->toAdminArray($m));

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    /**
     * POST /api/admin/navigation-menus
     */
    public function store(Request $request)
    {
        $this->ensureNavbarPermission($request);

        $data = $request->validate([
            'label' => ['required', 'string', 'max:120'],
            'url' => ['required', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'open_in_new_tab' => ['nullable', 'boolean'],
        ]);

        $item = SiteNavigationMenu::query()->create([
            'label' => trim($data['label']),
            'url' => trim($data['url']),
            'sort_order' => $data['sort_order'] ?? 0,
            'open_in_new_tab' => $data['open_in_new_tab'] ?? false,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->toAdminArray($item),
        ], 201);
    }

    /**
     * PUT /api/admin/navigation-menus/{id}
     */
    public function update(Request $request, int $id)
    {
        $this->ensureNavbarPermission($request);

        $item = SiteNavigationMenu::query()->where('is_active', true)->findOrFail($id);

        $data = $request->validate([
            'label' => ['sometimes', 'string', 'max:120'],
            'url' => ['sometimes', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'open_in_new_tab' => ['nullable', 'boolean'],
        ]);

        if (isset($data['label'])) {
            $data['label'] = trim($data['label']);
        }
        if (isset($data['url'])) {
            $data['url'] = trim($data['url']);
        }

        $item->update($data);

        return response()->json([
            'success' => true,
            'data' => $this->toAdminArray($item->fresh()),
        ]);
    }

    /**
     * DELETE /api/admin/navigation-menus/{id} — soft delete (is_active = 0).
     */
    public function destroy(Request $request, int $id)
    {
        $this->ensureNavbarPermission($request);

        $item = SiteNavigationMenu::query()->where('is_active', true)->findOrFail($id);
        $item->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Menu item removed.',
        ]);
    }

    private function ensureNavbarPermission(Request $request): void
    {
        /** @var User|null $user */
        $user = $request->user();
        if (! $user) {
            abort(401);
        }
        if (! $user->isSuperAdmin() && ! $user->hasMenuPermission('navbar')) {
            abort(403, 'You do not have permission to manage navigation menus.');
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function toAdminArray(SiteNavigationMenu $item): array
    {
        return [
            'id' => $item->id,
            'label' => $item->label,
            'url' => $item->url,
            'sort_order' => $item->sort_order,
            'open_in_new_tab' => (bool) $item->open_in_new_tab,
            'is_active' => (bool) $item->is_active,
        ];
    }
}
