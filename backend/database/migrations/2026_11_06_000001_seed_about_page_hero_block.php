<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('about_content_blocks')) {
            return;
        }

        DB::table('about_content_blocks')->updateOrInsert(
            ['section_key' => 'hero'],
            [
                'eyebrow' => 'THE SOUL OF PACIANO',
                'heading_line_1' => 'Where Nature Whispers,',
                'heading_line_2' => null,
                'heading_accent' => 'Luxury Lingers.',
                'body_text' => 'An intimate escape where refined comfort, natural beauty, and thoughtful hospitality come together in perfect harmony.',
                'updated_at' => now(),
                'created_at' => now(),
            ],
        );
    }

    public function down(): void
    {
        if (! Schema::hasTable('about_content_blocks')) {
            return;
        }

        DB::table('about_content_blocks')->where('section_key', 'hero')->delete();
    }
};
