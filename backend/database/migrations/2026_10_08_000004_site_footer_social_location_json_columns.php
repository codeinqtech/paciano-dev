<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_footer', function (Blueprint $table) {
            $table->json('social_links')->nullable()->after('maps_link');
            $table->json('location_info')->nullable()->after('social_links');
        });

        $this->migrateRowsIntoJson();

        Schema::table('site_footer', function (Blueprint $table) {
            $table->dropIndex(['kind', 'is_active', 'sort_order']);
            $table->dropColumn([
                'kind',
                'platform',
                'url',
                'info_label',
                'info_value',
                'info_icon',
                'sort_order',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('site_footer', function (Blueprint $table) {
            $table->string('kind', 32)->default('settings');
            $table->string('platform', 50)->nullable();
            $table->string('url', 500)->nullable();
            $table->string('info_label', 120)->nullable();
            $table->text('info_value')->nullable();
            $table->string('info_icon', 40)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->index(['kind', 'is_active', 'sort_order']);
            $table->dropColumn(['social_links', 'location_info']);
        });
    }

    private function migrateRowsIntoJson(): void
    {
        if (! Schema::hasColumn('site_footer', 'kind')) {
            return;
        }

        $settings = DB::table('site_footer')
            ->where('kind', 'settings')
            ->orderBy('id')
            ->first();

        $socialRows = DB::table('site_footer')
            ->where('kind', 'social')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $locationRows = DB::table('site_footer')
            ->where('kind', 'location_info')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $socialJson = $socialRows->map(fn ($r) => [
            'id' => (int) $r->id,
            'platform' => $r->platform,
            'url' => $r->url,
            'sort_order' => (int) $r->sort_order,
            'is_active' => true,
        ])->values()->all();

        $locationJson = $locationRows->map(fn ($r) => [
            'id' => (int) $r->id,
            'info_label' => $r->info_label,
            'info_value' => $r->info_value,
            'info_icon' => $r->info_icon,
            'sort_order' => (int) $r->sort_order,
            'is_active' => true,
        ])->values()->all();

        if ($settings) {
            DB::table('site_footer')->where('id', $settings->id)->update([
                'social_links' => json_encode($socialJson),
                'location_info' => json_encode($locationJson),
            ]);

            DB::table('site_footer')->where('id', '!=', $settings->id)->delete();
        } else {
            DB::table('site_footer')->insert([
                'intro_paragraph' => null,
                'social_links' => json_encode($socialJson),
                'location_info' => json_encode($locationJson),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
};
