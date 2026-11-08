<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('about_intro')) {
            return;
        }

        if (
            Schema::hasColumn('about_intro', 'about_paragraph_2')
            && ! Schema::hasColumn('about_intro', 'paragraph_2')
        ) {
            Schema::table('about_intro', function (Blueprint $table) {
                $table->renameColumn('about_paragraph_2', 'paragraph_2');
            });
        } elseif (
            Schema::hasColumn('about_intro', 'about_paragraph_2')
            && Schema::hasColumn('about_intro', 'paragraph_2')
        ) {
            \Illuminate\Support\Facades\DB::table('about_intro')
                ->whereNull('paragraph_2')
                ->whereNotNull('about_paragraph_2')
                ->update([
                    'paragraph_2' => \Illuminate\Support\Facades\DB::raw('about_paragraph_2'),
                ]);
            Schema::table('about_intro', function (Blueprint $table) {
                $table->dropColumn('about_paragraph_2');
            });
        }

        $drop = array_filter([
            Schema::hasColumn('about_intro', 'home_button_label') ? 'home_button_label' : null,
            Schema::hasColumn('about_intro', 'home_button_url') ? 'home_button_url' : null,
        ]);

        if ($drop !== []) {
            Schema::table('about_intro', function (Blueprint $table) use ($drop) {
                $table->dropColumn($drop);
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('about_intro')) {
            return;
        }

        if (
            Schema::hasColumn('about_intro', 'paragraph_2')
            && ! Schema::hasColumn('about_intro', 'about_paragraph_2')
        ) {
            Schema::table('about_intro', function (Blueprint $table) {
                $table->renameColumn('paragraph_2', 'about_paragraph_2');
            });
        }

        Schema::table('about_intro', function (Blueprint $table) {
            if (! Schema::hasColumn('about_intro', 'home_button_label')) {
                $table->string('home_button_label', 120)->nullable();
            }
            if (! Schema::hasColumn('about_intro', 'home_button_url')) {
                $table->string('home_button_url', 500)->nullable();
            }
        });
    }
};
