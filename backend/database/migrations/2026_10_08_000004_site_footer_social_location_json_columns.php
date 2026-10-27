<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add columns only if they do not already exist.
        if (!Schema::hasColumn('site_footer', 'social_links')) {
            Schema::table('site_footer', function (Blueprint $table) {
                $table->json('social_links')->nullable();
            });
        }

        if (!Schema::hasColumn('site_footer', 'location_info')) {
            Schema::table('site_footer', function (Blueprint $table) {
                $table->json('location_info')->nullable();
            });
        }

        // Migrate old rows into the JSON columns.
        $this->migrateRowsIntoJson();

        // Drop the old index and columns only if they exist.
        if (Schema::hasColumn('site_footer', 'kind')) {
            Schema::table('site_footer', function (Blueprint $table) {
                $table->dropIndex(['kind', 'is_active', 'sort_order']);
            });
        }

        $legacyColumns = [
            'kind',
            'platform',
            'url',
            'info_label',
            'info_value',
            'info_icon',
            'sort_order',
        ];

        foreach ($legacyColumns as $column) {
            if (Schema::hasColumn('site_footer', $column)) {
                Schema::table('site_footer', function (Blueprint $table) use ($column) {
                    $table->dropColumn($column);
                });
            }
        }
    }

    public function down(): void
    {
        // Restore legacy columns only when missing.
        $columns = [
            'kind' => fn (Blueprint $table) =>
                $table->string('kind', 32)->default('settings'),
            'platform' => fn (Blueprint $table) =>
                $table->string('platform', 50)->nullable(),
            'url' => fn (Blueprint $table) =>
                $table->string('url', 500)->nullable(),
            'info_label' => fn (Blueprint $table) =>
                $table->string('info_label', 120)->nullable(),
            'info_value' => fn (Blueprint $table) =>
                $table->text('info_value')->nullable(),
            'info_icon' => fn (Blueprint $table) =>
                $table->string('info_icon', 40)->nullable(),
            'sort_order' => fn (Blueprint $table) =>
                $table->unsignedInteger('sort_order')->default(0),
        ];

        foreach ($columns as $column => $definition) {
            if (!Schema::hasColumn('site_footer', $column)) {
                Schema::table('site_footer', function (Blueprint $table) use ($definition) {
                    $definition($table);
                });
            }
        }

        if (
            Schema::hasColumn('site_footer', 'kind') &&
            Schema::hasColumn('site_footer', 'is_active') &&
            Schema::hasColumn('site_footer', 'sort_order')
        ) {
            Schema::table('site_footer', function (Blueprint $table) {
                $table->index(
                    ['kind', 'is_active', 'sort_order'],
                    'site_footer_kind_is_active_sort_order_index'
                );
            });
        }

        if (Schema::hasColumn('site_footer', 'social_links')) {
            Schema::table('site_footer', function (Blueprint $table) {
                $table->dropColumn('social_links');
            });
        }

        if (Schema::hasColumn('site_footer', 'location_info')) {
            Schema::table('site_footer', function (Blueprint $table) {
                $table->dropColumn('location_info');
            });
        }
    }

    private function migrateRowsIntoJson(): void
    {
        // Nothing to migrate if the legacy column is already removed.
        if (!Schema::hasColumn('site_footer', 'kind')) {
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

        $socialJson = $socialRows->map(fn ($row) => [
            'id' => (int) $row->id,
            'platform' => $row->platform,
            'url' => $row->url,
            'sort_order' => (int) $row->sort_order,
            'is_active' => true,
        ])->values()->all();

        $locationJson = $locationRows->map(fn ($row) => [
            'id' => (int) $row->id,
            'info_label' => $row->info_label,
            'info_value' => $row->info_value,
            'info_icon' => $row->info_icon,
            'sort_order' => (int) $row->sort_order,
            'is_active' => true,
        ])->values()->all();

        if ($settings) {
            DB::table('site_footer')
                ->where('id', $settings->id)
                ->update([
                    'social_links' => json_encode($socialJson),
                    'location_info' => json_encode($locationJson),
                    'updated_at' => now(),
                ]);

            // Remove legacy rows only after collecting their data.
            DB::table('site_footer')
                ->where('id', '!=', $settings->id)
                ->delete();

            return;
        }

        // If no settings row exists, create one using the legacy schema.
        DB::table('site_footer')->insert([
            'kind' => 'settings',
            'intro_paragraph' => null,
            'social_links' => json_encode($socialJson),
            'location_info' => json_encode($locationJson),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
};
