<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'superadmin@paciano.local'],
            [
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'phone' => null,
                'password' => 'ChangeMe123!',
                'role' => 'superadmin',
                'permissions' => ['*'],
                'active' => true,
            ],
        );
    }
}
