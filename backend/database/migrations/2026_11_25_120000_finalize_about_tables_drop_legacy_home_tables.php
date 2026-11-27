<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Remove legacy home_* about tables superseded by about_* names (migration 2026_11_04).
     */
    public function up(): void
    {
        $pairs = [
            ['legacy' => 'home_about_sections', 'current' => 'about_intro'],
            ['legacy' => 'home_experience_sections', 'current' => 'about_experience_sections'],
            ['legacy' => 'home_experience_items', 'current' => 'about_experience_items'],
        ];

        foreach ($pairs as $pair) {
            $legacy = $pair['legacy'];
            $current = $pair['current'];

            if (! Schema::hasTable($legacy)) {
                continue;
            }

            if (! Schema::hasTable($current)) {
                Schema::rename($legacy, $current);

                continue;
            }

            Schema::dropIfExists($legacy);
        }
    }

    public function down(): void
    {
        // Legacy tables are not restored; use 2026_11_04 down() if needed.
    }
};