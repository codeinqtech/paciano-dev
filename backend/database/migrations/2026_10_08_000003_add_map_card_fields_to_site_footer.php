<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_footer', function (Blueprint $table) {
            $table->string('map_title', 200)->nullable()->after('map_longitude');
            $table->string('map_subtitle', 200)->nullable()->after('map_title');
            $table->text('map_description')->nullable()->after('map_subtitle');
        });
    }

    public function down(): void
    {
        Schema::table('site_footer', function (Blueprint $table) {
            $table->dropColumn(['map_title', 'map_subtitle', 'map_description']);
        });
    }
};
