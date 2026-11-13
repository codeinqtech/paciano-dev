<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (! $this->hasHomeStayItemsTable()) {
            return;
        }

        DB::table('home_stay_items')
            ->whereIn('slug', ['garden', 'valley'])
            ->update(['is_active' => false]);

        DB::table('home_stay_items')
            ->where('slug', 'riverside')
            ->update([
                'menu_label' => 'Deluxe Rooms',
                'button_descriptor' => 'RIVER & MOUNTAINS',
                'photo_label' => 'DELUXE ROOMS',
                'is_active' => true,
                'sort_order' => 10,
            ]);

        DB::table('home_stay_items')
            ->where('slug', 'family')
            ->update([
                'button_descriptor' => 'RIVER & MOUNTAINS',
                'is_active' => true,
                'sort_order' => 20,
            ]);
    }

    public function down(): void
    {
        if (! $this->hasHomeStayItemsTable()) {
            return;
        }

        DB::table('home_stay_items')
            ->whereIn('slug', ['garden', 'valley'])
            ->update(['is_active' => true]);

        DB::table('home_stay_items')
            ->where('slug', 'riverside')
            ->update([
                'menu_label' => 'Premium Suites',
                'photo_label' => 'RIVERSIDE SUITE',
                'sort_order' => 10,
            ]);

        DB::table('home_stay_items')
            ->where('slug', 'family')
            ->update([
                'button_descriptor' => 'TOGETHER IN NATURE',
                'sort_order' => 40,
            ]);
    }

    private function hasHomeStayItemsTable(): bool
    {
        try {
            return \Illuminate\Support\Facades\Schema::hasTable('home_stay_items');
        } catch (\Throwable) {
            return false;
        }
    }
};
