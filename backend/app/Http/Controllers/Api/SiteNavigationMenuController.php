<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteNavigationMenu;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class SiteNavigationMenuController extends Controller
{
    /**
     * GET /api/navigation-menus — public, active top-level items with nested children.
     */
    public function publicIndex()
    {
        try {
            $items = $this->buildPublicTree();
        } catch (\Throwable) {
            $items = collect();
        }

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
            ->orderByRaw('COALESCE(parent_id, 0)')
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
            'parent_id' => ['nullable', 'integer', 'exists:site_navigation_menu,id'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'open_in_new_tab' => ['nullable', 'boolean'],
        ]);

        $parentId = $data['parent_id'] ?? null;
        $this->assertValidParent($parentId);

        $item = SiteNavigationMenu::query()->create([
            'label' => trim($data['label']),
            'url' => trim($data['url']),
            'parent_id' => $parentId,
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
            'parent_id' => ['nullable', 'integer', 'exists:site_navigation_menu,id'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'open_in_new_tab' => ['nullable', 'boolean'],
        ]);

        if (array_key_exists('parent_id', $data)) {
            $parentId = $data['parent_id'];
            if ($parentId === $item->id) {
                abort(422, 'A menu item cannot be its own parent.');
            }
            $this->assertValidParent($parentId, $item->id);
        }

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

        SiteNavigationMenu::query()
            ->where('parent_id', $item->id)
            ->where('is_active', true)
            ->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Menu item removed.',
        ]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function buildPublicTree(): Collection
    {
        $rows = SiteNavigationMenu::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $childrenByParent = $rows->groupBy(
            fn (SiteNavigationMenu $m) => (string) ($m->parent_id ?? 'root'),
        );

        $build = function (string $parentKey) use (&$build, $childrenByParent): Collection {
            $bucket = $childrenByParent->get($parentKey, collect());

            return $bucket->map(function (SiteNavigationMenu $m) use (&$build) {
                $node = $m->toPublicArray();
                $kids = $build((string) $m->id);
                if ($kids->isNotEmpty()) {
                    $node['children'] = $kids->values()->all();
                }

                return $node;
            });
        };

        return $build('root')->values();
    }

    private function assertValidParent(?int $parentId, ?int $selfId = null): void
    {
        if ($parentId === null) {
            return;
        }

        $parent = SiteNavigationMenu::query()
            ->where('is_active', true)
            ->findOrFail($parentId);

        if ($parent->parent_id !== null) {
            abort(422, 'Submenus can only be placed under a top-level menu item.');
        }

        if ($selfId !== null && $parentId === $selfId) {
            abort(422, 'A menu item cannot be its own parent.');
        }
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
            'parent_id' => $item->parent_id,
            'label' => $item->label,
            'url' => $item->url,
            'sort_order' => $item->sort_order,
            'open_in_new_tab' => (bool) $item->open_in_new_tab,
            'is_active' => (bool) $item->is_active,
        ];
    }
}