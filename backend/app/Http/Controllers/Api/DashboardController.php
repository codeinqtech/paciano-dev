<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $counts = [
            'homepage' => 1,
            'contact' => 1,
            'stay' => 1,
            'navbar' => 1,
            'footer' => 1,
        ];

        if ($user->isSuperAdmin()) {
            $counts['users'] = User::query()->count();
        }

        return response()->json([
            'success' => true,
            'data' => $counts,
        ]);
    }
}
