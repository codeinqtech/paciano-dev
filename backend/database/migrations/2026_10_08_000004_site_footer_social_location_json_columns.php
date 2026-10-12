
public function up(): void
{
    // Add only columns that do not already exist.
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

    // Preserve legacy data before dropping old columns.
    $this->migrateRowsIntoJson();

    // Remove the old index only if the legacy columns exist.
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

private function migrateRowsIntoJson(): void
{
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
        DB::table('site_footer')
            ->where('id', $settings->id)
            ->update([
                'social_links' => json_encode($socialJson),
                'location_info' => json_encode($locationJson),
            ]);

        DB::table('site_footer')
            ->where('id', '!=', $settings->id)
            ->delete();
    } else {
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
}
