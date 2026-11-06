<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('home_stay_items', function (Blueprint $table) {
            $table->string('button_descriptor', 120)->nullable()->after('menu_label');
            $table->string('photo_label', 120)->nullable()->after('title');
        });
    }

    public function down(): void
    {
        Schema::table('home_stay_items', function (Blueprint $table) {
            $table->dropColumn(['button_descriptor', 'photo_label']);
        });
    }
};
