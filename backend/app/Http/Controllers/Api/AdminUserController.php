<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Rules\IndianPhone;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminUserController extends Controller
{
    /**
     * GET /api/admin/users
     */
    public function index(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $users = User::query()
            ->orderBy('id')
            ->get()
            ->map(fn (User $u) => $u->toPublicArray());

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * POST /api/admin/users
     */
    public function store(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'username' => ['required', 'string', 'max:120', 'unique:users,username'],
            'email' => ['required', 'email:filter', 'max:190', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:40', new IndianPhone(true)],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'in:superadmin,admin'],
            'permissions' => ['nullable', 'array'],
            'active' => ['nullable', 'boolean'],
        ]);

        $user = User::query()->create([
            'name' => $data['name'],
            'username' => strtolower(trim($data['username'])),
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => $data['password'],
            'role' => $data['role'],
            'permissions' => $data['role'] === 'superadmin'
                ? ['*']
                : ($data['permissions'] ?? []),
            'active' => $data['active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'data' => $user->toPublicArray(),
        ], 201);
    }

    /**
     * PUT /api/admin/users/{id}
     */
    public function update(Request $request, int $id)
    {
        $this->ensureSuperAdmin($request);

        $user = User::query()->findOrFail($id);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'username' => ['sometimes', 'string', 'max:120', Rule::unique('users', 'username')->ignore($user->id)],
            'email' => ['sometimes', 'email:filter', 'max:190', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:40', new IndianPhone(true)],
            'password' => ['nullable', 'string', 'min:6'],
            'role' => ['sometimes', 'in:superadmin,admin'],
            'permissions' => ['nullable', 'array'],
            'active' => ['nullable', 'boolean'],
        ]);

        if (isset($data['password']) && $data['password'] === '') {
            unset($data['password']);
        }

        if (($data['role'] ?? $user->role) === 'superadmin') {
            $data['permissions'] = ['*'];
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'data' => $user->fresh()->toPublicArray(),
        ]);
    }

    /**
     * DELETE /api/admin/users/{id}
     */
    public function destroy(Request $request, int $id)
    {
        $this->ensureSuperAdmin($request);

        if ((int) $request->user()->id === $id) {
            throw ValidationException::withMessages([
                'id' => ['You cannot delete your own account.'],
            ]);
        }

        User::query()->whereKey($id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted.',
        ]);
    }

    private function ensureSuperAdmin(Request $request): void
    {
        if (! $request->user()?->isSuperAdmin()) {
            abort(403, 'Only superadmin can manage users.');
        }
    }
}
